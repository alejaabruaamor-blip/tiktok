import { loadAddress, type Address } from './address';
import { isPixPaid, upsellOrder, UPSELL_ITEMS } from './upsell';
export const ORDER_RECEIPT_KEY = 'tiktokshop:paid-order';
export const DELIVERY_ESTIMATE = '17 – 19 de out.';
export type PaidItem = { description: string; amount_cents: number };
export type OrderReceipt = { address: Address | null; delivery: string; payments: string[]; items: PaidItem[] };
export function loadOrderReceipt(): OrderReceipt | null {
  // localStorage so the paid order is found even if the upsell opens in another tab.
  try { return JSON.parse(localStorage.getItem(ORDER_RECEIPT_KEY) ?? sessionStorage.getItem(ORDER_RECEIPT_KEY) ?? 'null'); } catch { return null; }
}
function saveOrderReceipt(receipt: OrderReceipt) { localStorage.setItem(ORDER_RECEIPT_KEY, JSON.stringify(receipt)); }
export function orderAddress(): Address | null { return loadOrderReceipt()?.address ?? loadAddress(); }
export function confirmInitialOrder(status: string, id: string, product: 'ferramenta' | 'w3', address: Address) {
  if (!isPixPaid(status)) return false;
  const item = product === 'w3' ? { description: 'Extratora W3', amount_cents: 8790 } : { description: 'SOARFLY Kit Ferramentas 4 em 1 48Vf', amount_cents: 9790 };
  saveOrderReceipt({ address, delivery: DELIVERY_ESTIMATE, payments: [id], items: [item] });
  return true;
}
export function confirmUpsellOrder(status: string, id: string, items: number[], address: Address | null) {
  if (!isPixPaid(status)) return false;
  const selection = upsellOrder(items);
  const receipt = loadOrderReceipt() ?? { address, delivery: DELIVERY_ESTIMATE, payments: [], items: [] };
  if (receipt.payments.includes(id)) return true;
  receipt.payments.push(id);
  for (const index of selection.items) { const item = UPSELL_ITEMS[index]; if (item) receipt.items.push({ ...item }); }
  if (!receipt.address && address) receipt.address = address;
  saveOrderReceipt(receipt);
  return true;
}
