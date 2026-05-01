export function Marquee() {
  const text = "Handmade in South Africa · Limited Edition Drops · Cocktail-Inspired · Sun, Salt & Silk · ";
  const repeated = text.repeat(6);
  return (
    <div className="border-y border-espresso/15 bg-cream py-5 overflow-hidden">
      <div className="flex whitespace-nowrap animate-marquee font-serif italic text-2xl text-espresso/80">
        <span className="px-4">{repeated}</span>
        <span className="px-4" aria-hidden>{repeated}</span>
      </div>
    </div>
  );
}
