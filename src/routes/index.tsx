import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/bikini photo shaken.avif";
import storyImg from "@/assets/cocktail bikini.avif";
import editorial1 from "@/assets/editorial-1.jpg";
import editorial2 from "@/assets/about-feature.png";
import { Marquee } from "@/components/marquee";
import { ProductCard } from "@/components/product-card";
import { loadProducts } from "@/lib/products";

export const Route = createFileRoute("/")({
  loader: async () => ({ products: await loadProducts() }),
  head: () => ({
    meta: [
      { title: "SHAKEN — Wear the Cocktail Hour" },
      { name: "description", content: "Handcrafted luxury bikinis inspired by the world's most iconic cocktails. Made by hand in South Africa." },
      { property: "og:title", content: "SHAKEN — Wear the Cocktail Hour" },
      { property: "og:description", content: "Handcrafted luxury bikinis inspired by iconic cocktails." },
    ],
  }),
  component: Index,
});

function Index() {
  const { products } = Route.useLoaderData();
  const featured = products.slice(0, 4);
  const [email, setEmail] = useState("");

  return (
    <>
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="SHAKEN swimwear at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/10 via-transparent to-espresso/40" />
        <div className="relative z-10 h-full flex flex-col justify-end px-6 lg:px-16 pb-16 lg:pb-24 max-w-[1600px] mx-auto">
          <p className="text-cream/90 text-[11px] uppercase tracking-luxe mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Summer 26 · The Cocktail Collection
          </p>
          <h1 className="font-serif text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] text-cream max-w-5xl text-balance animate-fade-up">
            Wear the <em className="italic">Cocktail</em> Hour.
          </h1>
          <p className="mt-6 max-w-xl text-cream/85 text-lg font-serif italic animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Handcrafted swimwear inspired by the world's most iconic drinks.
          </p>
          <div className="mt-10 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Link to="/shop" className="inline-flex items-center justify-center px-10 py-4 bg-cream text-espresso text-xs uppercase tracking-luxe font-medium hover:bg-gold transition-colors duration-300">
              Explore the Collection
            </Link>
          </div>
        </div>
      </section>

      <Marquee />

      {/* STORY TEASER */}
      <section className="bg-olive text-cream max-w-none px-6 lg:px-12 py-24 lg:py-36">
        <div className="max-w-[1500px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="aspect-[4/5] overflow-hidden">
          <img src={storyImg} alt="Aperol spritz poolside" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-luxe text-coral mb-6">Our Story</p>
          <h2 className="font-serif text-5xl lg:text-6xl leading-tight text-balance">
            A wardrobe poured, <em className="italic">not folded</em>.
          </h2>
          <p className="mt-8 text-base leading-relaxed text-[#FF0000] max-w-md">
            SHAKEN was born on a sun-bleached Cape Town afternoon, somewhere between a bar cart and a sketchbook. Every piece is named after a cocktail we love, cut and stitched by hand in our small South African studio, and made to measure.
          </p>
          <p className="mt-4 text-base leading-relaxed text-[#FF0000] max-w-md">
            We don't do mass. We do moments — the slow ones, the golden ones, the ones worth dressing for.
          </p>
          <Link to="/about" className="inline-block mt-10 text-xs uppercase tracking-luxe link-underline">
            Read the full story →
          </Link>
        </div>
        </div>
      </section>

      {/* FEATURED COLLECTION — asymmetric grid */}
      <section className="bg-olive text-cream py-24 lg:py-36">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">The Featured Pour</p>
              <h2 className="font-serif text-5xl lg:text-6xl text-balance">House favourites.</h2>
            </div>
            <Link to="/shop" className="text-xs uppercase tracking-luxe link-underline">
              Shop all →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* COCKTAIL MENU */}
      <section className="bg-olive text-cream py-24 lg:py-36">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">The Cocktail Menu</p>
          <h2 className="font-serif text-5xl lg:text-6xl text-balance max-w-3xl">
            Choose your <em className="italic">flavour</em>.
          </h2>
        </div>
        <div className="mt-14 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-6 lg:px-12 pb-4 min-w-max">
            {products.map((p) => (
              <Link
                key={p.slug}
                to="/product/$slug"
                params={{ slug: p.slug }}
                className="group flex items-center gap-3 px-7 py-4 border border-cream/30 rounded-full hover:bg-cream hover:text-espresso transition-colors duration-300"
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.dotColor }} />
                <span className="font-serif text-xl whitespace-nowrap">{p.cocktail}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT'S MADE */}
      <section className="bg-espresso text-cream py-24 lg:py-36">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <p className="text-[11px] uppercase tracking-luxe text-gold mb-4">The Process</p>
            <h2 className="font-serif text-5xl lg:text-6xl text-balance">Three pours. One bikini.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
            {[
              { n: "01", t: "Design", d: "Each silhouette begins with a cocktail — its colour, its mood, its season. We sketch every piece in-house in Cape Town." },
              { n: "02", t: "Handcraft", d: "Cut, stitched and finished by hand using premium nylon-Lycra blends. Chlorine-resistant, UV-stable, made to last summers." },
              { n: "03", t: "Deliver", d: "Made to order in 7–14 days. Wrapped in tissue, finished with a hand-written note. Shipped across South Africa and abroad." },
            ].map((s) => (
              <div key={s.n}>
                <p className="font-serif italic text-gold text-3xl mb-6">{s.n}</p>
                <h3 className="font-serif text-3xl mb-4">{s.t}</h3>
                <p className="text-cream/70 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM STRIP */}
      <section className="bg-olive text-cream py-24 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center mb-12">
          <p className="text-[11px] uppercase tracking-luxe text-coral mb-3">As Worn</p>
          <h2 className="font-serif text-4xl lg:text-5xl">
            Tag us in yours <em className="italic">@SHAKEN_SWIMWEAR</em>
          </h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
          {[products[0], products[2], editorial1, editorial2, products[4], products[6]].map((p, i) => {
            const src = typeof p === "string" ? p : p.image;
            return (
              <div key={i} className="aspect-square overflow-hidden">
                <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
            );
          })}
        </div>
      </section>

      {/* EMAIL SIGNUP */}
      <section className="bg-cocktail-red text-cream py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[11px] uppercase tracking-luxe text-cream/80 mb-4">The List</p>
          <h2 className="font-serif text-5xl lg:text-6xl text-balance">Join the Cocktail Club.</h2>
          <p className="mt-6 font-serif italic text-xl text-cream/90 max-w-xl mx-auto">
            First sips of new collections, limited drops and the occasional love letter.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); setEmail(""); }}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input
              type="email"
              required
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 bg-transparent border border-cream/40 placeholder:text-cream/60 px-5 py-4 text-sm focus:outline-none focus:border-cream"
            />
            <button className="px-8 py-4 bg-cream text-cocktail-red text-xs uppercase tracking-luxe font-medium hover:bg-espresso hover:text-cream transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
