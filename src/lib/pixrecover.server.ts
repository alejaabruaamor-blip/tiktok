import { recoveryPayload } from "./pixrecover";
export async function sendRecoveryOrder(input: Parameters<typeof recoveryPayload>[0]) {
  const key = process.env["PIXRECOVER_API_KEY"];
  if (!key) { console.warn("PixRecover: configure PIXRECOVER_API_KEY no servidor da loja"); return; }
  try {
    const payload = recoveryPayload(input);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.customer_email) || payload.customer_email.length > 254) throw new Error("E-mail inválido para recuperação");
    const response = await fetch("https://screenshot-inspired-screen-maker.lovable.app/api/public/orders/pix", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) console.error(`PixRecover: envio recusado [${response.status}]`);
  } catch { console.error("PixRecover: pedido não enviado; a geração do Pix foi preservada"); }
}
