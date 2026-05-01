import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, Heart, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/lib/auth";
import shakenLogo from "@/assets/shaken-logo.png";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, open, wishlist } = useCart();
  const { user, isAdmin, signOut, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 bg-cream ${
        scrolled ? "border-b border-espresso/10" : "border-b border-transparent"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-24 lg:h-32 grid grid-cols-3 items-center">
        {/* Left nav (desktop) */}
        <nav className="hidden lg:flex items-center gap-10 text-xs uppercase tracking-luxe">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="link-underline" activeProps={{ className: "text-coral" }}>
              {n.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="link-underline" activeProps={{ className: "text-coral" }}>
              Admin
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="lg:hidden justify-self-start text-espresso"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo center */}
        <Link to="/" className="justify-self-center" aria-label="SHAKEN — Home">
          <img
            src={shakenLogo}
            alt="SHAKEN — Handcrafted Swimwear, South Africa"
            className="h-20 lg:h-28 w-auto object-contain"
          />
        </Link>

        {/* Right icons */}
        <div className="justify-self-end flex items-center gap-5 text-espresso">
          {!loading && !user && (
            <div className="hidden lg:flex items-center gap-4 text-[11px] uppercase tracking-luxe">
              <Link to="/signin" className="link-underline">Sign In</Link>
              <Link to="/signup" className="link-underline">Sign Up</Link>
            </div>
          )}
          {!loading && user && (
            <button
              onClick={() => void signOut()}
              className="hidden lg:inline-flex text-[11px] uppercase tracking-luxe link-underline"
            >
              Sign Out
            </button>
          )}
          <Link to="/wishlist" className="hidden sm:flex items-center" aria-label="Wishlist">
            <Heart className="h-[18px] w-[18px]" />
            {wishlist.length > 0 && (
              <span className="ml-1 text-[10px] font-medium">{wishlist.length}</span>
            )}
          </Link>
          <button onClick={open} aria-label="Cart" className="relative flex items-center">
            <ShoppingBag className="h-[18px] w-[18px]" />
            <span className="ml-1 text-[10px] font-medium">{count}</span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-espresso/40 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-cream p-8 shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-12">
            <img src={shakenLogo} alt="SHAKEN" className="h-8 w-auto object-contain" />
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-6 font-serif text-3xl">
            <Link to="/" onClick={() => setMobileOpen(false)}>Home</Link>
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMobileOpen(false)}>
                {n.label}
              </Link>
            ))}
            <Link to="/wishlist" onClick={() => setMobileOpen(false)}>Wishlist</Link>
            {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>}
            {!loading && !user && <Link to="/signin" onClick={() => setMobileOpen(false)}>Sign In</Link>}
            {!loading && !user && <Link to="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>}
            {!loading && user && (
              <button
                onClick={() => {
                  void signOut();
                  setMobileOpen(false);
                }}
                className="text-left"
              >
                Sign Out
              </button>
            )}
          </nav>
        </aside>
      </div>
    </header>
  );
}
