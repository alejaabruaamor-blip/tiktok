import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import { SliderGate } from "@/components/SliderGate";
import html from "@/mirror/ferramenta.html?raw";

export const Route = createFileRoute("/ferramenta")({
  head: mirrorHead(
    "[SOARFLY] Kit Ferramentas 4 em 1 48Vf | TikTok Shop",
    "Kit Ferramentas SOARFLY 4 em 1 48Vf sem fio com martelete, esmerilhadeira e baterias de lítio."
  ),
  component: () => (
    <SliderGate>
      <MirrorPage html={html} />
    </SliderGate>
  ),
});
