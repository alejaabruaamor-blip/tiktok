import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MirrorPage } from "@/components/MirrorPage";
import { addressHtml, loadAddress } from "@/lib/address";

export function CheckoutMirror({ html, product }: { html: string; product: "ferramenta" | "w3" }) {
  const [out, setOut] = useState(html);
  const host = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const [consent, setConsent] = useState(false);
  useEffect(() => {
    const a = loadAddress();
    if (!a) return;
    setOut(html.replace(/<a class="block bg-white px-4 py-3\.5" href="(\/endereco[^"]*)">[\s\S]*?<\/a>/, (_m, href: string) => addressHtml(a, href)).replace(/onclick="location\.href='\/endereco[^']*'"/, `onclick="location.href='/pagamento?p=${product}'"`));
  }, [html, product]);
  useEffect(() => {
    const photo = host.current?.querySelector('img[src*="/media/"]');
    const section = photo?.parentElement?.parentElement;
    if (!section) return;
    const node = document.createElement("div");
    section.insertAdjacentElement("afterend", node);
    setTarget(node);
    try { setConsent(localStorage.getItem(`pixrecover:consent:${product}`) === "true"); } catch {}
    return () => node.remove();
  }, [out, product]);
  return <div ref={host}>
    <MirrorPage html={out} />
    {target && createPortal(<label className="flex items-start gap-3 px-4 py-3 text-sm">
      <input type="checkbox" checked={consent} onChange={e => {
        setConsent(e.target.checked);
        try { localStorage.setItem(`pixrecover:consent:${product}`, String(e.target.checked)); } catch {}
      }} aria-label="Receber lembretes do pedido por e-mail" />
      <span>Quero receber lembretes por e-mail se o pagamento deste pedido ficar pendente. Posso cancelar a qualquer momento.</span>
    </label>, target)}
  </div>;
}
