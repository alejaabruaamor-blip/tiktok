import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/endereco.html?raw";

export const Route = createFileRoute("/endereco")({
  head: mirrorHead(
    "Endereço de Entrega | TikTok Shop",
    "Informe seu endereço de entrega."
  ),
  component: () => <MirrorPage html={html} />,
});
