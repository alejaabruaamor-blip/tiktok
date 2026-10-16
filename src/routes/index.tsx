import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/index.html?raw";

export const Route = createFileRoute("/")({
  head: mirrorHead(
    "[WAP] Extratora Spot Cleaner W3 3 em 1 1450W | TikTok Shop",
    "Extratora Portátil WAP Spot Cleaner W3 3 em 1: borrifa, esfrega e extrai sujeira de sofás, tapetes, colchões e bancos de carro. 1450W, 127V, com autolimpeza e frete grátis."
  ),
  component: () => <MirrorPage html={html} />,
});
