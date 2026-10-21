import Image from "next/image";
export default function Art({ src, alt, w = 1024, h = 768, className = "", sizes = "(max-width:768px) 100vw, 50vw", color = "#48BDED", priority }: { src: string | null; alt: string; w?: number; h?: number; className?: string; sizes?: string; color?: string; priority?: boolean }) {
  if (!src) return <div role="img" aria-label={alt} className={`relative overflow-hidden ${className}`} style={{ background: `radial-gradient(circle at 70% 30%, ${color}55, transparent 55%), linear-gradient(135deg,#0E2346,#061733)` }}><div className="absolute inset-0 grid-bg opacity-60" /></div>;
  return <Image src={src} alt={alt} width={w} height={h} sizes={sizes} priority={priority} fetchPriority={priority ? "high" : undefined} loading={priority ? undefined : "lazy"} className={`object-cover ${className}`} />;
}
