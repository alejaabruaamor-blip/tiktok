import { createFileRoute } from "@tanstack/react-router";
import { mirrorHead } from "@/components/MirrorPage";
import { UpsellPixPayment } from "@/components/UpsellPixPayment";
export const Route = createFileRoute("/upsell-pix")({ head: mirrorHead("Pagamento Pix - Oferta Especial | TikTok Shop", "Pague sua oferta especial via Pix."), component: UpsellPixPayment });
