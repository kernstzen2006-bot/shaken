import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-store";

export const Route = createFileRoute("/checkout-payfast-return")({
  head: () => ({
    meta: [{ title: "Payment complete — SHAKEN" }],
  }),
  component: PayFastReturnPage,
});

function PayFastReturnPage() {
  const { clear, close } = useCart();
  const [statusHint, setStatusHint] = useState<string | null>(null);

  useEffect(() => {
    close();
    clear();
    const q = new URLSearchParams(window.location.search);
    setStatusHint(q.get("payment_status") ?? q.get("pf_payment_status"));
  }, [clear, close]);

  return (
    <div className="min-h-screen bg-olive text-cream flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">PayFast</p>
        <h1 className="font-serif text-5xl lg:text-6xl leading-tight">
          Payment <em className="italic">received</em>
        </h1>
        <p className="mt-6 text-cream/80 font-serif italic text-lg leading-relaxed">
          Thanks — your transaction went through PayFast. We&apos;ll confirm your order by email and start pouring your pieces from our Cape Town studio.
        </p>
        {statusHint && (
          <p className="mt-6 text-[11px] uppercase tracking-luxe text-cream/55">
            Gateway status · {statusHint}
          </p>
        )}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/shop" className="btn-primary">
            Continue shopping
          </Link>
          <Link to="/" className="btn-outline border-cream text-cream hover:bg-cream hover:text-espresso">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
