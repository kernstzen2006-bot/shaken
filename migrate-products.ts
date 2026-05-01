/// <reference types="node" />
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Initialize Supabase client with SERVICE ROLE KEY (admin permissions for storage upload)
// Prefer explicit SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in a node environment.
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY (or fallback ANON key). Set env vars before running.");
  process.exit(1);
}

const usingServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE);
if (!usingServiceRole) {
  console.warn("⚠️  Service role key not detected. Storage uploads or inserts may fail due to RLS. Prefer SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Product data (same as src/lib/products.ts)
const products = [
  {
    slug: "espresso-martini",
    name: "The Espresso Martini",
    cocktail: "Espresso Martini",
    price: 450,
    image: "product-espresso.jpg",
    alt_image: "product-bluelagoon.jpg",
    descriptor: "Deep mocha with gold hardware",
    description: "Stirred, not shaken. Deep espresso brown with a quiet glint of gold — a minimal triangle set built for slow mornings and late nights at the bar.",
    style: "Set",
  },
  {
    slug: "mojito",
    name: "The Mojito",
    cocktail: "Mojito",
    price: 500,
    image: "product-mojito.jpg",
    alt_image: "product-pina.jpg",
    descriptor: "Fresh mint with crisp white trim",
    description: "Fresh, crisp and effortlessly cool — The Mojito is your go-to for long days at the water's edge. Mint silk-finish with hand-tied white string ties.",
    style: "Set",
  },
  {
    slug: "aperol-spritz",
    name: "The Aperol Spritz",
    cocktail: "Aperol Spritz",
    price: 475,
    image: "product-aperol.jpg",
    alt_image: "product-tequila.jpg",
    descriptor: "Burnt orange bandeau with cream ties",
    description: "Three parts golden hour, two parts confidence. A burnt-orange bandeau finished with cream silk ties — designed to be seen at the apéro.",
    style: "Top",
  },
  {
    slug: "blue-lagoon",
    name: "The Blue Lagoon",
    cocktail: "Blue Lagoon",
    price: 600,
    image: "product-bluelagoon.jpg",
    alt_image: "product-espresso.jpg",
    descriptor: "Electric cobalt, high waist with cut-out",
    description: "Electric and unapologetic. Cobalt cut-out detailing meets a sculpted high-waist bottom — a modern silhouette for the deep end.",
    style: "Set",
  },
  {
    slug: "tequila-sunrise",
    name: "The Tequila Sunrise",
    cocktail: "Tequila Sunrise",
    price: 550,
    image: "product-tequila.jpg",
    alt_image: "product-aperol.jpg",
    descriptor: "Ombre coral to gold strapless top",
    description: "A horizon in fabric. Hand-dyed ombre fading from coral to liquid gold — a strapless silhouette that catches every last ray.",
    style: "Top",
  },
  {
    slug: "pina-colada",
    name: "The Piña Colada",
    cocktail: "Piña Colada",
    price: 500,
    image: "product-pina.jpg",
    alt_image: "product-mojito.jpg",
    descriptor: "Cream tropical print with ruffle",
    description: "If you like getting caught in the rain. Cream silk printed with palms and finished in a soft hand-stitched ruffle — coconut optional.",
    style: "Set",
  },
  {
    slug: "champagne",
    name: "The Champagne",
    cocktail: "Champagne",
    price: 575,
    image: "product-champagne.jpg",
    alt_image: "product-cosmo.jpg",
    descriptor: "Pale blush with gold ring hardware",
    description: "Quiet luxury, loud finish. Pale blush silk-finish swimwear linked by signature gold ring hardware — strictly first-class.",
    style: "Set",
  },
  {
    slug: "cosmopolitan",
    name: "The Cosmopolitan",
    cocktail: "Cosmopolitan",
    price: 450,
    image: "product-cosmo.jpg",
    alt_image: "product-champagne.jpg",
    descriptor: "Deep rose plunge with cheeky cut",
    description: "Manhattan in a glass. Deep rose plunge top paired with a confident cheeky cut bottom — for the women who order their own drinks.",
    style: "Set",
  },
];

async function uploadImage(filename: string): Promise<string | null> {
  const imagePath = path.join(process.cwd(), "src", "assets", filename);
  
  if (!fs.existsSync(imagePath)) {
    console.warn(`⚠️  Image not found: ${imagePath}`);
    return null;
  }

  // Use a read stream for Node uploads (more memory-friendly)
  const stream = fs.createReadStream(imagePath);
  try {
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filename, stream as any, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      // common cases: already exists (409) or RLS/permission failures
      if (error.status === 409 || (error.message && error.message.toLowerCase().includes("already exists"))) {
        console.log(`📦 Image already exists: ${filename}`);
      } else {
        console.error(`❌ Upload failed for ${filename}:`, error);
        return null;
      }
    } else {
      console.log(`✅ Uploaded: ${filename}`);
    }
  } catch (e) {
    console.error(`❌ Upload error for ${filename}:`, e);
    return null;
  }

  // Return public URL
  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(filename);
  return urlData.publicUrl;
}

async function insertProducts() {
  console.log("\n🚀 Starting product migration...\n");

  for (const product of products) {
    try {
      console.log(`\n📝 Processing: ${product.name}`);

      // Upload main image
      const imageUrl = await uploadImage(product.image);
      if (!imageUrl) {
        console.error(`❌ Skipping ${product.name} - image upload failed`);
        continue;
      }

      // Upload alt image (optional)
      let altImageUrl = null;
      if (product.alt_image) {
        altImageUrl = await uploadImage(product.alt_image);
      }

      // Insert into database
      // Insert using service role key when available to avoid RLS issues
      try {
        const { data, error } = await supabase
          .from("products")
          .insert([
            {
              slug: product.slug,
              name: product.name,
              description: product.description,
              price: product.price,
              image: imageUrl,
              alt_image: altImageUrl,
              images: [imageUrl].concat(altImageUrl ? [altImageUrl] : []),
              metadata: {
                cocktail: product.cocktail,
                descriptor: product.descriptor,
                style: product.style,
              },
            },
          ])
          .select()
          .single();

        if (error) {
          console.error(`❌ Database insert failed for ${product.name}:`, error);
        } else {
          console.log(`✅ Inserted: ${product.name} (ID: ${data.id})`);
        }
      } catch (e) {
        console.error(`❌ Unexpected insert error for ${product.name}:`, e);
      }
    } catch (err) {
      console.error(`❌ Error processing ${product.name}:`, err);
    }
  }

  console.log("\n✨ Migration complete!\n");
}

// Run migration
insertProducts().catch(console.error);
