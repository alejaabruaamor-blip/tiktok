import { type ReactNode } from 'react';
import { ArrowLeft, Check, Copy, LoaderCircle, LockKeyhole, QrCode, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './pix-payment.css';

type Props = {
  title: string;
  subtitle: string;
  transaction: { copy: string; amount: number } | null;
  qr: string;
  copied: boolean;
  error: string;
  expired?: boolean;
  onCopy: () => void;
  onRetry: () => void;
  onBack?: () => void;
  children?: ReactNode;
};

export function PixPaymentView({ title, subtitle, transaction, qr, copied, error, expired, onCopy, onRetry, onBack }: Props) {
  return <main className="pix-payment-page">
    <div className="pix-payment-content">
      <header className="pix-payment-header">
        <span className="pix-payment-brand">TikTok Shop <span>· Pix</span></span>
        <LockKeyhole size={17} aria-hidden="true" />
      </header>
      <section className="pix-payment-intro">
        <div className="pix-payment-shield"><ShieldCheck size={29} aria-hidden="true" /></div>
        <div className="pix-payment-secure"><ShieldCheck size={14} aria-hidden="true" /> Pagamento seguro</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>
      {error && <div role="alert" className="pix-payment-error">{error}</div>}
      {!transaction && !error && <div className="pix-payment-loading" role="status"><LoaderCircle className="pix-payment-spinner" size={28} aria-hidden="true" /><span>Gerando seu Pix…</span></div>}
      {transaction && !expired && <>
        <div className="pix-payment-total"><span>Total a pagar</span><strong>R$ {(transaction.amount / 100).toFixed(2).replace('.', ',')}</strong><span className="pix-payment-currency">À vista no Pix</span></div>
        <div className="pix-payment-qr-area"><div className="pix-payment-qr-frame"><img src={qr} alt="QR Code Pix" width={240} height={240} /></div><span><QrCode size={15} aria-hidden="true" /> QR Code do pagamento</span></div>
        <div className="pix-payment-divider"><span>Pix copia e cola</span></div>
        <label className="pix-payment-code-label" htmlFor="pix-payment-code">Código Pix</label>
        <textarea id="pix-payment-code" className="pix-payment-code" value={transaction.copy} readOnly spellCheck={false} rows={3} />
        <Button variant="pix" size="lg" className="pix-payment-copy" onClick={onCopy}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? 'Código copiado!' : 'Copiar código Pix'}</Button>
        <div role="status" className="pix-payment-pending"><span className="pix-payment-status-dot" /> Aguardando pagamento</div>
        <p className="pix-payment-notice">A confirmação aparece automaticamente após a aprovação do Pix.</p>
      </>}
      {error && (!transaction || expired) && <Button variant="pix" size="lg" className="pix-payment-copy" onClick={onRetry}><RotateCcw aria-hidden="true" />Tentar novamente</Button>}
      {onBack && <Button variant="ghost" className="pix-payment-back" onClick={onBack}><ArrowLeft aria-hidden="true" />Voltar às ofertas</Button>}
      <footer className="pix-payment-footer"><LockKeyhole size={13} aria-hidden="true" /><span>Pagamento via Pix · Processado pela BravoPay</span></footer>
    </div>
  </main>;
}
