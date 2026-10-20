export const RECOVERY_PRODUCTS = {
  ferramenta: { name: "Kit Ferramentas SOARFLY 4 em 1", image: "/media/3a6e2019-320a-446d-9306-bb7daebf9e01/header-1.webp" },
  w3: { name: "Extratora Portátil WAP Spot Cleaner W3", image: "/media/f7fa74e2-8f56-4bba-9343-9cba1e4465b3/w3-header-1.webp" },
} as const;
export function recoveryPayload(input: {
  product: keyof typeof RECOVERY_PRODUCTS;
  customer: { name: string; email: string };
  transaction: { id: string; status: string; amount_cents: number; pix: { expires_at: string } | null };
  consent: boolean;
  storeUrl: string;
}) {
  const product = RECOVERY_PRODUCTS[input.product];
  const base = new URL(input.storeUrl);
  if (base.protocol !== "https:") throw new Error("A loja deve usar https");
  const checkout = new URL("/pagamento", base);
  checkout.searchParams.set("p", input.product);
  checkout.searchParams.set("tx", input.transaction.id);
  return {
    external_order_id: input.transaction.id,
    customer_name: input.customer.name.trim().slice(0, 200),
    customer_email: input.customer.email.trim().toLowerCase(),
    product_name: product.name,
    product_image_url: new URL(product.image, base).href,
    amount: input.transaction.amount_cents / 100,
    payment_id: input.transaction.id,
    payment_status: input.transaction.status === "PAID" ? "paid" : input.transaction.status === "PENDING" ? "pending" : input.transaction.status === "EXPIRED" ? "expired" : "cancelled",
    payment_expires_at: input.transaction.pix?.expires_at ?? null,
    checkout_url: checkout.href,
    gateway: "bravopay",
    communication_consent: input.consent === true,
    legal_basis: input.consent ? "Consentimento para lembretes do pedido na página de compra" : null,
  };
}
