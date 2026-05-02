export const CHECKOUT_SHIPPING_OPTIONS = [
  { id: "standard" as const, label: "Standard", detail: "5–7 business days", price: 85 },
  { id: "express" as const, label: "Express", detail: "2–3 business days", price: 150 },
];

export type CheckoutShippingId = (typeof CHECKOUT_SHIPPING_OPTIONS)[number]["id"];

export function getCheckoutShippingPrice(id: CheckoutShippingId): number {
  return CHECKOUT_SHIPPING_OPTIONS.find((o) => o.id === id)?.price ?? CHECKOUT_SHIPPING_OPTIONS[0].price;
}
