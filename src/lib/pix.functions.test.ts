import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: (validate: (data: unknown) => unknown) => ({
      handler: (handler: (args: { data: unknown }) => unknown) =>
        (args: { data: unknown }) => handler({ data: validate(args.data) }),
    }),
  }),
}));

import { createPix } from "./pix.functions";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("BravoPay Pix response", () => {
  it.each([undefined, null])("handles missing QR image (%s) without losing the Pix code", async (qr_code) => {
    vi.stubEnv("BRAVOPAY_API_KEY", "test-key-not-a-real-credential");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      id: "test-transaction", status: "PENDING",
      pix: { copy_paste: "test-pix-code", qr_code, expires_at: "2026-10-17T20:00:00Z" },
    }), { status: 200 })));
    const result = await createPix({ data: {
      product: "ferramenta",
      customer: { name: "Test", email: "test@example.com", cpf: "", phone: "" },
    } });
    expect(result.pix?.qr_code).toBe("");
    expect(result.pix?.copy_paste).toBe("test-pix-code");
    expect(result.pix?.qr_code.startsWith("data:")).toBe(false);
  });
});
