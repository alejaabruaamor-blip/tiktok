import { useEffect, useRef } from 'react';
import { loadOrderReceipt } from '@/lib/order-receipt';
import html from '@/mirror/pedido-confirmado.html?raw';
import './upsell-mirror.css';
export function ConfirmedOrderMirror() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const receipt = loadOrderReceipt();
    const page = root.current;
    if (!page) return;
    const h1 = page.querySelector('h1');
    const product = page.querySelector('img')?.closest('.mt-2');
    if (!receipt) {
      if (h1) h1.textContent = 'Confirmação indisponível';
      product?.remove();
      page.querySelector('.font-mono')?.parentElement?.remove();
      return;
    }
    if (h1) h1.textContent = 'Pedido pago e confirmado!';
    const number = page.querySelector('.font-mono');
    if (number) number.textContent = receipt.payments[0] ?? "";
    if (product) {
      product.replaceChildren();
      for (const item of receipt.items) {
        const row = document.createElement('div'); row.className = 'receipt-item';
        const name = document.createElement('span'); name.textContent = item.description + ' · Qtd: 1';
        const amount = document.createElement('strong'); amount.textContent = (item.amount_cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        row.append(name, amount); product.append(row);
      }
      const shipping = document.createElement('div'); shipping.className = 'receipt-shipping';
      const a = receipt.address;
      const title = document.createElement('strong'); title.textContent = 'Endereço de entrega';
      const address = document.createElement('p'); address.textContent = a ? [a.nome, a.endereco, a.numero, a.complemento, a.bairro, a.cidade, a.estado, a.cep].filter(Boolean).join(', ') : 'Mesmo endereço do seu pedido';
      const estimate = document.createElement('p'); estimate.textContent = 'Previsão de entrega: ' + receipt.delivery;
      const total = document.createElement('strong'); total.textContent = 'Total pago: ' + (receipt.items.reduce((sum, item) => sum + item.amount_cents, 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      shipping.append(title, address, estimate, total); product.append(shipping);
    }
  }, []);
  return <div ref={root} dangerouslySetInnerHTML={{ __html: html }} />;
}
