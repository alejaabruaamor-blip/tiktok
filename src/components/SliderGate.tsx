import { useRef, useState, type ReactNode, type PointerEvent } from "react";

const KNOB = 56;
const PAD = 6;

export function SliderGate({ children }: { children: ReactNode }) {
  const [passed, setPassed] = useState(false);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const start = useRef(0);

  if (passed) return <>{children}</>;

  const max = () => (track.current ? track.current.clientWidth - KNOB - PAD * 2 : 0);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (done) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    start.current = e.clientX - x;
    setDragging(true);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setX(Math.max(0, Math.min(max(), e.clientX - start.current)));
  };
  const up = () => {
    if (!dragging) return;
    setDragging(false);
    if (x >= max() * 0.92) {
      setX(max());
      setDone(true);
      setTimeout(() => {
        setPassed(true);
        window.scrollTo(0, 0);
      }, 500);
    } else setX(0);
  };

  const progress = max() ? x / max() : 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f1f4f9] px-6">
      <div className="w-full max-w-[380px] rounded-[22px] border border-[#e3e8ef] bg-white px-6 pb-5 pt-8 text-center shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-[#f97316] bg-[#ffeadb]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-[#f97316]" aria-hidden="true">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.35em] text-[#64748b]">Verificação de segurança</p>
        <h1 className="mt-2 text-[24px] font-extrabold tracking-[-0.01em] text-[#0f172a]">Confirme que é humano</h1>
        <p className="mt-2 text-[14px] text-[#64748b]">Arraste o controle até o final para continuar.</p>
        <div ref={track} className="relative mt-7 h-[68px] select-none overflow-hidden rounded-full border border-[#e3e8ef] bg-[#f1f4f9]" style={{ touchAction: "none" }}>
          <div className="absolute inset-y-0 left-0 rounded-full bg-[#dcfce7]" style={{ width: x + KNOB + PAD * 2, opacity: progress > 0 ? 1 : 0, transition: dragging ? "none" : "0.3s" }} />
          <span className="absolute inset-0 flex items-center justify-center pl-12 text-[15px] font-medium text-[#64748b]" style={{ opacity: done ? 0 : 1 - progress }}>
            Deslize para a direita →
          </span>
          <div
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            aria-label="Deslize para a direita"
            role="slider"
            aria-valuenow={Math.round(progress * 100)}
            className="absolute top-[6px] flex cursor-grab items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.18)] active:cursor-grabbing"
            style={{ left: PAD + x, width: KNOB, height: KNOB, transition: dragging ? "none" : "left 0.3s" }}
          >
            {done ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M20 6 9 17l-5-5" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[#475569]" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            )}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 border-t border-[#e3e8ef] pt-4 text-[12px] uppercase tracking-wide text-[#64748b]">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          SSL · Ambiente protegido
        </div>
      </div>
    </div>
  );
}
