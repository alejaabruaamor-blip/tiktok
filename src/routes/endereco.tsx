import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/endereco.html?raw";

export const Route = createFileRoute("/endereco")({
  validateSearch: (s: Record<string, unknown>) => ({
    funnel: typeof s["funnel"] === "string" ? (s["funnel"] as string) : undefined,
  }),
  head: mirrorHead(
    "Endereço de Entrega | TikTok Shop",
    "Informe seu endereço de entrega."
  ),
  component: Endereco,
});

function Endereco() {
  const { funnel } = Route.useSearch();
  const back = funnel === "/w3" ? "/w3/checkout" : "/checkout";
  return <MirrorPage html={html.replace('href="/w3/checkout"', `href="${back}"`)} />;
}
