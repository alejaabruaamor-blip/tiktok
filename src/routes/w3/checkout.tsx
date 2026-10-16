import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/checkout.html?raw";

export const Route = createFileRoute("/w3/checkout")({
  head: mirrorHead(
    "Checkout - Extratora Spot Cleaner W3 | TikTok Shop",
    "Finalize sua compra da Extratora Portátil WAP Spot Cleaner W3 3 em 1 com frete grátis."
  ),
  component: () => <MirrorPage html={html} />,
});
