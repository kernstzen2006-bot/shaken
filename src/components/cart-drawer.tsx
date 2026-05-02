import { X, Minus, Plus } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/products";

export function CartDrawer() {
  const navigate = useNavigate();
  const { isOpen, close, items, updateQty, remove, subtotal } = useCart();
  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "visible" : "invisible"}`}>
      <div
        className={`absolute inset-0 bg-espresso/50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[460px] bg-cream flex flex-col transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center px-8 py-6 border-b border-espresso/10">
          <h3 className="font-serif text-2xl">Your Bag</h3>
          <button onClick={close} aria-label="Close cart"><X className="h-5 w-5" /></button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <p className="font-serif text-3xl italic mb-3">Your bag is empty</p>
            <p className="text-sm text-muted-foreground mb-8">Time to mix something beautiful.</p>
            <Link to="/shop" onClick={close} className="btn-primary">Explore the Collection</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {items.map((item) => (
                <div key={item.slug + item.size} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-24 object-cover" />
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="font-serif text-lg leading-tight">{item.name}</p>
                        <p className="text-[11px] uppercase tracking-luxe text-muted-foreground mt-1">Size {item.size}</p>
                      </div>
                      <p className="text-sm">{formatPrice(item.price * item.qty)}</p>
                    </div>
                    <div className="mt-auto flex justify-between items-center">
                      <div className="flex items-center border border-espresso/20">
                        <button onClick={() => updateQty(item.slug, item.size, item.qty - 1)} className="p-2"><Minus className="h-3 w-3" /></button>
                        <span className="px-3 text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.slug, item.size, item.qty + 1)} className="p-2"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button onClick={() => remove(item.slug, item.size)} className="text-[11px] uppercase tracking-luxe text-muted-foreground hover:text-coral">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-espresso/10 px-8 py-6 space-y-4">
              <div className="flex justify-between font-serif text-xl">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Shipping & taxes calculated at checkout.</p>
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => {
                  close();
                  void navigate({ to: "/checkout" });
                }}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
