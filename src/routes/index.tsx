import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/ferramenta.html?raw";

export const Route = createFileRoute("/")({
  head: mirrorHead(
    "[SOARFLY] Kit Ferramentas 4 em 1 48Vf | TikTok Shop",
    "Kit Ferramentas SOARFLY 4 em 1 48Vf com baterias de lítio sem fio: martelete, esmerilhadeira e mais. Frete grátis."
  ),
  component: () => <MirrorPage html={html} />,
});
