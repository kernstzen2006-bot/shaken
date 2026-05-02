import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CreditCard, Lock, MapPin, Package, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { CHECKOUT_SHIPPING_OPTIONS } from "@/lib/checkout-shipping";
import { formatPrice } from "@/lib/products";
import { preparePayFastCheckout } from "@/lib/prepare-payfast-checkout.server";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — SHAKEN" },
      { name: "description", content: "Complete your SHAKEN order — shipping and payment details." },
    ],
  }),
  component: CheckoutPage,
});

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

type Errors = Partial<{
  email: string;
  phone: string;
  fullName: string;
  addressLine1: string;
  city: string;
  province: string;
  postalCode: string;
}>;

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clear, close } = useCart();

  const [phase, setPhase] = useState<"form" | "success">("form");
  const [orderRef, setOrderRef] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [shippingId, setShippingId] = useState<(typeof CHECKOUT_SHIPPING_OPTIONS)[number]["id"]>("standard");
  const [paymentMethod, setPaymentMethod] = useState<"payfast" | "eft">("payfast");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [payfastRedirect, setPayfastRedirect] = useState<{
    url: string;
    fields: Record<string, string>;
  } | null>(null);

  const shippingCost = CHECKOUT_SHIPPING_OPTIONS.find((s) => s.id === shippingId)?.price ?? 0;
  const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

  useEffect(() => {
    if (phase === "form" && items.length === 0) {
      void navigate({ to: "/shop", replace: true });
    }
  }, [phase, items.length, navigate]);

  function validate(): Errors {
    const next: Errors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email.";
    if (!phone.trim()) next.phone = "Phone number is required.";
    else if (phone.replace(/\D/g, "").length < 9) next.phone = "Enter a valid SA-style phone number.";
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!addressLine1.trim()) next.addressLine1 = "Street address is required.";
    if (!city.trim()) next.city = "City is required.";
    if (!province) next.province = "Select a province.";
    if (!postalCode.trim()) next.postalCode = "Postal code is required.";
    else if (!/^\d{4}$/.test(postalCode.trim())) next.postalCode = "Use a 4-digit SA postal code.";
    return next;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setPayfastRedirect(null);

    if (paymentMethod === "payfast") {
      try {
        const pf = await preparePayFastCheckout({
          data: {
            email: email.trim(),
            phone: phone.trim(),
            fullName: fullName.trim(),
            addressLine1: addressLine1.trim(),
            addressLine2: addressLine2.trim() || undefined,
            city: city.trim(),
            province,
            postalCode: postalCode.trim(),
            shippingId,
            notes: notes.trim() || undefined,
            items: items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty })),
          },
        });

        try {
          sessionStorage.setItem(
            "shaken-last-order",
            JSON.stringify({
              ref: pf.m_payment_id,
              items: items.map((i) => ({ ...i })),
              subtotal,
              shippingCost,
              shippingId,
              email: email.trim(),
              amount: pf.amount,
              payment: "payfast",
              createdAt: new Date().toISOString(),
            }),
          );
        } catch {
          /* ignore */
        }

        setPayfastRedirect({ url: pf.url, fields: pf.fields });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Could not start PayFast checkout.";
        setSubmitError(msg);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    await new Promise((r) => setTimeout(r, 600));

    const ref = `SHK-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    try {
      sessionStorage.setItem(
        "shaken-last-order",
        JSON.stringify({
          ref,
          items: items.map((i) => ({ ...i })),
          subtotal,
          shippingCost,
          shippingId,
          email: email.trim(),
          payment: "eft",
          createdAt: new Date().toISOString(),
        }),
      );
    } catch {
      /* ignore */
    }

    setOrderRef(ref);
    setPhase("success");
    clear();
    close();
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (phase === "success") {
    return (
      <div className="min-h-screen bg-olive text-cream flex flex-col">
        <header className="border-b border-cream/15 px-6 lg:px-12 py-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[11px] uppercase tracking-luxe text-coral mb-4">Order placed</p>
            <h1 className="font-serif text-5xl lg:text-6xl leading-tight">
              Thank you, <em className="italic">darling</em>.
            </h1>
            <p className="mt-6 text-cream/80 text-lg font-serif italic max-w-xl mx-auto">
              Your pour is confirmed. We&apos;ll email <span className="text-cream">{email || "you"}</span> with payment and dispatch details shortly.
            </p>
            <p className="mt-8 font-serif text-2xl text-gold tracking-wide">{orderRef}</p>
            <p className="mt-2 text-[11px] uppercase tracking-luxe text-cream/60">Reference · keep this handy</p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop" className="btn-primary">
                Continue shopping
              </Link>
              <Link to="/" className="btn-outline border-cream text-cream hover:bg-cream hover:text-espresso">
                Back home
              </Link>
            </div>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-olive text-cream pb-24">
      <div className="border-b border-cream/15 px-6 lg:px-12 py-10 lg:py-14">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-luxe text-coral mb-3">Secure checkout</p>
            <h1 className="font-serif text-5xl lg:text-6xl leading-none">Checkout</h1>
            <p className="mt-4 text-cream/75 max-w-md font-serif italic">
              Almost poured — confirm shipping and how you&apos;d like to pay.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-luxe text-cream/70">
            <Lock className="h-4 w-4 text-gold shrink-0" aria-hidden />
            <span>SSL-encrypted · Cape Town studio fulfilment</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-12 lg:mt-16 grid lg:grid-cols-[minmax(0,1fr)_420px] gap-12 lg:gap-16 items-start">
        <form onSubmit={onSubmit} className="space-y-10 lg:space-y-12">
          <section className="bg-cream text-espresso p-8 lg:p-10 border border-cream/10 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-espresso/10">
              <MapPin className="h-5 w-5 text-coral shrink-0" aria-hidden />
              <div>
                <h2 className="font-serif text-3xl">Contact &amp; shipping</h2>
                <p className="text-sm text-muted-foreground mt-1">Where should we send your order?</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: undefined }));
                  }}
                  className="checkout-input"
                />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+27 ..."
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors((p) => ({ ...p, phone: undefined }));
                  }}
                  className="checkout-input"
                />
              </Field>
              <Field label="Full name" error={errors.fullName} className="sm:col-span-2">
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors((p) => ({ ...p, fullName: undefined }));
                  }}
                  className="checkout-input"
                />
              </Field>
              <Field label="Street address" error={errors.addressLine1} className="sm:col-span-2">
                <input
                  type="text"
                  autoComplete="address-line1"
                  value={addressLine1}
                  onChange={(e) => {
                    setAddressLine1(e.target.value);
                    setErrors((p) => ({ ...p, addressLine1: undefined }));
                  }}
                  className="checkout-input"
                />
              </Field>
              <Field label="Apartment, suite (optional)" className="sm:col-span-2">
                <input
                  type="text"
                  autoComplete="address-line2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="checkout-input"
                />
              </Field>
              <Field label="City" error={errors.city}>
                <input
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setErrors((p) => ({ ...p, city: undefined }));
                  }}
                  className="checkout-input"
                />
              </Field>
              <Field label="Province" error={errors.province}>
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setErrors((p) => ({ ...p, province: undefined }));
                  }}
                  className="checkout-input bg-transparent"
                >
                  <option value="">Select province</option>
                  {SA_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Postal code" error={errors.postalCode}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={4}
                  placeholder="0000"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 4));
                    setErrors((p) => ({ ...p, postalCode: undefined }));
                  }}
                  className="checkout-input"
                />
              </Field>
              <Field label="Country">
                <input type="text" readOnly value="South Africa" className="checkout-input opacity-80 cursor-default" />
              </Field>
            </div>
          </section>

          <section className="bg-cream text-espresso p-8 lg:p-10 border border-cream/10 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-espresso/10">
              <Truck className="h-5 w-5 text-coral shrink-0" aria-hidden />
              <div>
                <h2 className="font-serif text-3xl">Delivery</h2>
                <p className="text-sm text-muted-foreground mt-1">Nationwide South Africa · tracked courier</p>
              </div>
            </div>
            <div className="space-y-4">
              {CHECKOUT_SHIPPING_OPTIONS.map((opt) => {
                const selected = shippingId === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-start gap-4 border p-5 transition-colors duration-300 ${
                      selected ? "border-coral bg-coral/5" : "border-espresso/15 hover:border-espresso/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={selected}
                      onChange={() => setShippingId(opt.id)}
                      className="mt-1 h-4 w-4 accent-coral"
                    />
                    <span className="flex-1 flex flex-wrap items-baseline justify-between gap-2">
                      <span>
                        <span className="font-serif text-xl block">{opt.label}</span>
                        <span className="text-sm text-muted-foreground">{opt.detail}</span>
                      </span>
                      <span className="font-serif text-lg">{formatPrice(opt.price)}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="bg-cream text-espresso p-8 lg:p-10 border border-cream/10 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-espresso/10">
              <CreditCard className="h-5 w-5 text-coral shrink-0" aria-hidden />
              <div>
                <h2 className="font-serif text-3xl">Payment</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose how you&apos;ll pay — we&apos;ll confirm via email before charging production.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label
                className={`flex cursor-pointer items-start gap-4 border p-5 transition-colors duration-300 ${
                  paymentMethod === "payfast" ? "border-coral bg-coral/5" : "border-espresso/15 hover:border-espresso/25"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "payfast"}
                  onChange={() => setPaymentMethod("payfast")}
                  className="mt-1 h-4 w-4 accent-coral"
                />
                <span>
                  <span className="font-serif text-xl block">PayFast</span>
                  <span className="text-sm text-muted-foreground">
                    Cards &amp; Instant EFT on PayFast&apos;s secure hosted checkout — you&apos;ll return here after paying.
                  </span>
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-start gap-4 border p-5 transition-colors duration-300 ${
                  paymentMethod === "eft" ? "border-coral bg-coral/5" : "border-espresso/15 hover:border-espresso/25"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "eft"}
                  onChange={() => setPaymentMethod("eft")}
                  className="mt-1 h-4 w-4 accent-coral"
                />
                <span>
                  <span className="font-serif text-xl block">Manual EFT</span>
                  <span className="text-sm text-muted-foreground">
                    Bank details sent by email — reference your order number on payment.
                  </span>
                </span>
              </label>
            </div>

            <div className="mt-8">
              <label className="block text-[11px] uppercase tracking-luxe text-espresso/70 mb-2">Order notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Sizing notes, gift message, delivery instructions..."
                className="checkout-input resize-none min-h-[100px]"
              />
            </div>
          </section>

          <div className="lg:hidden">
            <SummaryCard
              items={items}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
              submitting={submitting}
            />
          </div>

          {submitError && (
            <p className="text-sm text-red-300 bg-red-950/30 border border-red-400/30 px-4 py-3">{submitError}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-2">
            <Link to="/shop" className="text-[11px] uppercase tracking-luxe link-underline text-cream/85 hover:text-cream order-2 sm:order-1">
              ← Return to shop
            </Link>
            <button type="submit" disabled={submitting} className="btn-primary order-1 sm:order-2 px-12 py-4">
              {submitting
                ? paymentMethod === "payfast"
                  ? "Connecting to PayFast…"
                  : "Placing order…"
                : paymentMethod === "payfast"
                  ? `Continue to PayFast · ${formatPrice(total)}`
                  : `Place order · ${formatPrice(total)}`}
            </button>
          </div>
        </form>

        <aside className="hidden lg:block lg:sticky lg:top-28 space-y-6">
          <SummaryCard
            items={items}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            submitting={submitting}
          />
          <div className="border border-cream/20 bg-cream/5 px-6 py-5 text-sm text-cream/75 leading-relaxed">
            <Package className="h-5 w-5 text-gold mb-3" aria-hidden />
            <p>
              Made-to-order pieces ship in <strong className="text-cream font-normal font-serif italic">7–14 days</strong>{" "}
              from payment confirmation. You&apos;ll receive tracking once your parcel leaves our Cape Town studio.
            </p>
          </div>
        </aside>
      </div>

      {payfastRedirect && (
        <>
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-espresso/85 px-6">
            <p className="font-serif text-3xl lg:text-4xl text-cream text-center text-balance">
              Redirecting you to <span className="text-gold italic">PayFast</span>…
            </p>
            <p className="mt-4 text-sm text-cream/70 text-center max-w-md">
              Complete payment on PayFast&apos;s secure page. Don&apos;t close this tab until you&apos;re finished or cancelled.
            </p>
          </div>
          <PayFastAutoPost action={payfastRedirect.url} fields={payfastRedirect.fields} />
        </>
      )}

      <style>{`
        .checkout-input {
          width: 100%;
          border: 1px solid color-mix(in oklab, var(--espresso) 18%, transparent);
          background: color-mix(in oklab, var(--cream) 92%, white);
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .checkout-input:focus {
          border-color: var(--coral);
        }
      `}</style>
    </div>
  );
}

function PayFastAutoPost({
  action,
  fields,
}: {
  action: string;
  fields: Record<string, string>;
}) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    queueMicrotask(() => ref.current?.submit());
  }, []);
  return (
    <form ref={ref} action={action} method="POST" className="fixed left-0 top-0 -z-10 opacity-0 pointer-events-none" aria-hidden>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </form>
  );
}

function Field({
  label,
  children,
  error,
  className = "",
}: {
  label: string;
  children: ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[11px] uppercase tracking-luxe text-espresso/55 mb-2">{label}</label>
      {children}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SummaryCard({
  items,
  subtotal,
  shippingCost,
  total,
  submitting,
}: {
  items: { slug: string; name: string; size: string; qty: number; price: number; image: string }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  submitting: boolean;
}) {
  return (
    <div className="border border-cream/25 bg-cream/5 backdrop-blur-sm text-cream">
      <div className="border-b border-cream/15 px-6 py-5">
        <h3 className="font-serif text-2xl">Order summary</h3>
        <p className="text-[11px] uppercase tracking-luxe text-cream/55 mt-1">{items.length} line item(s)</p>
      </div>
      <div className="max-h-[min(420px,50vh)] overflow-y-auto divide-y divide-cream/10">
        {items.map((item) => (
          <div key={item.slug + item.size} className="flex gap-4 px-6 py-4">
            <img src={item.image} alt="" className="w-16 h-20 object-cover shrink-0 border border-cream/15" />
            <div className="flex-1 min-w-0">
              <p className="font-serif text-lg leading-tight truncate">{item.name}</p>
              <p className="text-[11px] uppercase tracking-luxe text-cream/55 mt-1">Size {item.size} × {item.qty}</p>
            </div>
            <p className="font-serif text-base shrink-0">{formatPrice(item.price * item.qty)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-cream/15 px-6 py-6 space-y-3 font-serif">
        <div className="flex justify-between text-cream/85">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-cream/85">
          <span>Shipping</span>
          <span>{formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between text-2xl pt-4 border-t border-cream/15">
          <span>Total</span>
          <span className="text-gold">{formatPrice(total)}</span>
        </div>
      </div>
      <div className="px-6 pb-6">
        <p className="text-[11px] text-cream/50 leading-relaxed">
          Prices in ZAR. Duties may apply outside South Africa — we&apos;ll confirm before dispatch.
        </p>
      </div>
      {submitting && (
        <div className="px-6 pb-6 -mt-4">
          <p className="text-xs text-gold animate-pulse">Processing your order…</p>
        </div>
      )}
    </div>
  );
}
