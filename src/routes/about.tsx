import { createFileRoute } from "@tanstack/react-router";
import founder from "@/assets/morgan.jpeg";
import editorial from "@/assets/about-feature.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — SHAKEN Swimwear" },
      { name: "description", content: "The story behind SHAKEN — handmade cocktail-inspired swimwear from Cape Town, South Africa." },
      { property: "og:title", content: "Our Story — SHAKEN" },
      { property: "og:description", content: "Handmade cocktail-inspired swimwear from Cape Town." },
      { property: "og:image", content: founder },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="bg-olive text-cream">
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 pt-20 lg:pt-32 text-center">
        <p className="text-[11px] uppercase tracking-luxe text-coral mb-6">Our Story</p>
        <h1 className="font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] text-balance max-w-5xl mx-auto">
          A small studio. <em className="italic">A long summer.</em>
        </h1>
      </section>

      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 mt-20 lg:mt-28 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="aspect-[4/5] overflow-hidden">
          <img src={founder} alt="SHAKEN founder in studio" className="w-full h-full object-contain bg-olive/20" loading="lazy" />
        </div>
        <div className="space-y-6 text-base leading-relaxed text-cream/80 max-w-md">
          <p>SHAKEN began the way most beautiful things do — accidentally, and over a drink. It was 2023, somewhere on the Atlantic Seaboard, and our founder Lerato was sketching a swimsuit on the back of a cocktail menu.</p>
          <p>By the time the bill arrived, the first piece — The Espresso Martini — already had its name. The second came a week later. Within a season, an entire collection had been poured.</p>
          <p>Today every SHAKEN bikini is still designed, cut and stitched by hand in our small Cape Town studio. Made to order, made to last, made for the women who measure their summers in cocktails.</p>
        </div>
      </section>

      {/* QUOTE */}
      <section className="bg-cocktail-red text-cream py-32 lg:py-44 mt-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-serif italic text-[clamp(2.25rem,5vw,4rem)] leading-tight text-balance">
            "Every bikini is a sip of <span className="not-italic font-serif">something beautiful</span>."
          </p>
          <p className="mt-8 text-[11px] uppercase tracking-luxe text-cream/80">Lerato — Founder</p>
        </div>
      </section>

      {/* PILLARS */}
      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 py-24 lg:py-32">
        <div className="text-center mb-16">
          <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">What we stand for</p>
          <h2 className="font-serif text-5xl lg:text-6xl">The House Pillars</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {[
            { t: "Handcrafted Quality", d: "Every stitch placed by hand in Cape Town. Premium Italian fabric, luxury hardware, no shortcuts." },
            { t: "Cocktail-Inspired Design", d: "Each silhouette is a portrait of a drink — its mood, its season, its colour story." },
            { t: "Limited Edition Drops", d: "We don't restock — we re-imagine. Small runs, bigger ideas, always made to order." },
          ].map((p, i) => (
            <div key={p.t} className="text-center">
              <p className="font-serif italic text-gold text-3xl mb-5">0{i + 1}</p>
              <h3 className="font-serif text-3xl mb-4">{p.t}</h3>
              <p className="text-cream/75 leading-relaxed">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1500px] mx-auto px-6 lg:px-12 pb-24">
        <div className="aspect-[16/8] overflow-hidden">
          <img src={editorial} alt="Editorial" className="w-full h-full object-contain bg-olive/20" loading="lazy" />
        </div>
      </section>
    </div>
  );
}
