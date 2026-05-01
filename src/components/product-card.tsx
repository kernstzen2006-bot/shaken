import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { type Product, formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cart-store";

export function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWish, add } = useCart();
  const wished = wishlist.includes(product.slug);

  return (
    <div className="group">
      <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            loading="lazy"
          />
          {product.altImage && (
            <img
              src={product.altImage}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              loading="lazy"
            />
          )}
        </Link>
        <span
          className="absolute top-4 left-4 h-3 w-3 rounded-full ring-2 ring-cream/80"
          style={{ backgroundColor: product.dotColor }}
          title={product.cocktail}
        />
        <button
          onClick={() => toggleWish(product.slug)}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-cream/90 flex items-center justify-center hover:bg-cream"
          aria-label="Add to wishlist"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-coral text-coral" : "text-espresso"}`} />
        </button>
        <button
          onClick={() => add(product, "M")}
          className="absolute inset-x-4 bottom-4 py-3 bg-espresso text-cream text-[11px] uppercase tracking-luxe opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
        >
          Quick Add
        </button>
      </div>
      <div className="pt-5 flex justify-between items-start gap-3">
        <div>
          <Link to="/product/$slug" params={{ slug: product.slug }} className="font-serif text-xl leading-tight link-underline">
            {product.name}
          </Link>
          <p className="text-[11px] uppercase tracking-luxe text-[#FF0000] mt-1.5">
            {product.descriptor}
          </p>
        </div>
        <p className="font-serif text-lg shrink-0">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}
