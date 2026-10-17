import { createServerFn } from "@tanstack/react-start";
import { upsellOrder } from "./upsell";
const PRODUCTS = { ferramenta: { amount_cents: 9790, description: "Kit Ferramentas SOARFLY 4 em 1" }, w3: { amount_cents: 8790, description: "Extratora Portátil WAP Spot Cleaner W3" } } as const;
export type PixProduct = keyof typeof PRODUCTS;
const API = "https://bravopay.club/api/v1";
async function bravo(path: string, init?: RequestInit) {
  const key = process.env["BRAVOPAY_API_KEY"];
  if (!key) throw new Error("BRAVOPAY_API_KEY não configurada");
  const res = await fetch(`${API}${path}`, { ...init, headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const text = await res.text();
  if (!res.ok) { console.error(`BravoPay [${res.status}]: ${text}`); throw new Error(`Falha ao gerar o Pix [${res.status}]`); }
  return JSON.parse(text) as { id: string; status: "PENDING" | "PAID" | "EXPIRED" | "REFUNDED" | "CHARGEBACK"; pix?: { copy_paste: string; qr_code?: string | null; expires_at: string } | null };
}
type Customer = { name: string; email: string; cpf: string; phone: string };
function details(c: Customer, input?: Record<string, string>) {
  const s = (v: unknown, n = 120) => String(v ?? "").slice(0, n);
  const utm: Record<string, string> = {};
  for (const [k, v] of Object.entries(input ?? {}).slice(0, 10)) utm[s(k, 40)] = s(v, 200);
  return { customer: { name: s(c?.name), email: s(c?.email), cpf: s(c?.cpf).replace(/\D/g, ""), phone: s(c?.phone).replace(/\D/g, "") }, utm };
}
async function charge(order: { amount_cents: number; description: string }, customer: Customer, utm: Record<string, string>) {
  const tx = await bravo("/transactions", { method: "POST", body: JSON.stringify({ ...order, method: "pix", customer, utm, expires_in: 1800 }) });
  const pix = tx.pix && typeof tx.pix.copy_paste === "string" && tx.pix.copy_paste.trim() ? { ...tx.pix, qr_code: typeof tx.pix.qr_code === "string" ? tx.pix.qr_code : "" } : null;
  return { id: tx.id, status: tx.status, pix, amount_cents: order.amount_cents };
}
export const createPix = createServerFn({ method: "POST" })
  .inputValidator((d: { product: PixProduct; customer: Customer; utm?: Record<string, string> }) => {
    if (!Object.hasOwn(PRODUCTS, d.product)) throw new Error("Produto inválido");
    return { product: d.product, ...details(d.customer, d.utm) };
  })
  .handler(async ({ data }) => charge(PRODUCTS[data.product], data.customer, data.utm));
export const getPixStatus = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => ({ id: String(d.id).replace(/[^\w-]/g, "").slice(0, 80) }))
  .handler(async ({ data }) => { const tx = await bravo(`/transactions/${data.id}`); return { status: tx.status }; });
export const createUpsellPix = createServerFn({ method: "POST" })
  .inputValidator((d: { items: number[]; customer: Customer; utm?: Record<string, string> }) => {
    const order = upsellOrder(d.items);
    if (!d.customer?.name?.trim() || !d.customer?.email?.trim()) throw new Error("Dados de entrega indisponíveis");
    return { order, ...details(d.customer, d.utm) };
  })
  .handler(async ({ data }) => charge({ amount_cents: data.order.amount_cents, description: data.order.description }, data.customer, data.utm));
