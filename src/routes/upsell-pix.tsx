import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/upsell-pix.html?raw";

export const Route = createFileRoute("/upsell-pix")({
  head: mirrorHead(
    "Pagamento Pix - Oferta Especial | TikTok Shop",
    "Pague sua oferta especial via Pix."
  ),
  component: () => <MirrorPage html={html} />,
});
