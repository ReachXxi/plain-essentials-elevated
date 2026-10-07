import { useEffect, useState } from "react";
import { Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { trackEvent } from "@/lib/plain.functions";
import { findPromo } from "@/lib/site";

export const CLAIM_KEY = "plain_promo_claim";

export function readClaimCode(): string {
  try {
    const c = JSON.parse(localStorage.getItem(CLAIM_KEY) || "null") as
      | { code: string; expires: number }
      | null;
    return c && c.expires > Date.now() ? c.code : "";
  } catch {
    return "";
  }
}

/** Coupon state for checkout; auto-applies a code claimed from the spin wheel. */
export function usePromo(subtotal: number) {
  const { settings } = useStore();
  const enabled = settings.promoEnabled ?? true;
  const [applied, setApplied] = useState("");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const seg = enabled ? findPromo(settings, readClaimCode()) : null;
    if (seg) {
      setApplied(seg.code.toUpperCase());
      setPct(seg.percent);
    }
  }, [enabled, settings]);

  const percent = applied ? pct : 0;
  const discount = Number(((subtotal * percent) / 100).toFixed(2));
  const apply = (input: string) => {
    const seg = enabled ? findPromo(settings, input) : null;
    if (seg) {
      setApplied(seg.code.toUpperCase());
      setPct(seg.percent);
      void trackEvent({ data: { kind: "click", label: "promo:applied" } }).catch(() => {});
      return true;
    }
    return false;
  };
  return { applied, percent, discount, total: subtotal - discount, apply, clear: () => setApplied("") };
}

export function PromoCodeField({ promo }: { promo: ReturnType<typeof usePromo> }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  if (promo.applied) {
    return (
      <div className="flex items-center justify-between border border-accent/60 bg-accent/10 px-3 py-2 font-accent text-[10px]">
        <span className="flex items-center gap-2">
          <Tag className="h-3 w-3 text-accent" /> {promo.applied} applied · -{promo.percent}%
        </span>
        <button onClick={promo.clear} aria-label="Remove code">
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="flex gap-2">
        <Input
          placeholder="Promo code"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="font-accent text-[10px]"
          onClick={() => (promo.apply(value) ? setValue("") : setError("Invalid or expired code"))}
        >
          Apply
        </Button>
      </div>
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
