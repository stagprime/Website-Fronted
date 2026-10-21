import Image from "next/image";
import { merch, vpnShots, storeOf } from "@/lib/art";
export function MerchGrid({ n = 12 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {merch.slice(0, n).map(m => (
        <a key={m.web} href={m.link} target="_blank" rel="noopener" data-cursor="Shop" className="group relative block overflow-hidden rounded-2xl bg-white">
          <Image src={m.web} alt={`${m.alt} — Stag Prime design on ${storeOf(m.link)}`} width={m.w} height={m.h} sizes="(max-width:640px) 50vw, 16vw" className="aspect-square w-full object-cover group-hover:scale-105 transition duration-500" />
          <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-navy-900">{storeOf(m.link)} ↗</span>
        </a>
      ))}
    </div>
  );
}
export function VpnShots() {
  return (
    <div className="rail flex gap-4 overflow-x-auto pb-4">
      {vpnShots.map((s, i) => (
        <a key={s.web} href={s.link} target="_blank" rel="noopener" className="shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-navy-800">
          <Image src={s.web} alt={`Stag VPN Google Play screenshot ${i + 1}`} width={s.w} height={s.h} sizes="22rem" className="h-72 sm:h-96 w-auto object-cover" />
        </a>
      ))}
    </div>
  );
}
