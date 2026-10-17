import { createFileRoute } from "@tanstack/react-router";
import { mirrorHead } from "@/components/MirrorPage";
import { ConfirmedOrderMirror } from "@/components/ConfirmedOrderMirror";

export const Route = createFileRoute("/pedido-confirmado")({
  head: mirrorHead(
    "Pedido Confirmado | TikTok Shop",
    "Seu pedido foi confirmado com sucesso."
  ),
  component: ConfirmedOrderMirror,
});
