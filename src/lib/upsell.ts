export const UPSELL_ITEMS = [
  { amount_cents: 1015, description: 'SOARFLY Canhão de Espuma' },
  { amount_cents: 3251, description: 'SOARFLY Soprador Turbo Jet' },
  { amount_cents: 3657, description: 'SOARFLY Mini Motosserra 2000 mAh' },
  { amount_cents: 5079, description: 'SOARFLY Mini Motosserra 8 polegadas' },
  { amount_cents: 5079, description: 'SOARFLY Politriz Roto-Orbital' },
  { amount_cents: 6806, description: 'SOARFLY Chave Catraca Elétrica' },
] as const;
export const UPSELL_SELECTION_KEY = 'tiktokshop:upsell-items';
export function upsellOrder(items: unknown) {
  if (!Array.isArray(items) || items.length === 0 || items.length > UPSELL_ITEMS.length || items.some(id => !Number.isInteger(id) || id < 0 || id >= UPSELL_ITEMS.length) || new Set(items).size !== items.length) throw new Error('Selecione itens válidos');
  const ids = items as number[];
  return { items: ids, amount_cents: ids.reduce((sum, id) => sum + UPSELL_ITEMS[id].amount_cents, 0), description: ids.map(id => UPSELL_ITEMS[id].description).join(' + ') };
}
export function isPixPaid(status: string) { return status === 'PAID'; }
