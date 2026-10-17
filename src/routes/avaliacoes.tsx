import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/ferramenta-avaliacoes.html?raw";

export const Route = createFileRoute("/avaliacoes")({
  head: mirrorHead(
    "Avaliações dos clientes | SOARFLY Kit 4 em 1",
    "Veja as avaliações e fotos de clientes do Kit Ferramentas SOARFLY 4 em 1 48Vf."
  ),
  component: () => <MirrorPage html={html} />,
});
