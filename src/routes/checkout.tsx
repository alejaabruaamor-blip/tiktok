import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/ferramenta-checkout.html?raw";

export const Route = createFileRoute("/checkout")({
  head: mirrorHead(
    "Finalizar pedido | TikTok Shop",
    "Finalize o pedido do Kit Ferramentas SOARFLY 4 em 1 com frete grátis."
  ),
  component: () => <MirrorPage html={html} />,
});
