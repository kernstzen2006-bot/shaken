import { createServerFn } from "@tanstack/react-start";
import { createHash } from "node:crypto";
import { z } from "zod";
import { loadProducts } from "@/lib/products";
import { getCheckoutShippingPrice, type CheckoutShippingId } from "@/lib/checkout-shipping";

/** PHP-style encoding expected by PayFast (spaces as `+`, uppercase hex % escapes). */
function payfastEncode(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/%20/g, "+")
    .replace(/%([0-9A-Fa-f]{2})/g, (_, hex: string) => `%${hex.toUpperCase()}`);
}

function md5Utf8(str: string): string {
  return createHash("md5").update(str, "utf8").digest("hex");
}

function splitFullName(full: string): { first: string; last: string } {
  const t = full.trim().replace(/\s+/g, " ");
  const i = t.indexOf(" ");
  if (i === -1) return { first: t || "Customer", last: "-" };
  return { first: t.slice(0, i), last: t.slice(i + 1) || "-" };
}

function digitsOnlyPhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

function getSiteUrl(): string {
  const raw =
    process.env.SITE_URL ??
    process.env.URL ??
    process.env.VITE_SITE_URL ??
    "";
  const url = raw.replace(/\/$/, "");
  if (!url) {
    throw new Error(
      "SITE_URL is not set. Add SITE_URL (public site origin, e.g. https://www.yoursite.co.za) to your deployment env / wrangler vars.",
    );
  }
  return url;
}

const preparePayFastSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(9),
  fullName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().regex(/^\d{4}$/),
  shippingId: z.enum(["standard", "express"]),
  notes: z.string().max(500).optional(),
  items: z.array(
    z.object({
      slug: z.string(),
      size: z.string(),
      qty: z.number().int().positive(),
    }),
  ),
});

export type PreparePayFastInput = z.infer<typeof preparePayFastSchema>;

function payFastProcessUrl(sandbox: boolean): string {
  return sandbox ? "https://sandbox.payfast.co.za/eng/process" : "https://www.payfast.co.za/eng/process";
}

export const preparePayFastCheckout = createServerFn({ method: "POST" })
  .inputValidator(preparePayFastSchema)
  .handler(async ({ data }: { data: PreparePayFastInput }) => {
    const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim();
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY?.trim();
    const passphrase = process.env.PAYFAST_PASSPHRASE?.trim() ?? "";

    if (!merchantId || !merchantKey) {
      throw new Error(
        "PayFast is not configured: set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY in server environment (wrangler secrets / hosting env).",
      );
    }

    const sandbox =
      process.env.PAYFAST_SANDBOX === "1" ||
      process.env.PAYFAST_SANDBOX === "true" ||
      process.env.PAYFAST_SANDBOX === "yes";

    const products = await loadProducts();
    let subtotal = 0;
    const descParts: string[] = [];

    for (const line of data.items) {
      const p = products.find((pr) => pr.slug === line.slug);
      if (!p) throw new Error(`Unknown product: ${line.slug}`);
      subtotal += p.price * line.qty;
      descParts.push(`${p.name} (${line.size}) ×${line.qty}`);
    }

    const shippingCost = getCheckoutShippingPrice(data.shippingId as CheckoutShippingId);
    const total = subtotal + shippingCost;
    const amountStr = total.toFixed(2);

    const siteUrl = getSiteUrl();
    const returnUrl = `${siteUrl}/checkout-payfast-return`;
    const cancelUrl = `${siteUrl}/checkout-payfast-cancel`;
    const notifyRaw = process.env.PAYFAST_NOTIFY_URL?.trim();

    const { first: name_first, last: name_last } = splitFullName(data.fullName);
    const cell_number = digitsOnlyPhone(data.phone);
    const m_payment_id = `SHK-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

    const addressBits = [
      data.addressLine1.trim(),
      data.addressLine2?.trim(),
      `${data.city}, ${data.province} ${data.postalCode}`,
    ].filter(Boolean);

    const item_description =
      `${descParts.join(" · ").slice(0, 200)}${data.notes?.trim() ? ` · Note: ${data.notes.trim().slice(0, 80)}` : ""}`.slice(
        0,
        250,
      );

    type PfEntry = readonly [string, string];

    const entries: PfEntry[] = [
      ["merchant_id", merchantId],
      ["merchant_key", merchantKey],
      ["return_url", returnUrl],
      ["cancel_url", cancelUrl],
    ];

    if (notifyRaw) entries.push(["notify_url", notifyRaw]);

    entries.push(
      ["name_first", name_first],
      ["name_last", name_last],
      ["email_address", data.email.trim()],
      ["cell_number", cell_number],
      ["m_payment_id", m_payment_id],
      ["amount", amountStr],
      ["item_name", "SHAKEN Swimwear Order"],
      ["item_description", item_description || "Swimwear"],
      ["custom_str1", addressBits.join(" · ").slice(0, 250)],
    );

    const signPairs = entries.filter(([, v]) => v.trim() !== "");

    let pfOutput = "";
    for (const [k, v] of signPairs) {
      pfOutput += `${k}=${payfastEncode(v)}&`;
    }
    let getString = pfOutput.slice(0, -1);
    if (passphrase !== "") {
      getString += `&passphrase=${payfastEncode(passphrase)}`;
    }
    const signature = md5Utf8(getString);

    const fields: Record<string, string> = {};
    for (const [k, v] of signPairs) {
      fields[k] = v.trim();
    }
    fields.signature = signature;

    return {
      url: payFastProcessUrl(sandbox),
      fields,
      m_payment_id,
      amount: amountStr,
    };
  });
