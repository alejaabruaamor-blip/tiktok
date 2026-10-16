import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/avaliacoes.html?raw";

export const Route = createFileRoute("/w3/avaliacoes")({
  head: mirrorHead(
    "Avaliações - Extratora Spot Cleaner W3 | TikTok Shop",
    "Veja as avaliações de quem comprou a Extratora Portátil WAP Spot Cleaner W3 3 em 1."
  ),
  component: () => <MirrorPage html={html} />,
});
