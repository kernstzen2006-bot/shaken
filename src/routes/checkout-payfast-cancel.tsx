import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout-payfast-cancel")({
  head: () => ({
    meta: [{ title: "Payment cancelled — SHAKEN" }],
  }),
  component: PayFastCancelPage,
});

function PayFastCancelPage() {
  return (
    <div className="min-h-screen bg-olive text-cream flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">PayFast</p>
        <h1 className="font-serif text-5xl lg:text-6xl leading-tight">
          Checkout <em className="italic">paused</em>
        </h1>
        <p className="mt-6 text-cream/80 font-serif italic text-lg leading-relaxed">
          You cancelled before completing payment. Your bag is still here whenever you&apos;re ready.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/checkout" className="btn-primary">
            Back to checkout
          </Link>
          <Link to="/shop" className="btn-outline border-cream text-cream hover:bg-cream hover:text-espresso">
            Shop collection
          </Link>
        </div>
      </div>
    </div>
  );
}
