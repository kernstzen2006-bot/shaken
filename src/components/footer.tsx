import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-espresso text-cream/90">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-20 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="font-serif text-4xl tracking-[0.35em]">SHAKEN</span>
          <p className="mt-6 max-w-sm font-serif italic text-xl text-cream/70 text-balance">
            Handcrafted swimwear inspired by the world's most iconic drinks. Made by hand in South Africa.
          </p>
        </div>
        <div>
          <h4 className="text-[11px] uppercase tracking-luxe text-gold mb-5">Shop</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/shop" className="link-underline">The Collection</Link></li>
            <li><Link to="/contact" className="link-underline">Custom Orders</Link></li>
            <li><Link to="/wishlist" className="link-underline">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] uppercase tracking-luxe text-gold mb-5">Brand</h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="link-underline">Our Story</Link></li>
            <li><Link to="/contact" className="link-underline">Contact</Link></li>
            <li><a className="link-underline" href="#">Care & Returns</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/15">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row gap-4 justify-between items-center text-[11px] uppercase tracking-luxe text-cream/60">
          <span>© {new Date().getFullYear()} SHAKEN Swimwear · Handmade in South Africa</span>
          <div className="flex items-center gap-5">
            <a href="#" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
            <span className="text-cream/40">Visa · Mastercard · PayFast · EFT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
