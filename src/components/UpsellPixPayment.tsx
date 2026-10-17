import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { loadAddress } from '@/lib/address';
import { createUpsellPix, getPixStatus } from '@/lib/pix.functions';
import { isPixPaid, upsellOrder, UPSELL_SELECTION_KEY } from '@/lib/upsell';
import './upsell-mirror.css';
export function UpsellPixPayment({ onCancel }: { onCancel?: () => void } = {}) {
  const navigate = useNavigate();
  const create = useServerFn(createUpsellPix); const status = useServerFn(getPixStatus);
  const started = useRef(false);
  const [tx, setTx] = useState<{ id: string; copy: string; qr: string; amount: number } | null>(null);
  const [error, setError] = useState(''); const [copied, setCopied] = useState(false); const [expired, setExpired] = useState(false);
  useEffect(() => {
    if (started.current) return; started.current = true;
    const address = loadAddress();
    if (!address) { setError('Dados de entrega indisponíveis. Volte ao seu pedido.'); return; }
    let items: number[];
    try { items = upsellOrder(JSON.parse(sessionStorage.getItem(UPSELL_SELECTION_KEY) ?? 'null')).items; }
    catch { setError('Selecione os itens adicionais antes de gerar o Pix.'); return; }
    const utm: Record<string, string> = {}; const query = new URLSearchParams(window.location.search);
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ttclid', 'fbclid', 'gclid']) { const value = query.get(key) ?? sessionStorage.getItem(key); if (value) utm[key] = value; }
    create({ data: { items, customer: { name: address.nome, email: address.email, cpf: address.cpf, phone: address.telefone }, utm } }).then(result => { if (!result.pix) throw new Error('Pix indisponível'); setTx({ id: result.id, copy: result.pix.copy_paste, qr: result.pix.qr_code, amount: result.amount_cents }); }).catch(() => setError('Não foi possível gerar o Pix. Tente novamente.'));
  }, [create]);
  useEffect(() => {
    if (!tx) return;
    let stopped = false; let checking = false;
    const timer = window.setInterval(async () => {
      if (checking) return; checking = true;
      try {
        const result = await status({ data: { id: tx.id } }); if (stopped) return;
        if (isPixPaid(result.status)) { window.clearInterval(timer); sessionStorage.removeItem(UPSELL_SELECTION_KEY); void navigate({ to: '/pedido-confirmado' }); }
        else if (['EXPIRED', 'REFUNDED', 'CHARGEBACK'].includes(result.status)) { window.clearInterval(timer); setExpired(true); setError('Este Pix não está mais disponível. Gere um novo código.'); }
      } catch { /* Network errors never confirm a payment. */ } finally { checking = false; }
    }, 4000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [tx, status, navigate]);
  const qr = tx ? (/^(data:image\/|https:\/\/)/.test(tx.qr) ? tx.qr : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(tx.copy)}`) : '';
  return <main className="upsell-payment">
    <h1>Itens adicionais — Pix</h1>
    {error && <p role="alert" className="pix-error">{error}</p>}
    {!tx && !error && <p role="status">Gerando seu código Pix…</p>}
    {tx && !expired && <>
      <div className="pix-amount">R$ {(tx.amount / 100).toFixed(2).replace('.', ',')}</div>
      <img className="pix-qr" src={qr} alt="QR Code Pix dos itens adicionais" />
      <div className="pix-code">{tx.copy}</div>
      <Button className="pix-action" onClick={() => { navigator.clipboard.writeText(tx.copy).then(() => setCopied(true)).catch(() => setError('Não foi possível copiar. Selecione o código Pix acima.')); }}>{copied ? 'Código copiado!' : 'Copiar código Pix'}</Button>
      <p role="status">Aguardando pagamento...</p>
    </>}
    {error && (!tx || expired) && <Button className="pix-action" onClick={() => window.location.reload()}>Tentar novamente</Button>}
    <Button variant="ghost" className="mt-4" onClick={() => { if (onCancel) onCancel(); else void navigate({ to: '/upsell' }); }}>Voltar às ofertas</Button>
  </main>;
}
