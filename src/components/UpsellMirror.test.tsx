import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UpsellMirror } from './UpsellMirror';
import { UPSELL_SELECTION_KEY } from '@/lib/upsell';

const { navigate, loadAddress } = vi.hoisted(() => ({ navigate: vi.fn(), loadAddress: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }));
vi.mock('@/lib/address', () => ({ loadAddress }));
vi.mock('@/components/UpsellPixPayment', () => ({ UpsellPixPayment: () => <div role="status">Pix aberto</div> }));
beforeEach(() => { sessionStorage.clear(); navigate.mockReset(); loadAddress.mockReturnValue(null); });
afterEach(cleanup);

describe('Upsell payment selection', () => {
  it('enables payment for a selected offer even without saved delivery details', () => {
    const { container } = render(<UpsellMirror />);
    const offer = container.querySelector('button[aria-pressed]');
    const buy = container.querySelector<HTMLButtonElement>('.upsell-buy');
    if (!offer || !buy) throw new Error('Payment controls missing');
    expect(buy.disabled).toBe(true);
    fireEvent.click(offer);
    expect(buy.disabled).toBe(false);
    fireEvent.click(buy);
    expect(navigate).toHaveBeenCalledWith({ to: '/endereco', search: { funnel: '/upsell' } });
    expect(JSON.parse(sessionStorage.getItem(UPSELL_SELECTION_KEY) ?? 'null')).toEqual([0]);
  });
  it('restores selected offers after returning from the delivery form and opens Pix', () => {
    sessionStorage.setItem(UPSELL_SELECTION_KEY, '[0]');
    loadAddress.mockReturnValue({ nome: 'Cliente' });
    const { container, getByRole } = render(<UpsellMirror />);
    const buy = container.querySelector<HTMLButtonElement>('.upsell-buy');
    if (!buy) throw new Error('Payment control missing');
    expect(buy.disabled).toBe(false);
    fireEvent.click(buy);
    expect(getByRole('status')).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });
});