import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/pedido-confirmado.html?raw";

export const Route = createFileRoute("/pedido-confirmado")({
  head: mirrorHead(
    "Pedido Confirmado | TikTok Shop",
    "Seu pedido foi confirmado com sucesso."
  ),
  component: () => <MirrorPage html={html} />,
});
