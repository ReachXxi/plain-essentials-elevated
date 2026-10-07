import { useEffect, useState } from "react";
import { Copy, Gift, X } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { trackEvent } from "@/lib/plain.functions";
import { promoSegmentsOf } from "@/lib/site";

const SESSION_KEY = "plain_promo_seen";
const DAILY_KEY = "plain_promo_last";
const CLAIM_KEY = "plain_promo_claim";

type Claim = { code: string; percent: number; expires: number };

function readClaim(): Claim | null {
  try {
    const c = JSON.parse(localStorage.getItem(CLAIM_KEY) || "null") as Claim | null;
    return c && c.expires > Date.now() ? c : null;
  } catch {
    return null;
  }
}

export function PromoSpin() {
  const { settings } = useStore();
  const enabled = settings.promoEnabled ?? true;
  const frequency = settings.promoFrequency ?? "session";
  const segs = promoSegmentsOf(settings);
  const minutes = settings.promoMinutes ?? 15;

  const [open, setOpen] = useState(false);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [noWin, setNoWin] = useState("");

  useEffect(() => {
    if (!enabled) return;
    const existing = readClaim();
    setClaim(existing);
    if (frequency === "session" && sessionStorage.getItem(SESSION_KEY)) return;
    if (frequency === "daily" && Date.now() - Number(localStorage.getItem(DAILY_KEY) || 0) < 86_400_000) return;
    if (!existing) localStorage.removeItem(CLAIM_KEY);
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, "1");
      localStorage.setItem(DAILY_KEY, String(Date.now()));
      void trackEvent({ data: { kind: "view", label: "promo:impression" } }).catch(() => {});
    }, 2200);
    return () => clearTimeout(t);
  }, [enabled, frequency]);

  useEffect(() => {
    if (!claim) return;
    const i = setInterval(() => {
      setNow(Date.now());
      if (claim.expires <= Date.now()) {
        localStorage.removeItem(CLAIM_KEY);
        setClaim(null);
      }
    }, 1000);
    return () => clearInterval(i);
  }, [claim]);

  if (!enabled) return null;

  const n = segs.length;
  const slice = 360 / n;
  const [missed, setMissed] = [noWin, setNoWin];

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    void trackEvent({ data: { kind: "click", label: "promo:spin" } }).catch(() => {});
    // Weighted pick by each slice's priority; zero total weight falls back to equal odds.
    const weights = segs.map((g) => Math.max(0, Number(g.weight) || 0));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * (total || n);
    let idx = 0;
    for (; idx < n - 1; idx++) {
      r -= total ? weights[idx] : 1;
      if (r < 0) break;
    }
    const win = segs[idx];
    const base = rotation - (rotation % 360);
    setRotation(base + 360 * 6 + (360 - (idx * slice + slice / 2)) + (Math.random() - 0.5) * slice * 0.5);
    setTimeout(() => {
      setSpinning(false);
      if (!win.code || !(win.percent > 0)) {
        setMissed(win.label);
        return;
      }
      setMissed("");
      const c = { code: win.code, percent: win.percent, expires: Date.now() + minutes * 60_000 };
      localStorage.setItem(CLAIM_KEY, JSON.stringify(c));
      void trackEvent({ data: { kind: "click", label: "promo:claim" } }).catch(() => {});
      setClaim(c);
      setNow(Date.now());
    }, 4200);
  };

  const left = claim ? Math.max(0, claim.expires - now) : 0;
  const mm = String(Math.floor(left / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(claim?.code || "");
      toast.success("Code copied — it auto-applies at checkout");
    } catch {
      toast(claim?.code || "");
    }
  };

  return (
    <>
      {claim && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 left-5 z-50 flex items-center gap-2 border border-accent bg-ink px-4 py-3 font-accent text-[10px] text-ink-foreground shadow-lg animate-in slide-in-from-bottom-4"
        >
          <Gift className="h-4 w-4 text-accent" />
          {claim.percent}% OFF reserved · <span className="tabular-nums text-accent">{mm}:{ss}</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md border border-accent/50 bg-ink p-6 text-center text-ink-foreground shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 text-ink-foreground/60 hover:text-ink-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="font-accent text-[10px] text-accent">{settings.brand} SOCIETY</p>
            <h2 className="mt-2 font-display text-2xl leading-tight">
              {claim ? "Your reward is unlocked" : settings.promoHeadline || "Your welcome gift is almost unlocked"}
            </h2>

            {!claim && (
              <div className="mt-4">
                <div className="mb-1 flex justify-between font-accent text-[10px] text-ink-foreground/70">
                  <span>Welcome tier</span>
                  <span className="text-accent">98%</span>
                </div>
                <div className="h-1.5 w-full bg-ink-foreground/15">
                  <div className="h-full w-[98%] bg-accent" />
                </div>
              </div>
            )}

            {!claim ? (
              <>
                <div className="relative mx-auto mt-6 h-64 w-64">
                  <div className="absolute left-1/2 top-[-6px] z-10 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[16px] border-x-transparent border-t-accent" />
                  <div
                    className="h-full w-full rounded-full border-4 border-accent"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)",
                      background: `conic-gradient(${segs
                        .map(
                          (_, i) =>
                            `${i % 2 ? "var(--ink)" : "var(--accent)"} ${i * slice}deg ${(i + 1) * slice}deg`,
                        )
                        .join(",")})`,
                    }}
                  >
                    {segs.map((g, i) => (
                      <span
                        key={i}
                        className={`absolute left-1/2 top-1/2 origin-left font-accent text-[10px] ${i % 2 ? "text-accent" : "text-ink"}`}
                        style={{ transform: `rotate(${i * slice + slice / 2 - 90}deg) translateX(40px)` }}
                      >
                        {g.label}
                      </span>
                    ))}
                  </div>
                  <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-ink" />
                </div>
                <button
                  onClick={spin}
                  disabled={spinning}
                  className="mt-6 w-full bg-accent py-3 font-accent text-xs text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  {spinning ? "Spinning…" : missed ? "Spin again" : "Spin to unlock"}
                </button>
                <p className="mt-3 text-[11px] text-ink-foreground/60">
                  {missed ? `You landed on ${missed} — give it another spin!` : "Spin for your reward."}
                </p>
              </>
            ) : (
              <>
                <p className="mt-4 font-display text-5xl text-accent">{claim.percent}% OFF</p>
                <p className="mt-1 text-sm text-ink-foreground/70">your first piece</p>
                <button
                  onClick={copy}
                  className="mx-auto mt-5 flex items-center gap-2 border border-dashed border-accent px-5 py-3 font-accent text-sm tracking-widest"
                >
                  {claim.code} <Copy className="h-4 w-4 text-accent" />
                </button>
                <p className="mt-5 font-accent text-[10px] text-ink-foreground/70">Reserved for you</p>
                <p className="font-display text-3xl tabular-nums">{mm}:{ss}</p>
                <a
                  href="/collection"
                  onClick={() => setOpen(false)}
                  className="mt-5 block w-full bg-accent py-3 font-accent text-xs text-accent-foreground"
                >
                  Shop now
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
