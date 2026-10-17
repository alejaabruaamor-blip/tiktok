import { describe, expect, it } from 'vitest';
import { upsellOrder, isPixPaid } from './upsell';
describe('Upsell charging rules', () => {
  it.each([[0, 1015], [1, 3251], [2, 3657], [3, 5079], [4, 5079], [5, 6806]])('charges offer %i at its existing price', (id, cents) => { expect(upsellOrder([id]).amount_cents).toBe(cents); });
  it('sums only selected items', () => { expect(upsellOrder([0, 1]).amount_cents).toBe(4266); });
  it.each([[], [0, 0], [-1], [6], [0.5], ['0'], null])('rejects invalid selection %j', value => { expect(() => upsellOrder(value)).toThrow(); });
  it('confirms only PAID', () => { expect(isPixPaid('PAID')).toBe(true); for (const status of ['PENDING', 'EXPIRED', 'REFUNDED', 'CHARGEBACK']) expect(isPixPaid(status)).toBe(false); });
});
