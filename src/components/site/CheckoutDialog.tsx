import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Loader2, ShieldCheck, Timer, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { preorderUploadUrl, submitPreorder } from "@/lib/plain.functions";
import { useStore } from "@/lib/store";
import { lineKey, lineSubtotal, ngn, usd } from "@/lib/site";

type Step = "details" | "transfer" | "receipt" | "done";

export function CheckoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { cart, cartTotal, clearCart, settings, setCartOpen } = useStore();
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [seconds, setSeconds] = useState((settings.preorderMinutes || 30) * 60);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [reference, setReference] = useState("");
  const [copied, setCopied] = useState(false);

  const totalNgn = Math.round(cartTotal * settings.usdToNgn);

  useEffect(() => {
    if (!open) {
      setStep("details");
      setReceipt(null);
      setSeconds((settings.preorderMinutes || 30) * 60);
    }
  }, [open, settings.preorderMinutes]);

  useEffect(() => {
    if (step !== "transfer") return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(t);
          toast.error("Transfer window expired — please start again");
          setStep("details");
          return (settings.preorderMinutes || 30) * 60;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step, settings.preorderMinutes]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(settings.bankAccount);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed — please type the number");
    }
  };

  const goTransfer = () => {
    if (!name.trim() || phone.replace(/\D/g, "").length < 7 || address.trim().length < 3) {
      toast.error("Please add your name, WhatsApp number and delivery address");
      return;
    }
    setSeconds((settings.preorderMinutes || 30) * 60);
    setStep("transfer");
  };

  const submit = async () => {
    if (!receipt) {
      toast.error("Please attach your transfer receipt");
      return;
    }
    if (receipt.size > 8_000_000) {
      toast.error("Receipt must be under 8MB");
      return;
    }
    setBusy(true);
    try {
      const { path, token, url } = await preorderUploadUrl({
        data: { filename: receipt.name },
      });
      const { error } = await supabase.storage
        .from("media")
        .uploadToSignedUrl(path, token, receipt, { contentType: receipt.type });
      if (error) throw error;
      const res = await submitPreorder({
        data: {
          customer_name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          note: note.trim(),
          items: cart as unknown as Record<string, unknown>[],
          total_usd: Number(cartTotal.toFixed(2)),
          total_ngn: totalNgn,
          receipt_url: url,
          is_preorder: false,
        },
      });
      setReference(res.reference);
      clearCart();
      setCartOpen(false);
      setStep("done");
    } catch {
      toast.error("Could not submit your order. Please try again.");
    }
    setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogTitle className="font-display text-2xl">
          {step === "done" ? "Order received" : "Secure checkout"}
        </DialogTitle>

        {step === "details" && (
          <div className="space-y-4">
            <div className="space-y-2 border bg-secondary/40 p-3">
              {cart.map((l) => (
                <div key={lineKey(l)} className="flex items-center gap-3 text-sm">
                  {l.image && <img src={l.image} alt="" className="h-14 w-11 object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{l.name}</p>
                    <p className="font-accent text-[10px] text-muted-foreground">
                      {l.size} / {l.color} · x{l.qty}
                    </p>
                  </div>
                  <p className="font-accent text-[11px]">{usd(lineSubtotal(l))}</p>
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-2">
                <span className="font-accent text-[10px] text-muted-foreground">Total</span>
                <span className="font-display text-xl">
                  {usd(cartTotal)} · {ngn(cartTotal, settings.usdToNgn)}
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="font-accent text-[10px]">Full name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label className="font-accent text-[10px]">WhatsApp number</Label>
                <Input
                  value={phone}
                  placeholder="0907 447 3570"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="font-accent text-[10px]">Delivery address</Label>
              <Textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label className="font-accent text-[10px]">Note (optional)</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <Button
              className="h-11 w-full font-accent text-[11px]"
              disabled={cart.length === 0}
              onClick={goTransfer}
            >
              Continue to payment
            </Button>
          </div>
        )}

        {step === "transfer" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 border bg-secondary/40 p-3 font-accent text-sm">
              <Timer className="h-4 w-4" />
              Complete transfer within {mm}:{ss}
            </div>
            <div className="space-y-2 border p-5 text-center">
              <p className="font-accent text-[10px] text-muted-foreground">Transfer exactly</p>
              <p className="font-display text-4xl">{ngn(cartTotal, settings.usdToNgn)}</p>
              <div className="pt-3 text-sm">
                <p className="font-accent text-[10px] text-muted-foreground">{settings.bankName}</p>
                <p className="font-display text-2xl tracking-wide">{settings.bankAccount}</p>
                <p className="font-accent text-[10px]">{settings.bankAccountName}</p>
              </div>
              <Button
                variant="outline"
                className="mt-3 font-accent text-[10px]"
                onClick={() => void copyAccount()}
              >
                {copied ? <Check className="mr-2 h-3 w-3" /> : <Copy className="mr-2 h-3 w-3" />}
                Copy account number
              </Button>
            </div>
            <Button
              className="h-11 w-full font-accent text-[11px]"
              onClick={() => setStep("receipt")}
            >
              I've paid
            </Button>
            <button
              className="w-full font-accent text-[10px] underline opacity-70"
              onClick={() => setStep("details")}
            >
              Back to details
            </button>
          </div>
        )}

        {step === "receipt" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload your transfer receipt so we can verify your payment.
            </p>
            <label className="flex cursor-pointer flex-col items-center gap-2 border border-dashed p-8 text-center">
              <Upload className="h-5 w-5" />
              <span className="font-accent text-[10px]">
                {receipt ? receipt.name : "Choose screenshot or PDF"}
              </span>
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
              />
            </label>
            <Button
              className="h-11 w-full font-accent text-[11px]"
              disabled={busy}
              onClick={() => void submit()}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit order
            </Button>
            <button
              className="w-full font-accent text-[10px] underline opacity-70"
              onClick={() => setStep("transfer")}
            >
              Back
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4 py-4 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-accent" />
            <h3 className="font-display text-2xl">Order submitted — payment under review</h3>
            <p className="text-sm text-muted-foreground">
              Thanks for shopping {settings.brand}! Your order {reference} has been received and we
              are verifying your payment. We'll reach you on WhatsApp with delivery details once
              validated.
            </p>
            <Button
              className="h-11 w-full font-accent text-[11px]"
              onClick={() => onOpenChange(false)}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
