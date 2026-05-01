import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import type { Product, Order, Customer } from "@/lib/admin";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  getOrders,
  updateOrderStatus,
  getCustomers,
  updateCustomerRole,
} from "@/lib/admin";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { loading, user, isAdmin } = useAuth();
  const router = useRouter();

  // Move all hooks to the top, before any conditional returns
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    void loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="bg-olive text-cream min-h-[60vh] flex items-center justify-center px-6">
        <p className="font-serif italic text-3xl">Loading account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-olive text-cream min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-xl">
          <h1 className="font-serif text-5xl">Admin Access</h1>
          <p className="mt-6 text-cream/80">Please sign in with an admin account to view this section.</p>
          <Link to="/signin" className="btn-primary mt-8">Sign in</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-olive text-cream min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-xl">
          <h1 className="font-serif text-5xl">Access Restricted</h1>
          <p className="mt-6 text-cream/80">This section is only visible to admin credentials.</p>
          <Link to="/" className="btn-primary mt-8">Back home</Link>
        </div>
      </div>
    );
  }

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      // ignore for now
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
    setProducts((p) => p.filter((x) => x.id !== id));
    router.invalidate();
    window.location.reload();
  }

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setShowForm(true);
  }

  return (
    <div className="bg-olive text-cream min-h-[70vh] px-6 lg:px-12 py-16 lg:py-24">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-luxe text-coral mb-2">Admin</p>
            <h1 className="font-serif text-6xl leading-none">Control Room</h1>
          </div>
          <div>
            <button onClick={openCreate} className="btn-primary">New Product</button>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <div className="border border-cream/20 p-6 bg-cream/5">
            <p className="text-[11px] uppercase tracking-luxe text-coral">Products</p>
            <p className="font-serif text-3xl mt-3">Catalog</p>
            <p className="mt-3 text-cream/75 text-sm">Manage product records in Supabase.</p>
            <div className="mt-6">
              {loadingProducts ? (
                <p>Loading...</p>
              ) : (
                <ul className="space-y-4">
                  {products.map((p) => (
                    <li key={p.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-cream/70">{p.slug}</div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => openEdit(p)} className="text-coral">Edit</button>
                        <button onClick={() => void handleDelete(p.id)} className="text-red-400">Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="md:col-span-2 border border-cream/20 p-6 bg-cream/5">
            <p className="text-[11px] uppercase tracking-luxe text-coral">Orders</p>
            <p className="font-serif text-3xl mt-3">Fulfillment</p>
            <div className="mt-4">
              <OrdersList />
            </div>
          </div>

          <div className="md:col-span-2 border border-cream/20 p-6 bg-cream/5">
            <p className="text-[11px] uppercase tracking-luxe text-coral">Customers</p>
            <p className="font-serif text-3xl mt-3">Accounts</p>
            <div className="mt-4">
              <CustomersList />
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={(saved) => {
            setShowForm(false);
            void loadProducts();
            router.invalidate();
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function ProductForm({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: (p: Product) => void }) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState((product?.price ?? 0).toString());
  const [imageItems, setImageItems] = useState<Array<{ id: string; kind: "existing" | "new"; url: string; file?: File }>>(() => {
    const initial = (product?.images?.length ? product.images : [product?.image, product?.alt_image].filter(Boolean)) as string[];
    return initial.map((url, idx) => ({ id: `existing-${idx}-${url}`, kind: "existing" as const, url }));
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(product?.name ?? "");
    setSlug(product?.slug ?? "");
    setDescription(product?.description ?? "");
    setPrice((product?.price ?? 0).toString());
    const initial = (product?.images?.length ? product.images : [product?.image, product?.alt_image].filter(Boolean)) as string[];
    setImageItems(initial.map((url, idx) => ({ id: `existing-${idx}-${url}`, kind: "existing" as const, url })));
  }, [product]);

  useEffect(() => {
    return () => {
      for (const item of imageItems) {
        if (item.kind === "new" && item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
      }
    };
  }, [imageItems]);

  function moveItem<T>(arr: T[], from: number, to: number) {
    if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return arr;
    const copy = [...arr];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    return copy;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const finalImages: string[] = [];
      for (const item of imageItems) {
        if (item.kind === "existing") {
          finalImages.push(item.url);
          continue;
        }
        if (!item.file) continue;
        const url = await uploadProductImage(item.file);
        if (url) finalImages.push(url);
      }

      const imageUrl = finalImages[0] ?? null;
      const altImageUrl = finalImages[1] ?? null;

      const payload: Partial<Product> = {
        name,
        slug,
        description,
        price: Math.round(Number(price) || 0),
        image: imageUrl,
        alt_image: altImageUrl ?? name,
        images: finalImages.length ? finalImages : null,
      };

      if (product) {
        const updated = await updateProduct(product.id, payload);
        onSaved(updated);
      } else {
        const created = await createProduct(payload);
        onSaved(created);
      }
    } catch (err) {
      console.error(err);
      alert((err as any)?.message ?? "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="absolute inset-0 bg-espresso/60" onClick={onClose} />
      <form onSubmit={onSubmit} className="relative z-10 w-full max-w-2xl bg-cream p-8 border border-cream/20">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl">{product ? "Edit Product" : "New Product"}</h3>
          <button type="button" onClick={onClose} className="text-espresso">Close</button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="p-3 border bg-white text-espresso" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug" className="p-3 border bg-white text-espresso" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="p-3 border bg-white text-espresso" />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (integer)" className="p-3 border bg-white text-espresso" />
          <div>
            <input type="file" accept="image/*" multiple className="text-espresso" onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (files.length === 0) return;
                const newItems = files.map((file, idx) => ({
                  id: `new-${Date.now()}-${idx}-${file.name}`,
                  kind: "new" as const,
                  url: URL.createObjectURL(file),
                  file,
                }));
                setImageItems((s) => [...s, ...newItems]);
                e.currentTarget.value = "";
              }} />
              <div className="mt-3 overflow-x-auto">
                <div className="flex gap-3 min-w-max pb-2">
                {imageItems.map((item, idx) => (
                  <div key={item.id} className="relative">
                    <img src={item.url} alt={`img-${idx}`} className="w-48 h-48 object-cover border" />
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => setImageItems((arr) => moveItem(arr, idx, idx - 1))} disabled={idx === 0} className="btn-outline">Left</button>
                      <button type="button" onClick={() => setImageItems((arr) => moveItem(arr, idx, idx + 1))} disabled={idx === imageItems.length - 1} className="btn-outline">Right</button>
                      <button type="button" onClick={() => {
                        setImageItems((arr) => {
                          const target = arr[idx];
                          if (target?.kind === "new" && target.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
                          return arr.filter((_, i) => i !== idx);
                        });
                      }} className="btn-outline">Remove</button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      const msg = (err as any)?.message ?? JSON.stringify(err);
      alert("Failed to load orders: " + msg);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id: string, next: string) {
    try {
      await updateOrderStatus(id, next);
      void load();
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
    }
  }

  if (loading) return <p>Loading orders...</p>;

  return (
    <div>
      {orders.length === 0 && <p className="text-cream/70">No orders yet.</p>}
      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="flex items-start justify-between border-b pb-3">
            <div>
              <div className="font-medium">Order {o.id}</div>
              <div className="text-sm text-cream/70">Total: {o.total}</div>
              <div className="text-sm text-cream/70">Items: {JSON.stringify(o.items)}</div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <select value={o.status} onChange={(e) => void changeStatus(o.id, e.target.value)} className="p-2 border bg-cream">
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="fulfilled">fulfilled</option>
                <option value="cancelled">cancelled</option>
              </select>
              <div className="text-xs text-cream/70">{o.created_at}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
      const msg = (err as any)?.message ?? JSON.stringify(err);
      alert("Failed to load customers: " + msg);
    } finally {
      setLoading(false);
    }
  }

  async function toggleRole(c: Customer) {
    try {
      const next = c.role === "admin" ? "customer" : "admin";
      await updateCustomerRole(c.id, next);
      void load();
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    }
  }

  if (loading) return <p>Loading customers...</p>;

  return (
    <div>
      {customers.length === 0 && <p className="text-cream/70">No customers found.</p>}
      <ul className="space-y-3">
        {customers.map((c) => (
          <li key={c.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{c.email ?? c.id}</div>
              <div className="text-sm text-cream/70">Role: {c.role}</div>
            </div>
            <div>
              <button onClick={() => void toggleRole(c)} className="btn-outline">
                {c.role === "admin" ? "Revoke Admin" : "Make Admin"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

