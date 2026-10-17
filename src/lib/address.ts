export type Address = {
  nome: string;
  telefone: string;
  email: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  endereco: string;
  numero: string;
  complemento: string;
  cpf: string;
  padrao: boolean;
};

const KEY = "tiktokshop:address";

export function loadAddress(): Address | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as Address) : null;
  } catch {
    return null;
  }
}

export function saveAddress(a: Address) {
  localStorage.setItem(KEY, JSON.stringify(a));
}

export function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function addressHtml(a: Address, href: string) {
  const d = a.telefone.replace(/\D/g, "");
  const phone = `(+55)${d.slice(0, 2)}*******${d.slice(-2)}`;
  const esc = (s: string) =>
    s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  const line = [a.endereco, a.numero, a.complemento, a.bairro, a.cidade, a.estado, a.cep]
    .filter(Boolean)
    .map(esc)
    .join(", ");
  return `<a class="block bg-white px-4 py-3.5" href="${href}"><div class="flex items-start gap-3"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin mt-1 h-[18px] w-[18px] shrink-0 text-[#161823]" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg><div class="flex-1 text-[15px] leading-snug"><div class="text-[14px] font-bold text-[#161823]">${esc(a.nome)}, ${phone}</div><div class="mt-1 text-[13px] text-[#161823]">${line}</div></div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right mt-1 h-5 w-5 text-[#c8c8cc]" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg></div></a>`;
}
