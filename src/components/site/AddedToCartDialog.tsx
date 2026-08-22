import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export function AddedToCartDialog() {
  const { lastAdded, dismissLastAdded, setCartOpen } = useStore();

  return (
    <Dialog open={!!lastAdded} onOpenChange={(o) => !o && dismissLastAdded()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Added to your bag</DialogTitle>
        </DialogHeader>
        {lastAdded && (
          <div className="flex gap-3">
            <img
              src={lastAdded.image}
              alt={lastAdded.name}
              className="h-24 w-20 object-cover"
            />
            <div>
              <p className="text-sm font-medium">{lastAdded.name}</p>
              <p className="font-accent text-[9px] text-muted-foreground">
                {lastAdded.size} / {lastAdded.color} × {lastAdded.qty}
              </p>
            </div>
          </div>
        )}
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Button
            className="h-11 font-accent text-[10px]"
            onClick={() => {
              dismissLastAdded();
              setCartOpen(true);
            }}
          >
            Go to Cart
          </Button>
          <Button
            variant="outline"
            className="h-11 font-accent text-[10px]"
            onClick={dismissLastAdded}
          >
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
