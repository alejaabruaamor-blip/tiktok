import { useEffect, useState, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { mirrorHead } from "@/components/MirrorPage";
import { Button } from "@/components/ui/button";
import { loadAddress, saveAddress, maskCep, maskCpf, maskPhone, type Address } from "@/lib/address";

export const Route = createFileRoute("/endereco")({
  validateSearch: (s: Record<string, unknown>) => ({
    funnel: typeof s["funnel"] === "string" ? (s["funnel"] as string) : undefined,
  }),
  head: mirrorHead("Endereço de Entrega | TikTok Shop", "Informe seu endereço de entrega."),
  component: Endereco,
});

const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");

const EMPTY: Address = {
  nome: "", telefone: "", email: "", cep: "", estado: "", cidade: "", bairro: "",
  endereco: "", numero: "", complemento: "", cpf: "", padrao: false,
};

const inputCls = "w-full bg-transparent text-[15px] outline-none placeholder:text-[#8a8b91] ";

function Field({ last, children }: { last?: boolean; children: ReactNode }) {
  return (
    <div className={last ? "px-4 " : "px-4 border-b border-[#f0f0f0]"}>
      <div className="flex items-center py-3.5">{children}</div>
    </div>
  );
}

const Chevron = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#8a8b91]" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
);

function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div aria-hidden={!open} className={`fixed inset-0 z-[100] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div onClick={onClose} className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[440px] justify-center">
        <div className={`relative w-full rounded-t-2xl bg-white transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}>
          <div className="relative flex items-center justify-center border-b border-[#f0f0f0] px-4 py-3">
            <span className="text-[15px] font-semibold">{title}</span>
            <button onClick={onClose} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#161823]" aria-label="Fechar">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Endereco() {
  const { funnel } = Route.useSearch();
  const back = funnel === "/upsell" ? "/upsell" : funnel === "/w3" ? "/w3/checkout" : "/checkout";
  const navigate = useNavigate();
  const [a, setA] = useState<Address>(EMPTY);
  const [sheet, setSheet] = useState<"uf" | "city" | null>(null);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    const saved = loadAddress();
    if (saved) setA(saved);
  }, []);

  const set = (k: keyof Address, v: string | boolean) => setA((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!a.estado) return setCities([]);
    let off = false;
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${a.estado}/municipios?orderBy=nome`)
      .then((r) => r.json())
      .then((l: { nome: string }[]) => !off && setCities(l.map((c) => c.nome)))
      .catch(() => {});
    return () => { off = true; };
  }, [a.estado]);

  const onCep = async (v: string) => {
    const m = maskCep(v);
    set("cep", m);
    const d = m.replace(/\D/g, "");
    if (d.length !== 8) return;
    try {
      const r = await (await fetch(`https://viacep.com.br/ws/${d}/json/`)).json();
      if (r.erro) return;
      setA((p) => ({
        ...p,
        estado: r.uf || p.estado,
        cidade: r.localidade || p.cidade,
        bairro: r.bairro || p.bairro,
        endereco: r.logradouro || p.endereco,
      }));
    } catch { /* ignore */ }
  };

  const valid =
    a.nome.trim().length > 2 &&
    a.telefone.replace(/\D/g, "").length >= 10 &&
    /\S+@\S+\.\S+/.test(a.email) &&
    a.cep.replace(/\D/g, "").length === 8 &&
    !!a.estado && !!a.cidade && !!a.bairro.trim() && !!a.endereco.trim() && !!a.numero.trim() &&
    a.cpf.replace(/\D/g, "").length === 11;

  const save = () => {
    if (!valid) return;
    saveAddress(a);
    navigate({ to: back });
  };

  return (
    <div className="min-h-screen w-full bg-[#e5e5e7]">
      <div className="mx-auto min-h-screen w-full max-w-[440px] bg-white shadow-[0_0_40px_rgba(0,0,0,0.08)]">
        <div className="relative min-h-screen bg-[#f5f5f5] pb-[130px]">
          <div className="sticky top-0 z-30 bg-white">
            <div className="relative flex h-12 items-center px-2">
              <Link aria-label="Voltar" className="grid h-10 w-10 place-items-center" to={back}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[#161823]" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
              </Link>
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[17px] font-bold">Adicionar o novo endereço</div>
            </div>
          </div>

          <div className="px-4 pb-2 pt-4 text-[13px] text-[#5a5b60]">Informações de contato</div>
          <div className="bg-white">
            <Field><input type="text" placeholder="Nome completo" className={inputCls} value={a.nome} onChange={(e) => set("nome", e.target.value)} /></Field>
            <div className="border-b border-[#f0f0f0] px-4">
              <div className="flex items-center py-3.5">
                <span className="mr-2 text-[15px] text-[#161823]">BR</span>
                <span className="mr-2 text-[15px] text-[#161823]">+55</span>
                <span className="mr-3 h-4 w-px bg-[#e5e5e7]" />
                <input inputMode="numeric" placeholder="Número de telefone" className={inputCls} value={a.telefone} onChange={(e) => set("telefone", maskPhone(e.target.value))} />
              </div>
            </div>
            <Field last><input type="email" inputMode="email" placeholder="Email" className={inputCls} value={a.email} onChange={(e) => set("email", e.target.value)} /></Field>
          </div>

          <div className="px-4 pb-2 pt-4 text-[13px] text-[#5a5b60]">Informações de endereço</div>
          <div className="bg-white">
            <Field><input type="text" inputMode="numeric" placeholder="CEP/Código postal" className={inputCls} value={a.cep} onChange={(e) => onCep(e.target.value)} /></Field>
            <div className="grid grid-cols-2 border-b border-[#f0f0f0]">
              <button type="button" onClick={() => setSheet("uf")} className="flex items-center justify-between px-4 py-3.5 text-left ">
                <span className={`text-[15px] ${a.estado ? "text-[#161823]" : "text-[#8a8b91]"}`}>{a.estado || "Estado/UF"}</span>
                <Chevron />
              </button>
              <button type="button" onClick={() => a.estado && setSheet("city")} className="flex items-center justify-between px-4 py-3.5 text-left border-l border-[#f0f0f0]">
                <span className={`text-[15px] ${a.cidade ? "text-[#161823]" : "text-[#8a8b91]"}`}>{a.cidade || "Cidade"}</span>
                <Chevron />
              </button>
            </div>
            <Field><input type="text" placeholder="Bairro/Distrito" className={inputCls} value={a.bairro} onChange={(e) => set("bairro", e.target.value)} /></Field>
            <Field><input type="text" placeholder="Endereço" className={inputCls} value={a.endereco} onChange={(e) => set("endereco", e.target.value)} /></Field>
            <Field><input type="text" placeholder={'Nº da residência. Use "s/n" se nenhum'} className={inputCls} value={a.numero} onChange={(e) => set("numero", e.target.value)} /></Field>
            <Field last><input type="text" placeholder="Apartamento, bloco, unidade etc. (opcional)" className={inputCls} value={a.complemento} onChange={(e) => set("complemento", e.target.value)} /></Field>
          </div>

          <div className="px-4 pb-2 pt-4 text-[13px] text-[#5a5b60]">Informações fiscais</div>
          <div className="bg-white">
            <Field last><input type="text" inputMode="numeric" placeholder="CPF" className={inputCls} value={a.cpf} onChange={(e) => set("cpf", maskCpf(e.target.value))} /></Field>
          </div>
          <div className="bg-white px-4 pb-3 text-[12.5px]"><span className="text-[#8a8b91]">O CPF será usado para emitir faturas.</span></div>

          <div className="px-4 pb-2 pt-4 text-[13px] text-[#5a5b60]">Configurações</div>
          <div className="bg-white">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[15px]">Definir como padrão</span>
              <button type="button" onClick={() => set("padrao", !a.padrao)} aria-pressed={a.padrao} className={`relative h-[26px] w-[46px] rounded-full transition ${a.padrao ? "bg-[#fe2c55]" : "bg-[#e5e5e7]"}`}>
                <span className={`absolute top-[2px] h-[22px] w-[22px] rounded-full bg-white shadow transition-all ${a.padrao ? "left-[22px]" : "left-[2px]"}`} />
              </button>
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[440px] bg-white pt-2">
            <div className="px-6 pb-2 text-center text-[12px] leading-relaxed text-[#5a5b60]">Leia a <span className="font-semibold text-[#161823]">Política de privacidade do TikTok</span> para saber mais sobre como usamos suas informações pessoais.</div>
            <div className="px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
              <Button type="button" onClick={save} aria-disabled={!valid} className="address-save-button w-full h-12 rounded-full text-[16px] font-semibold">Salvar</Button>
            </div>
          </div>
        </div>
      </div>

      <Sheet open={sheet === "uf"} title="Estado/UF" onClose={() => setSheet(null)}>
        <div className="grid grid-cols-4 gap-2 py-2">
          {UFS.map((u) => (
            <button key={u} type="button" onClick={() => { setA((p) => ({ ...p, estado: u, cidade: p.estado === u ? p.cidade : "" })); setSheet(null); }}
              className={`rounded-md border py-2 text-[14px] ${a.estado === u ? "border-[#fe2c55] text-[#fe2c55]" : "border-[#e5e5e7]"}`}>{u}</button>
          ))}
        </div>
      </Sheet>
      <Sheet open={sheet === "city"} title="Cidade" onClose={() => setSheet(null)}>
        <div className="divide-y divide-[#f0f0f0] py-2">
          {cities.length === 0 && <div className="py-3 text-center text-[14px] text-[#8a8b91]">Carregando...</div>}
          {cities.map((c) => (
            <button key={c} type="button" onClick={() => { set("cidade", c); setSheet(null); }} className="flex w-full items-center justify-between py-3 text-left text-[14px]">
              <span className={a.cidade === c ? "text-[#fe2c55]" : ""}>{c}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
