import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "~/components/ui/sheet";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, Loader2 } from "lucide-react";

type CartLine = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  available?: number;
};

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartLine[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onPurchase: () => void | Promise<void>;
  isPurchasing?: boolean;
};

const currency = (n: number) => `$${n.toFixed(2)}`;

const CartSheet: React.FC<CartSheetProps> = ({
  open,
  onOpenChange,
  items,
  onIncrement,
  onDecrement,
  onRemove,
  onPurchase,
  isPurchasing,
}) => {
  const totalQty = React.useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const total = React.useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 sm:max-w-md">
        <SheetHeader className="p-4 px-5 text-left border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart
              </SheetTitle>
              <SheetDescription>Your selected sweets</SheetDescription>
            </div>
            <Badge variant="secondary">{totalQty} items</Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground h-full grid place-items-center">
              Your cart is empty.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => {
                const atMax = it.available !== undefined && it.quantity >= it.available;
                return (
                  <div key={it.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{it.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {currency(it.price)} each
                          {typeof it.available === "number" && (
                            <span className="ml-2">
                              • Stock: <span className="tabular-nums">{it.available}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(it.id)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDecrement(it.id)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="w-8 text-center tabular-nums">{it.quantity}</div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onIncrement(it.id)}
                          aria-label="Increase quantity"
                          disabled={atMax}
                          title={atMax ? "No more stock available" : undefined}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-sm">
                        Subtotal:{" "}
                        <span className="font-medium">
                          {currency(it.price * it.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <SheetFooter className="border-t">
          <div className="w-full p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-semibold">{currency(total)}</span>
            </div>
            <Button
              className="w-full"
              disabled={items.length === 0 || isPurchasing}
              onClick={onPurchase}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Purchase"
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;