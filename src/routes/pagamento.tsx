import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { mirrorHead } from "@/components/MirrorPage";
import { type Address, loadAddress } from "@/lib/address";
import { createPix, getPixStatus, getExistingPix, type PixProduct } from "@/lib/pix.functions";
import { getCampaignParameters, trackPayment } from "@/lib/ad-tracking";
import { confirmInitialOrder } from "@/lib/order-receipt";
import { PixPaymentView } from "@/components/PixPaymentView";
export const Route = createFileRoute("/pagamento")({
  validateSearch: (s: Record<string, unknown>) => ({
    p: (s["p"] === "w3" ? "w3" : "ferramenta") as PixProduct,
    tx: typeof s["tx"] === "string" && /^[\w-]{1,80}$/.test(s["tx"]) ? s["tx"] : undefined,
  }),
  head: mirrorHead("Pagamento via Pix | TikTok Shop", "Pague com Pix para confirmar seu pedido."),
  component: Pagamento,
});
function Pagamento() {
  const { p, tx: existingId } = Route.useSearch();
  const navigate = useNavigate();
  const create = useServerFn(createPix);
  const status = useServerFn(getPixStatus);
  const existing = useServerFn(getExistingPix);
  const [expired, setExpired] = useState(false);
  const [tx, setTx] = useState<{ id: string; copy: string; qr: string; amount: number } | null>(null);
  const shippingAddress = useRef<Address | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const a = loadAddress();
    if (existingId) {
      shippingAddress.current = a;
      existing({ data: { id: existingId } }).then(r => {
        if (r.status === "PAID") { setErr("Este pedido já foi pago."); return; }
        if (r.status !== "PENDING") { setExpired(true); setErr("Este Pix expirou. Gere um novo pagamento."); return; }
        if (!r.pix) throw new Error("Pix indisponível");
        setTx({ id: r.id, copy: r.pix.copy_paste, qr: r.pix.qr_code, amount: r.amount_cents });
      }).catch(() => setErr("Não foi possível abrir o pagamento."));
      return;
    }
    if (!a) { navigate({ to: "/endereco", search: { funnel: p === "w3" ? "/w3" : "/ferramenta" } }); return; }
    shippingAddress.current = a;
    getCampaignParameters().catch(() => ({})).then(utm => create({ data: { product: p, customer: { name: a.nome, email: a.email, cpf: a.cpf, phone: a.telefone }, communication_consent: localStorage.getItem(`pixrecover:consent:${p}`) === "true", utm } }))
      .then((r) => {
        if (!r.pix) throw new Error("Pix indisponível");
        setTx({ id: r.id, copy: r.pix.copy_paste, qr: r.pix.qr_code, amount: r.amount_cents });
      }).catch(() => setErr("Não foi possível gerar o Pix. Tente novamente."));
  }, [p, existingId]);
  useEffect(() => {
    if (!tx) return;
    const t = setInterval(async () => {
      try {
        const r = await status({ data: { id: tx.id } });
        if (r.status === "PAID") {
          const address = shippingAddress.current;
          if (!address) { setTx(null); setErr("Este pedido já foi pago."); clearInterval(t); return; }
          confirmInitialOrder(r.status, tx.id, p, address);
          await trackPayment(r.status, tx.id, tx.amount, p).catch(() => false);
          clearInterval(t);
          navigate({ to: "/upsell" });
        }
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [tx]);
  const qrSrc = tx ? tx.qr.startsWith("data:") || tx.qr.startsWith("http") ? tx.qr : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(tx.copy)}` : "";
  return <PixPaymentView title="Pague com Pix" subtitle="Seu pedido é confirmado assim que o pagamento for aprovado." transaction={tx} qr={qrSrc} copied={copied} error={err} expired={expired}
    onCopy={() => {
      if (!tx) return;
      navigator.clipboard.writeText(tx.copy).then(() => setCopied(true)).catch(() => setErr("Não foi possível copiar. Selecione o código Pix acima."));
    }}
    onRetry={() => { if (existingId) window.location.assign(`/pagamento?p=${p}`); else window.location.reload(); }}
  />;
}
