import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/upsell.html?raw";

export const Route = createFileRoute("/upsell")({
  head: mirrorHead(
    "Oferta Especial | TikTok Shop",
    "Oferta especial pós-compra exclusiva para você."
  ),
  component: () => <MirrorPage html={html} />,
});
