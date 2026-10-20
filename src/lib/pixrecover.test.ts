import { describe, it, expect } from "vitest";
import { recoveryPayload } from "./pixrecover";
const input = { product: "ferramenta" as const, customer: { name: "Maria Silva", email: "MARIA@EXEMPLO.COM" }, transaction: { id: "tx_exemplo", status: "PENDING", amount_cents: 9790, pix: { expires_at: "2026-10-20T23:00:00Z" } }, consent: true, storeUrl: "https://tiktok-two-taupe.vercel.app" };
describe("Envio do cliente e produto ao PixRecover", () => {
  it("envia o nome do cliente e o nome real do produto", () => {
    expect(recoveryPayload(input)).toMatchObject({ customer_name: "Maria Silva", customer_email: "maria@exemplo.com", product_name: "Kit Ferramentas SOARFLY 4 em 1", gateway: "bravopay", payment_id: "tx_exemplo", amount: 97.9 });
  });
  it("envia a foto https e reabre a mesma transação", () => {
    const payload = recoveryPayload(input);
    expect(payload.product_image_url).toBe("https://tiktok-two-taupe.vercel.app/media/3a6e2019-320a-446d-9306-bb7daebf9e01/header-1.webp");
    expect(payload.checkout_url).toBe("https://tiktok-two-taupe.vercel.app/pagamento?p=ferramenta&tx=tx_exemplo");
  });
  it("não inventa consentimento quando o cliente não autoriza", () => {
    expect(recoveryPayload({ ...input, consent: false }).communication_consent).toBe(false);
    expect(recoveryPayload({ ...input, consent: false }).legal_basis).toBeNull();
  });
  it("envia o nome da extratora quando esse é o produto", () => {
    expect(recoveryPayload({ ...input, product: "w3" }).product_name).toBe("Extratora Portátil WAP Spot Cleaner W3");
  });
});
