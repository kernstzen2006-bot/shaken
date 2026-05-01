import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { CartProvider } from "@/lib/cart-store";
import { AuthProvider } from "@/lib/auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { AnnouncementBar } from "@/components/announcement-bar";
import { BackToTop } from "@/components/back-to-top";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl">404</h1>
        <p className="mt-4 font-serif italic text-2xl">This page slipped off the bar.</p>
        <a href="/" className="btn-primary mt-8">Back home</a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SHAKEN — Cocktail-Inspired Swimwear, Handmade in South Africa" },
      { name: "description", content: "Handcrafted luxury bikinis inspired by the world's most iconic cocktails. Made by hand in South Africa." },
      { property: "og:title", content: "SHAKEN — Wear the Cocktail Hour" },
      { property: "og:description", content: "Handcrafted luxury bikinis inspired by the world's most iconic cocktails." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <CartProvider>
        <AnnouncementBar />
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
        <BackToTop />
      </CartProvider>
    </AuthProvider>
  );
}
