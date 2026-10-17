import { useEffect, useState } from "react";
import { MirrorPage } from "@/components/MirrorPage";
import { addressHtml, loadAddress } from "@/lib/address";

export function CheckoutMirror({ html }: { html: string }) {
  const [out, setOut] = useState(html);
  useEffect(() => {
    const a = loadAddress();
    if (!a) return;
    setOut(
      html.replace(
        /<a class="block bg-white px-4 py-3\.5" href="(\/endereco[^"]*)">[\s\S]*?<\/a>/,
        (_m, href: string) => addressHtml(a, href)
      )
        // Address filled: "Fazer pedido" goes to the post-purchase upsell.
        .replace(/onclick="location\.href='\/endereco[^']*'"/, `onclick="location.href='/upsell'"`)
    );
  }, [html]);
  return <MirrorPage html={out} />;
}
