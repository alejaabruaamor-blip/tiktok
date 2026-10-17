import { beforeEach, describe, expect, it } from 'vitest';
import { saveAddress, type Address } from './address';
import { confirmInitialOrder, confirmUpsellOrder, loadOrderReceipt, orderAddress, DELIVERY_ESTIMATE } from './order-receipt';
const address: Address = { nome: 'Cliente teste', telefone: '11999999999', email: 'teste@example.com', cpf: '52998224725', cep: '01001000', estado: 'SP', cidade: 'São Paulo', bairro: 'Sé', endereco: 'Praça da Sé', numero: '100', complemento: '', padrao: true };
beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });
describe('Paid order and upsell shipping', () => {
  it('uses the original order shipping even if the editable address changes', () => {
    confirmInitialOrder('PAID', 'initial', 'ferramenta', address);
    saveAddress({ ...address, endereco: 'Outro endereço' });
    expect(orderAddress()).toEqual(address);
  });
  it('adds paid extras to the original paid order with the same address and delivery estimate', () => {
    confirmInitialOrder('PAID', 'initial', 'ferramenta', address);
    confirmUpsellOrder('PAID', 'extra', [0, 1], { ...address, endereco: 'Outro endereço' });
    const order = loadOrderReceipt();
    expect(order?.address).toEqual(address);
    expect(order?.items.map(item => item.amount_cents)).toEqual([9790, 1015, 3251]);
    expect(order?.delivery).toBe(DELIVERY_ESTIMATE);
    expect(order?.payments).toEqual(['initial', 'extra']);
  });
  it.each(['PENDING', 'EXPIRED', 'REFUNDED', 'CHARGEBACK'])('does not add %s extras', status => {
    confirmInitialOrder('PAID', 'initial', 'ferramenta', address);
    expect(confirmUpsellOrder(status, 'extra', [0], address)).toBe(false);
    expect(loadOrderReceipt()?.items).toHaveLength(1);
  });
  it('does not duplicate extras when the paid status is checked twice', () => {
    confirmInitialOrder('PAID', 'initial', 'w3', address);
    confirmUpsellOrder('PAID', 'extra', [0], address);
    confirmUpsellOrder('PAID', 'extra', [0], address);
    expect(loadOrderReceipt()?.items.map(item => item.amount_cents)).toEqual([8790, 1015]);
  });
  it('does not confirm an unpaid initial order', () => {
    expect(confirmInitialOrder('PENDING', 'initial', 'ferramenta', address)).toBe(false);
    expect(loadOrderReceipt()).toBeNull();
  });
});
