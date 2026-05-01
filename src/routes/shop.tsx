import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { loadProducts, sizes, styles } from "@/lib/products";
import editorial from "@/assets/editorial-1.jpg";

export const Route = createFileRoute("/shop")({
  loader: async () => ({ products: await loadProducts() }),
  head: () => ({
    meta: [
      { title: "The Collection — SHAKEN Swimwear" },
      { name: "description", content: "Shop our handmade cocktail-inspired bikini collection. Each piece named after an iconic drink." },
      { property: "og:title", content: "The Collection — SHAKEN" },
      { property: "og:description", content: "Cocktail-inspired bikinis, handmade in South Africa." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { products } = Route.useLoaderData();
  const [cocktail, setCocktail] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [sort, setSort] = useState<"newest" | "lo" | "hi">("newest");

  const cocktailFilters = useMemo(
    () => Array.from(new Set(products.map((product) => product.cocktail))),
    [products],
  );

  const filtered = useMemo(() => {
    let list = [...products];
    if (cocktail) list = list.filter((p) => p.cocktail === cocktail);
    if (style) list = list.filter((p) => p.style === style);
    if (sort === "lo") list.sort((a, b) => a.price - b.price);
    if (sort === "hi") list.sort((a, b) => b.price - a.price);
    return list;
  }, [cocktail, style, sort, products]);

  return (
    <>
      <section className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <img src={editorial} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-espresso/25" />
        <div className="relative z-10 h-full flex flex-col justify-end px-6 lg:px-16 pb-16 max-w-[1600px] mx-auto">
          <p className="text-cream/85 text-[11px] uppercase tracking-luxe mb-4">Summer 26</p>
          <h1 className="font-serif text-[clamp(3rem,8vw,6rem)] leading-none text-cream">The Collection</h1>
        </div>
      </section>

      {/* FILTERS */}
      <div className="border-b border-cream/15 sticky top-24 lg:top-32 z-20 bg-olive/90 backdrop-blur-md text-cream">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-5 flex flex-wrap items-center gap-x-8 gap-y-4 text-xs uppercase tracking-luxe">
          <Select label="Cocktail" value={cocktail} options={cocktailFilters} onChange={setCocktail} />
          <Select label="Size" value={size} options={[...sizes]} onChange={setSize} />
          <Select label="Style" value={style} options={[...styles]} onChange={setStyle} />
          <div className="ml-auto flex items-center gap-3">
            <span className="text-cream/60">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="bg-transparent border-none outline-none uppercase tracking-luxe text-xs cursor-pointer text-cream"
            >
              <option value="newest" className="text-espresso">Newest</option>
              <option value="lo" className="text-espresso">Price: Low–High</option>
              <option value="hi" className="text-espresso">Price: High–Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRID */}
      <section className="bg-olive text-cream">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
          <p className="text-xs uppercase tracking-luxe text-cream/60 mb-10">{filtered.length} pieces</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-14">
            {filtered.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>
    </>
  );
}

function Select({
  label, value, options, onChange,
}: { label: string; value: string | null; options: string[]; onChange: (v: string | null) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-cream/60">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="bg-transparent border-none outline-none uppercase tracking-luxe text-xs cursor-pointer text-cream"
      >
        <option value="" className="text-espresso">All</option>
        {options.map((o) => <option key={o} value={o} className="text-espresso">{o}</option>)}
      </select>
    </div>
  );
}
