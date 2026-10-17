import { createServerFn } from "@tanstack/react-start";

// Prices are fixed on the server so the customer can't change the amount.
const PRODUCTS = {
  ferramenta: { amount_cents: 9790, description: "Kit Ferramentas SOARFLY 4 em 1" },
  w3: { amount_cents: 8790, description: "Extratora Portátil WAP Spot Cleaner W3" },
} as const;
export type PixProduct = keyof typeof PRODUCTS;

const API = "https://bravopay.club/api/v1";

function apiKey() {
  const k = process.env["BRAVOPAY_API_KEY"];
  if (!k) throw new Error("BRAVOPAY_API_KEY não configurada");
  return k;
}

async function bravo(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey()}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`BravoPay [${res.status}]: ${text}`);
    throw new Error(`Falha ao gerar o Pix [${res.status}]`);
  }
  return JSON.parse(text) as {
    id: string;
    status: "PENDING" | "PAID" | "EXPIRED" | "REFUNDED" | "CHARGEBACK";
    pix?: { copy_paste: string; qr_code?: string | null; expires_at: string } | null;
  };
}

type CreateInput = {
  product: PixProduct;
  customer: { name: string; email: string; cpf: string; phone: string };
  utm?: Record<string, string>;
};

export const createPix = createServerFn({ method: "POST" })
  .inputValidator((d: CreateInput) => {
    if (!(d.product in PRODUCTS)) throw new Error("Produto inválido");
    const c = d.customer ?? ({} as CreateInput["customer"]);
    const s = (v: unknown, n = 120) => String(v ?? "").slice(0, n);
    const utm: Record<string, string> = {};
    for (const [k, v] of Object.entries(d.utm ?? {}).slice(0, 10)) utm[s(k, 40)] = s(v, 200);
    return {
      product: d.product,
      customer: { name: s(c.name), email: s(c.email), cpf: s(c.cpf).replace(/\D/g, ""), phone: s(c.phone).replace(/\D/g, "") },
      utm,
    };
  })
  .handler(async ({ data }) => {
    const p = PRODUCTS[data.product];
    const tx = await bravo("/transactions", {
      method: "POST",
      body: JSON.stringify({
        amount_cents: p.amount_cents,
        method: "pix",
        description: p.description,
        customer: data.customer,
        utm: data.utm,
        expires_in: 1800,
      }),
    });
    // BravoPay may omit the image while returning a valid copy-and-paste code.
    // Keep qr_code a string so the payment page can use its existing QR fallback.
    const pix = tx.pix && typeof tx.pix.copy_paste === "string" && tx.pix.copy_paste.trim()
      ? { ...tx.pix, qr_code: typeof tx.pix.qr_code === "string" ? tx.pix.qr_code : "" }
      : null;
    return { id: tx.id, status: tx.status, pix, amount_cents: p.amount_cents };
  });

export const getPixStatus = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => ({ id: String(d.id).replace(/[^\w-]/g, "").slice(0, 80) }))
  .handler(async ({ data }) => {
    const tx = await bravo(`/transactions/${data.id}`);
    return { status: tx.status };
  });
