import { loadAddress, type Address } from './address';
import { isPixPaid, upsellOrder, UPSELL_ITEMS } from './upsell';
export const ORDER_RECEIPT_KEY = 'tiktokshop:paid-order';
export const DELIVERY_ESTIMATE = '17 – 19 de out.';
export type PaidItem = { description: string; amount_cents: number };
export type OrderReceipt = { address: Address; delivery: string; payments: string[]; items: PaidItem[] };
export function loadOrderReceipt(): OrderReceipt | null {
  try { return JSON.parse(sessionStorage.getItem(ORDER_RECEIPT_KEY) ?? 'null'); } catch { return null; }
}
export function orderAddress(): Address | null { return loadOrderReceipt()?.address ?? loadAddress(); }
export function confirmInitialOrder(status: string, id: string, product: 'ferramenta' | 'w3', address: Address) {
  if (!isPixPaid(status)) return false;
  const item = product === 'w3' ? { description: 'Extratora W3', amount_cents: 8790 } : { description: 'SOARFLY Kit Ferramentas 4 em 1 48Vf', amount_cents: 9790 };
  sessionStorage.setItem(ORDER_RECEIPT_KEY, JSON.stringify({ address, delivery: DELIVERY_ESTIMATE, payments: [id], items: [item] } satisfies OrderReceipt));
  return true;
}
export function confirmUpsellOrder(status: string, id: string, items: number[], address: Address) {
  if (!isPixPaid(status)) return false;
  const selection = upsellOrder(items);
  const receipt = loadOrderReceipt() ?? { address, delivery: DELIVERY_ESTIMATE, payments: [], items: [] };
  if (receipt.payments.includes(id)) return true;
  receipt.payments.push(id);
  receipt.items.push(...selection.items.map(index => ({ ...UPSELL_ITEMS[index] })));
  sessionStorage.setItem(ORDER_RECEIPT_KEY, JSON.stringify(receipt));
  return true;
}
