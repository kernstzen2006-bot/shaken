import { supabase } from "@/lib/supabase";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  alt_image?: string;
  images?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
};

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Product) ?? null;
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error("You must be signed in to create products");
  }

  const { data, error } = await supabase
    .from("products")
    .insert([payload])
    .select("id, name, slug, description, price, image, alt_image, images, metadata, created_at, updated_at")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Product create returned no row");
  return data as Product;
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error("You must be signed in to update products");
  }

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("id, name, slug, description, price, image, alt_image, images, metadata, created_at, updated_at")
    .maybeSingle();
  if (error) throw error;

  if (data) return data as Product;

  const updated = await getProduct(id);
  if (!updated) throw new Error("Product update returned no row");
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error("You must be signed in to delete products");
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File, key?: string): Promise<string> {
  // key example: `${Date.now()}_${file.name}`
  const filename = key ?? `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from("product-images").upload(filename, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filename);
  return urlData.publicUrl;
}

export async function deleteProductImage(pathOrUrl: string): Promise<void> {
  // accept either filename or full public URL
  let filename = pathOrUrl;
  try {
    const marker = '/product-images/';
    const idx = pathOrUrl.indexOf(marker);
    if (idx !== -1) {
      filename = pathOrUrl.slice(idx + marker.length);
    }
  } catch (e) {
    // fallback to using provided string as filename
  }

  if (!filename) return;
  const { error } = await supabase.storage.from('product-images').remove([filename]);
  if (error) throw error;
}

export function getProductImagePublicUrl(filename: string) {
  const { data } = supabase.storage.from('product-images').getPublicUrl(filename);
  return data.publicUrl;
}

export type Order = {
  id: string;
  user_id?: string;
  total: number;
  items: any;
  status: string;
  created_at?: string;
};

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Order update returned no row");
  return data as Order;
}

export type Customer = {
  id: string;
  email?: string;
  role?: string;
  created_at?: string;
};

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from("profiles").select("id, email, role, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  return data as Customer[];
}

export async function updateCustomerRole(id: string, role: string): Promise<Customer> {
  const { data, error } = await supabase.from("profiles").update({ role }).eq("id", id).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Customer update returned no row");
  return data as Customer;
}
