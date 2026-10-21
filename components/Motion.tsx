"use client";
import { useEffect } from "react";
// Lenis + GSAP ScrollTrigger + split reveals + manifesto scroll-light + pinned horizontal process + custom cursor.
// Everything is skipped when prefers-reduced-motion is set; content is fully visible without JS.
export default function Motion() {
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("js");
    if (reduced) { document.documentElement.classList.add("rm"); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lenis: any = null;
    let kill = () => {};
    (async () => {
      const [{ gsap }, { ScrollTrigger }, Lenis] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis").then(m => m.default)]);
      gsap.registerPlugin(ScrollTrigger);
      lenis = new Lenis({ lerp: 0.1 });
      lenis!.on("scroll", ScrollTrigger.update);
      const tick = (t: number) => lenis!.raf(t * 1000); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
      const ctx = gsap.context(() => {
        // split reveal: wrap words of [data-split] (inside the single H1 too)
        document.querySelectorAll<HTMLElement>("[data-split]").forEach(el => {
          const walk = (n: Node) => { n.childNodes.forEach(c => { if (c.nodeType === 3 && c.textContent!.trim()) { const f = document.createDocumentFragment(); c.textContent!.split(/(\s+)/).forEach(w => { if (!w.trim()) { f.append(w); return; } const o = document.createElement("span"); o.className = "sw"; const i = document.createElement("span"); i.className = "swi"; i.textContent = w; o.append(i); f.append(o); }); c.replaceWith(f); } else if (c.nodeType === 1) walk(c); }); };
          walk(el);
          gsap.from(el.querySelectorAll(".swi"), { yPercent: 110, duration: 1, ease: "power4.out", stagger: 0.06, delay: 0.15, scrollTrigger: el.dataset.split === "scroll" ? { trigger: el, start: "top 85%" } : undefined });
        });
        // manifesto: words light up with scroll
        document.querySelectorAll<HTMLElement>("[data-light]").forEach(el => {
          el.innerHTML = el.textContent!.split(/\s+/).map(w => `<span class="lw">${w}</span>`).join(" ");
          gsap.fromTo(el.querySelectorAll(".lw"), { opacity: 0.15 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 45%", scrub: true } });
        });
        // pinned horizontal process (desktop only)
        ScrollTrigger.matchMedia({ "(min-width: 1024px)": () => {
          document.querySelectorAll<HTMLElement>("[data-hscroll]").forEach(sec => {
            const track = sec.querySelector<HTMLElement>("[data-track]")!;
            gsap.to(track, { x: () => -(track.scrollWidth - window.innerWidth + 80), ease: "none", scrollTrigger: { trigger: sec, pin: true, scrub: 1, start: "top top", end: () => `+=${track.scrollWidth}`, invalidateOnRefresh: true } });
          });
        } });
        // fade-up for [data-up]
        gsap.utils.toArray<HTMLElement>("[data-up]").forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
        // parallax images
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach(el => gsap.to(el, { yPercent: -Number(el.dataset.parallax || 12), ease: "none", scrollTrigger: { trigger: el, scrub: true } }));
      });
      kill = () => { ctx.revert(); gsap.ticker.remove(tick); };
    })();
    // custom cursor
    let cleanupCursor = () => {};
    if (matchMedia("(pointer:fine)").matches) {
      const c = document.createElement("div"); c.className = "sp-cursor"; c.innerHTML = "<span></span>"; document.body.append(c);
      let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
      const mv = (e: PointerEvent) => { x = e.clientX; y = e.clientY; const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]"); c.classList.toggle("on", !!t); c.firstElementChild!.textContent = t?.dataset.cursor || ""; };
      const loop = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; c.style.transform = `translate3d(${cx}px,${cy}px,0)`; raf = requestAnimationFrame(loop); };
      addEventListener("pointermove", mv, { passive: true }); loop();
      cleanupCursor = () => { removeEventListener("pointermove", mv); cancelAnimationFrame(raf); c.remove(); };
    }
    return () => { kill(); lenis?.destroy(); cleanupCursor(); };
  }, []);
  return null;
}
