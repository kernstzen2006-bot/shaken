import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { loadProduct, loadProducts, formatPrice, sizes } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const [product, products] = await Promise.all([loadProduct(params.slug), loadProducts()]);
    if (!product) throw notFound();
    return { product, products };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.product.name} — SHAKEN` },
      { name: "description", content: loaderData.product.description },
      { property: "og:title", content: `${loaderData.product.name} — SHAKEN` },
      { property: "og:description", content: loaderData.product.description },
      { property: "og:image", content: loaderData.product.image },
    ] : [],
  }),
  notFoundComponent: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="font-serif italic text-3xl">Cocktail not found.</p>
        <Link to="/shop" className="btn-primary mt-6">Back to the menu</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => <div className="p-12 text-center">{error.message}</div>,
  component: ProductPage,
});

function ProductPage() {
  const { product, products } = Route.useLoaderData();
  const { add, toggleWish, wishlist } = useCart();
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "care" | "ship">("desc");
  const [activeImg, setActiveImg] = useState(product.image);

  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);
  const wished = wishlist.includes(product.slug);
  const gallery = [product.image, product.altImage].filter(Boolean) as string[];

  return (
    <div className="bg-olive text-cream">
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 pt-12 lg:pt-16 grid lg:grid-cols-2 gap-12 lg:gap-20">
        <div>
          <div className="aspect-[4/5] overflow-hidden bg-secondary group">
            <img src={activeImg} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-3 mt-4">
              {gallery.map((g) => (
                <button key={g} onClick={() => setActiveImg(g)} className={`w-20 aspect-[4/5] overflow-hidden border-2 ${activeImg === g ? "border-coral" : "border-transparent"}`}>
                  <img src={g} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pt-8">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-luxe text-coral mb-4">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: product.dotColor }} />
            Inspired by the {product.cocktail}
          </div>
          <h1 className="font-serif text-5xl lg:text-6xl leading-none">{product.name}</h1>
          <p className="font-serif text-2xl mt-6">{formatPrice(product.price)}</p>
          <p className="mt-8 font-serif italic text-xl leading-relaxed text-foreground/85 max-w-md text-balance">
            {product.description}
          </p>

          <div className="mt-10">
            <div className="flex justify-between items-center mb-3 text-[11px] uppercase tracking-luxe">
              <span>Size</span>
              <button className="text-muted-foreground link-underline">Size guide</button>
            </div>
            <div className="flex gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`h-12 w-12 border text-xs font-medium tracking-wider transition ${
                    size === s ? "bg-espresso text-cream border-espresso" : "border-espresso/30 hover:border-espresso"
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-espresso/30">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3"><Minus className="h-3 w-3" /></button>
              <span className="px-4 text-sm">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3"><Plus className="h-3 w-3" /></button>
            </div>
            <button onClick={() => add(product, size, qty)} className="btn-primary flex-1">Add to Bag</button>
          </div>
          <button onClick={() => toggleWish(product.slug)} className="btn-outline w-full mt-3 flex gap-2">
            <Heart className={`h-4 w-4 ${wished ? "fill-coral text-coral" : ""}`} />
            {wished ? "In Wishlist" : "Add to Wishlist"}
          </button>

          {/* TABS */}
          <div className="mt-14 border-t border-espresso/10">
            <div className="flex gap-8 text-[11px] uppercase tracking-luxe pt-6">
              {([["desc", "Description"], ["care", "Care"], ["ship", "Shipping"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`pb-2 ${tab === k ? "text-coral border-b border-coral" : "text-muted-foreground"}`}>{l}</button>
              ))}
            </div>
            <div className="py-6 text-sm leading-relaxed text-foreground/80 max-w-lg">
              {tab === "desc" && <p>Handmade in our Cape Town studio from premium Italian nylon-Lycra. Chlorine and UV resistant. Fully lined. Signature gold-tone hardware. Made to order in 7–14 days.</p>}
              {tab === "care" && <p>Hand wash cold with mild soap. Do not tumble dry — lay flat in shade. Rinse before swimming if wearing sunscreen, SPF and oils may stain.</p>}
              {tab === "ship" && <p>Free shipping across South Africa on orders over R800. International shipping available at checkout. Custom orders ship within 14–21 working days.</p>}
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section className="max-w-[1600px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <h2 className="font-serif text-4xl lg:text-5xl mb-12">You might also like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
          {related.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>
    </div>
  );
}
