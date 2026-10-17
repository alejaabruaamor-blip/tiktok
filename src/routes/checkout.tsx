import { createFileRoute } from "@tanstack/react-router";
import { mirrorHead } from "@/components/MirrorPage";
import { CheckoutMirror } from "@/components/CheckoutMirror";
import html from "@/mirror/ferramenta-checkout.html?raw";

export const Route = createFileRoute("/checkout")({
  head: mirrorHead(
    "Finalizar pedido | TikTok Shop",
    "Finalize o pedido do Kit Ferramentas SOARFLY 4 em 1 com frete grátis."
  ),
  component: () => <CheckoutMirror html={html} product="ferramenta" />,
});
