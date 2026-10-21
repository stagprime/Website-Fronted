"use client";
import { useEffect, useRef, useState } from "react";
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export function CursorGlow() {
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced() || !window.matchMedia("(pointer:fine)").matches) return;
    let raf = 0;
    const m = (e: PointerEvent) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const el = r.current; if (!el) return; el.style.setProperty("--x", `${e.clientX}px`); el.style.setProperty("--y", `${e.clientY}px`);
      document.documentElement.style.setProperty("--px", `${(e.clientX / innerWidth - .5) * 2}`); document.documentElement.style.setProperty("--py", `${(e.clientY / innerHeight - .5) * 2}`);
    }); };
    addEventListener("pointermove", m, { passive: true }); return () => removeEventListener("pointermove", m);
  }, []);
  return <div ref={r} aria-hidden className="pointer-events-none absolute inset-0 cursor-glow" />;
}
export function Counter({ value }: { value: string }) {
  const m = value.match(/^(\D*)(\d+)(.*)$/); const target = m ? +m[2] : 0;
  const [n, setN] = useState(target); const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!m || reduced()) return; setN(0);
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); const t0 = performance.now();
      const step = (t: number) => { const p = Math.min(1, (t - t0) / 1400); setN(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
    if (el.current) io.observe(el.current); return () => io.disconnect();
  }, []); // eslint-disable-line
  return <span ref={el}>{m ? `${m[1]}${n}${m[3]}` : value}</span>;
}
export function StickySteps({ steps }: { steps: string[][] }) {
  const [a, setA] = useState(0); const refs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setA(+(e.target as HTMLElement).dataset.i!)), { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach(r => r && io.observe(r)); return () => io.disconnect();
  }, []);
  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <div className="lg:sticky lg:top-32 self-start">
        <p className="font-display text-[11px] tracking-[.3em] uppercase text-sky-brand mb-4">How We Work</p>
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight">From audit<br />to scale.</h2>
        <div className="mt-10 hidden lg:flex items-end gap-6">
          <span className="font-display text-[9rem] leading-none font-extrabold grad-text">0{a + 1}</span>
          <span className="pb-6 font-display text-2xl text-white">{steps[a][0]}</span>
        </div>
        <div className="mt-6 hidden lg:block h-1 w-full rounded bg-white/10"><div className="h-1 rounded bg-gradient-to-r from-sky-brand to-blue-brand transition-all duration-500" style={{ width: `${((a + 1) / steps.length) * 100}%` }} /></div>
      </div>
      <ol className="space-y-6 lg:space-y-[28vh] lg:py-[12vh]">
        {steps.map(([h, d], i) => (
          <li key={h} data-i={i} ref={e => { refs.current[i] = e; }} className={`rounded-3xl border p-8 transition duration-500 ${a === i ? "border-sky-brand/60 bg-navy-800/80 shadow-2xl shadow-sky-brand/10" : "border-white/10 bg-navy-900/40 lg:opacity-50"}`}>
            <span className="font-display text-sky-brand">0{i + 1}</span><h3 className="mt-3 font-display text-2xl font-bold text-white">{h}</h3><p className="mt-3 text-slate-300">{d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
