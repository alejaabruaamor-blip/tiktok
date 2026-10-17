import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import html from "@/mirror/upsell.html?raw";
import "./upsell-mirror.css";

const brl = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function UpsellMirror() {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const products = Array.from(root.querySelectorAll<HTMLButtonElement>("button[aria-pressed]"));
    const footer = root.querySelector<HTMLElement>(".fixed");
    const summary = footer?.querySelector<HTMLElement>(".flex.items-end");
    const clock = root.querySelector<HTMLElement>(".lucide-clock")?.parentElement;
    const selected = new Set<number>();
    const money = (node: Element | undefined) => Number(node?.textContent?.replace(/[^\d,]/g, "").replace(",", ".") ?? 0);
    const prices = products.map(product => {
      const spans = product.querySelectorAll(".items-baseline span");
      return { price: money(spans[0]), original: money(spans[1]) };
    });
    const update = () => {
      let total = 0;
      let savings = 0;
      selected.forEach(index => {
        const item = prices[index];
        if (item) { total += item.price; savings += item.original - item.price; }
      });
      if (summary) {
        summary.innerHTML = `<div><div class="upsell-count">${selected.size} ${selected.size === 1 ? "item selecionado" : "itens selecionados"}</div><div class="upsell-total">${brl(total)}</div></div>${selected.size ? `<div class="upsell-savings">Economia de ${brl(savings)}</div>` : ""}`;
      }
    };
    const cleanups = products.map((product, index) => {
      const marker = product.lastElementChild;
      const toggle = () => {
        if (selected.has(index)) selected.delete(index); else selected.add(index);
        const active = selected.has(index);
        product.setAttribute("aria-pressed", String(active));
        product.classList.toggle("upsell-selected", active);
        marker?.classList.toggle("upsell-check", active);
        if (marker) marker.textContent = active ? "✓" : "";
        update();
      };
      product.addEventListener("click", toggle);
      return () => product.removeEventListener("click", toggle);
    });
    const skip = footer?.querySelector<HTMLButtonElement>("button:not([disabled])");
    const onSkip = () => { void navigate({ to: "/pedido-confirmado" }); };
    skip?.addEventListener("click", onSkip);
    const started = Date.now();
    const icon = clock?.querySelector("svg")?.outerHTML ?? "";
    const tick = () => {
      const remaining = Math.max(0, 600 - Math.floor((Date.now() - started) / 1000));
      if (clock) clock.innerHTML = `${icon}${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => {
      cleanups.forEach(cleanup => cleanup());
      skip?.removeEventListener("click", onSkip);
      window.clearInterval(interval);
    };
  }, [navigate]);
  return <div className="upsell-mirror" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}