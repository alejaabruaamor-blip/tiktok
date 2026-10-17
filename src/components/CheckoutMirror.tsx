import { useEffect, useState } from "react";
import { MirrorPage } from "@/components/MirrorPage";
import { addressHtml, loadAddress } from "@/lib/address";

export function CheckoutMirror({ html, product }: { html: string; product: "ferramenta" | "w3" }) {
  const [out, setOut] = useState(html);
  useEffect(() => {
    const a = loadAddress();
    if (!a) return;
    setOut(
      html.replace(
        /<a class="block bg-white px-4 py-3\.5" href="(\/endereco[^"]*)">[\s\S]*?<\/a>/,
        (_m, href: string) => addressHtml(a, href)
      )
        // Address filled: "Fazer pedido" opens the Pix payment; upsell only after it is paid.
        .replace(/onclick="location\.href='\/endereco[^']*'"/, `onclick="location.href='/pagamento?p=${product}'"`)
    );
  }, [html]);
  return <MirrorPage html={out} />;
}
