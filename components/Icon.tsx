const P: Record<string, string> = {
  chart: "M3 3v18h18M7 15l4-4 3 3 6-6",
  code: "M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16",
  play: "M5 4l14 8-14 8z",
  spark: "M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z",
  pen: "M4 20h4L20 8l-4-4L4 16zM14 6l4 4",
  cloud: "M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9z",
  shield: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z",
  shirt: "M8 3l-5 3 2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0z",
  store: "M3 9l2-5h14l2 5M4 9v11h16V9M3 9h18",
  users: "M16 11a4 4 0 1 0-8 0M3 21a9 9 0 0 1 18 0",
  info: "M12 8h.01M11 12h1v5h1M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z",
  star: "M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.3l1-6.2L3 9.7l6.2-.9z",
  book: "M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6M20 4v14h-6",
  help: "M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5M12 18h.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z",
  tag: "M3 12V3h9l9 9-9 9zM7.5 7.5h.01",
  briefcase: "M3 8h18v12H3zM8 8V5h8v3",
  link: "M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
};
export default function Icon({ name, className = "w-5 h-5", color }: { name: string; className?: string; color?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke={color || "currentColor"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={P[name] || P.spark} /></svg>;
}
