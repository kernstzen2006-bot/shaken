import { supabase } from "@/lib/supabase";
import espresso from "@/assets/product-espresso.jpg";
import mojito from "@/assets/product-mojito.jpg";
import aperol from "@/assets/product-aperol.jpg";
import bluelagoon from "@/assets/product-bluelagoon.jpg";
import tequila from "@/assets/product-tequila.jpg";
import pina from "@/assets/product-pina.jpg";
import champagne from "@/assets/product-champagne.jpg";
import cosmo from "@/assets/product-cosmo.jpg";

export type Product = {
  slug: string;
  name: string;
  cocktail: string;
  price: number;
  image: string;
  altImage?: string;
  descriptor: string;
  description: string;
  dotColor: string;
  style: "Top" | "Bottom" | "Set";
};

export const staticProducts: Product[] = [
  {
    slug: "espresso-martini",
    name: "The Espresso Martini",
    cocktail: "Espresso Martini",
    price: 450,
    image: espresso,
    altImage: bluelagoon,
    descriptor: "Deep mocha with gold hardware",
    description: "Stirred, not shaken. Deep espresso brown with a quiet glint of gold — a minimal triangle set built for slow mornings and late nights at the bar.",
    dotColor: "#3a201a",
    style: "Set",
  },
  {
    slug: "mojito",
    name: "The Mojito",
    cocktail: "Mojito",
    price: 500,
    image: mojito,
    altImage: pina,
    descriptor: "Fresh mint with crisp white trim",
    description: "Fresh, crisp and effortlessly cool — The Mojito is your go-to for long days at the water's edge. Mint silk-finish with hand-tied white string ties.",
    dotColor: "#9bd6a6",
    style: "Set",
  },
  {
    slug: "aperol-spritz",
    name: "The Aperol Spritz",
    cocktail: "Aperol Spritz",
    price: 475,
    image: aperol,
    altImage: tequila,
    descriptor: "Burnt orange bandeau with cream ties",
    description: "Three parts golden hour, two parts confidence. A burnt-orange bandeau finished with cream silk ties — designed to be seen at the apéro.",
    dotColor: "#e07b3a",
    style: "Top",
  },
  {
    slug: "blue-lagoon",
    name: "The Blue Lagoon",
    cocktail: "Blue Lagoon",
    price: 600,
    image: bluelagoon,
    altImage: espresso,
    descriptor: "Electric cobalt, high waist with cut-out",
    description: "Electric and unapologetic. Cobalt cut-out detailing meets a sculpted high-waist bottom — a modern silhouette for the deep end.",
    dotColor: "#2c4ed8",
    style: "Set",
  },
  {
    slug: "tequila-sunrise",
    name: "The Tequila Sunrise",
    cocktail: "Tequila Sunrise",
    price: 550,
    image: tequila,
    altImage: aperol,
    descriptor: "Ombre coral to gold strapless top",
    description: "A horizon in fabric. Hand-dyed ombre fading from coral to liquid gold — a strapless silhouette that catches every last ray.",
    dotColor: "#ee6a55",
    style: "Top",
  },
  {
    slug: "pina-colada",
    name: "The Piña Colada",
    cocktail: "Piña Colada",
    price: 500,
    image: pina,
    altImage: mojito,
    descriptor: "Cream tropical print with ruffle",
    description: "If you like getting caught in the rain. Cream silk printed with palms and finished in a soft hand-stitched ruffle — coconut optional.",
    dotColor: "#f3e7c6",
    style: "Set",
  },
  {
    slug: "champagne",
    name: "The Champagne",
    cocktail: "Champagne",
    price: 575,
    image: champagne,
    altImage: cosmo,
    descriptor: "Pale blush with gold ring hardware",
    description: "Quiet luxury, loud finish. Pale blush silk-finish swimwear linked by signature gold ring hardware — strictly first-class.",
    dotColor: "#f7d0c8",
    style: "Set",
  },
  {
    slug: "cosmopolitan",
    name: "The Cosmopolitan",
    cocktail: "Cosmopolitan",
    price: 450,
    image: cosmo,
    altImage: champagne,
    descriptor: "Deep rose plunge with cheeky cut",
    description: "Manhattan in a glass. Deep rose plunge top paired with a confident cheeky cut bottom — for the women who order their own drinks.",
    dotColor: "#c8265c",
    style: "Set",
  },
];

const productBySlug = new Map(staticProducts.map((product) => [product.slug, product] as const));

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  alt_image: string | null;
  images: string[] | null;
  metadata: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
};

function toProduct(row: ProductRow): Product {
  const fallback = productBySlug.get(row.slug);
  const metadata = row.metadata ?? {};

  const imagesFromRow = (row.images && Array.isArray(row.images) && row.images.length > 0)
    ? row.images
    : [row.image, row.alt_image].filter(Boolean) as string[];

  return {
    slug: row.slug,
    name: row.name,
    cocktail: String(metadata.cocktail ?? fallback?.cocktail ?? row.name),
    price: row.price,
    image: imagesFromRow[0] ?? fallback?.image ?? "",
    altImage: imagesFromRow[1] ?? fallback?.altImage,
    descriptor: String(metadata.descriptor ?? fallback?.descriptor ?? row.description ?? ""),
    description: row.description ?? fallback?.description ?? "",
    dotColor: String(metadata.dotColor ?? fallback?.dotColor ?? "#c9a77c"),
    style: (metadata.style ?? fallback?.style ?? "Set") as Product["style"],
  };
}

export async function loadProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, price, image, alt_image, images, metadata, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return (data as ProductRow[]).map(toProduct);
}

export async function loadProduct(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, price, image, alt_image, metadata, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return toProduct(data as ProductRow);
}

export const products = staticProducts;

export const cocktailFilters = staticProducts.map((p) => p.cocktail);
export const sizes = ["XS", "S", "M", "L", "XL"] as const;
export const styles = ["Top", "Bottom", "Set"] as const;

export const formatPrice = (n: number) => `R${n.toFixed(0)}`;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
