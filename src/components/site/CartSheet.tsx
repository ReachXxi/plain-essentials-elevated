import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { cartMessage, lineKey, lineSubtotal, ngn, usd, whatsappLink } from "@/lib/site";
import { placeOrder } from "@/lib/plain.functions";

export function CartSheet() {
  const { cart, cartOpen, setCartOpen, setQty, removeFromCart, clearCart, cartTotal, settings } =
    useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);

  const checkout = async () => {
    if (cart.length === 0) return;
    setSending(true);
    try {
      await placeOrder({
        data: {
          customer_name: name.trim().slice(0, 120),
          phone: phone.trim().slice(0, 40),
          note: "",
          items: cart as unknown as Record<string, unknown>[],
          total_usd: Number(cartTotal.toFixed(2)),
          total_ngn: Math.round(cartTotal * settings.usdToNgn),
        },
      });
    } catch {
      toast.error("Could not record the order, opening WhatsApp anyway.");
    }
    const msg =
      cartMessage(cart, settings.usdToNgn, settings.brand) +
      (name ? `\nName: ${name}` : "") +
      (phone ? `\nPhone: ${phone}` : "");
    window.open(whatsappLink(settings.whatsapp, msg), "_blank", "noopener");
    clearCart();
    setSending(false);
    setCartOpen(false);
    toast.success("Order sent to WhatsApp");
  };

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your bag</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {cart.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Your bag is empty.
            </p>
          ) : (
            cart.map((l) => (
              <div key={lineKey(l)} className="flex gap-3 border-b py-4">
                <img
                  src={l.image}
                  alt={l.name}
                  className="h-24 w-20 shrink-0 object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{l.name}</p>
                  <p className="font-accent text-[9px] text-muted-foreground">
                    {l.size} / {l.color}
                  </p>
                  <p className="mt-1 font-accent text-xs">{usd(lineSubtotal(l))}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      aria-label="Decrease"
                      onClick={() => setQty(lineKey(l), l.qty - 1)}
                      className="border p-1"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{l.qty}</span>
                    <button
                      aria-label="Increase"
                      onClick={() => setQty(lineKey(l), l.qty + 1)}
                      className="border p-1"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      aria-label="Remove"
                      onClick={() => removeFromCart(lineKey(l))}
                      className="ml-auto text-muted-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 border-t p-4">
          <div className="flex items-center justify-between">
            <span className="font-accent text-[10px] text-muted-foreground">Total</span>
            <div className="text-right">
              <p className="font-display text-2xl">{usd(cartTotal)}</p>
              <p className="font-accent text-[10px] text-muted-foreground">
                {ngn(cartTotal, settings.usdToNgn)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Your name"
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Phone"
              value={phone}
              maxLength={40}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button
            className="h-12 w-full font-accent text-[11px]"
            disabled={cart.length === 0 || sending}
            onClick={checkout}
          >
            {sending ? "Sending…" : "Clear cart & order on WhatsApp"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
