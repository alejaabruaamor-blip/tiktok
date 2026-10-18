import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => ({ inputValidator: (validate: (data: unknown) => unknown) => ({ handler: (handler: (args: { data: unknown }) => unknown) => (args: { data: unknown }) => handler({ data: validate(args.data) }) }) }) }));
import { createPix, createUpsellPix } from "./pix.functions";
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("BravoPay Pix response", () => {
  it.each([undefined, null])("handles missing QR image (%s) without losing the Pix code", async (qr_code) => {
    vi.stubEnv("BRAVOPAY_API_KEY", "test-key-not-a-real-credential");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "test-transaction", status: "PENDING", pix: { copy_paste: "test-pix-code", qr_code, expires_at: "2026-10-17T20:00:00Z" } }), { status: 200 })));
    const result = await createPix({ data: { product: "ferramenta", customer: { name: "Test", email: "test@example.com", cpf: "", phone: "" } } });
    expect(result.pix?.qr_code).toBe(""); expect(result.pix?.copy_paste).toBe("test-pix-code"); expect(result.pix?.qr_code.startsWith("data:")).toBe(false);
  });
});
describe('Upsell BravoPay transaction', () => {
  it('creates a separate Pix with the server-calculated selected total and QR fallback', async () => {
    vi.stubEnv('BRAVOPAY_API_KEY', 'test-key-not-a-real-credential');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'upsell-test', status: 'PENDING', pix: { copy_paste: 'upsell-code' } }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const result = await createUpsellPix({ data: { items: [0, 1], customer: { name: 'Test', email: 'test@example.com', cpf: '', phone: '' } } });
    expect(result.amount_cents).toBe(4266); expect(result.pix?.copy_paste).toBe('upsell-code'); expect(result.pix?.qr_code).toBe(''); const request = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined; expect(JSON.parse(String(request?.body)).amount_cents).toBe(4266);
  });
});
describe('Upsell Pix without saved delivery details', () => {
  it('still generates the Pix instead of asking for the address again', async () => {
    vi.stubEnv('BRAVOPAY_API_KEY', 'test-key-not-a-real-credential');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'no-address', status: 'PENDING', pix: { copy_paste: 'code' } }), { status: 200 })));
    const result = await createUpsellPix({ data: { items: [0], customer: { name: '', email: '', cpf: '', phone: '' } } });
    expect(result.amount_cents).toBe(1015); expect(result.pix?.copy_paste).toBe('code');
  });
});
