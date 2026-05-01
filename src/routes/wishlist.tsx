import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";
import { loadProducts } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/wishlist")({
  loader: async () => ({ products: await loadProducts() }),
  head: () => ({
    meta: [
      { title: "Wishlist — SHAKEN" },
      { name: "description", content: "Your saved SHAKEN cocktail-inspired pieces." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { products } = Route.useLoaderData();
  const { wishlist } = useCart();
  const items = products.filter((p) => wishlist.includes(p.slug));

  return (
    <div className="bg-olive text-cream">
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-24">
        <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">Saved for later</p>
        <h1 className="font-serif text-5xl lg:text-7xl mb-16">The Wishlist</h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif italic text-3xl mb-6">Nothing saved yet.</p>
            <Link to="/shop" className="btn-primary">Explore the Collection</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-14">
            {items.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
