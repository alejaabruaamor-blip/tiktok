import { createFileRoute } from "@tanstack/react-router";
import { mirrorHead } from "@/components/MirrorPage";
import { UpsellMirror } from "@/components/UpsellMirror";

export const Route = createFileRoute("/upsell")({
  head: mirrorHead(
    "Oferta Especial | TikTok Shop",
    "Oferta especial pós-compra exclusiva para você."
  ),
  component: UpsellMirror,
});
