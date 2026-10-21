import { services, ventures, stores, extended } from "@/content/site";
export type NavItem = { t: string; d?: string; subs?: string[]; href: string; icon?: string; color?: string; ext?: boolean };
export type NavGroup = { label: string; href: string; cols?: { title: string; items: NavItem[] }[]; featured?: { t: string; d: string; href: string; cta: string } };
export const nav: NavGroup[] = [
  { label: "Services", href: "/services", cols: [{ title: "All Service Areas", items: services.map(s => ({ t: s.title, d: s.short, subs: [...s.subs.map(x => x.t.split(" (")[0]), extended[s.slug]?.find(e => !s.subs.some(x => x.t.split(/[ /]/)[0] === e.split(/[ /,]/)[0]))].filter(Boolean).slice(0, 4) as string[], href: `/services/${s.slug}`, icon: s.icon, color: s.color })) }],
    featured: { t: "Free Strategy Call", d: "We audit your current status and map a KPI-driven growth plan.", href: "/contact", cta: "Book a call" } },
  { label: "Ventures", href: "/ventures", cols: [
    { title: "Our Businesses", items: ventures.map(v => ({ t: v.title, d: v.short, subs: v.points.slice(0, 3), href: `/ventures/${v.slug}`, icon: v.icon, color: v.color })) },
    { title: "Merch Stores", items: stores.map(s => ({ t: s.n, href: s.u, ext: true })) }],
    featured: { t: "Stag VPN Case Study", d: "Built in-house, rated ~4.8★ on Google Play, sold to NexGlobo.", href: "/portfolio/stag-vpn", cta: "Read case study" } },
  { label: "Portfolio", href: "/portfolio", cols: [{ title: "Work", items: [
    { t: "Company Portfolio", d: "Real results across development, marketing & POD", href: "/portfolio", icon: "briefcase", color: "#48BDED" },
    { t: "Stag VPN Case Study", d: "Built in-house, sold to NexGlobo", href: "/portfolio/stag-vpn", icon: "shield", color: "#1071B2" },
    { t: "Case Studies & Consulting", d: "How we approach client problems", href: "/case-studies", icon: "chart", color: "#1A936F" }] }] },
  { label: "Store", href: "/store", cols: [{ title: "Our Store", items: [
    { t: "Digital Products", d: "Scripts, UI kits, templates", href: "/store", icon: "store", color: "#48BDED" },
    { t: "Pricing", d: "Starting prices for every service", href: "/pricing", icon: "tag", color: "#D33F49" },
    { t: "Merch Stores", d: "Redbubble, Zazzle, TeePublic & more", href: "/ventures/print-on-demand", icon: "shirt", color: "#9649CB" }] }] },
  { label: "Company", href: "/about", cols: [{ title: "Company", items: [
    { t: "About Us", d: "Operators, not just an agency", href: "/about", icon: "info", color: "#48BDED" },
    { t: "Team", d: "The Stag Squad", href: "/team", icon: "users", color: "#1071B2" },
    { t: "Partners", d: "Marketplaces & tech stack", href: "/partners", icon: "link", color: "#1A936F" },
    { t: "Careers & Internship", d: "Interns, students & alumni", href: "/careers", icon: "briefcase", color: "#9649CB" },
    { t: "Job Apply", d: "Apply to join the Stag Squad", href: "/job-apply", icon: "pen", color: "#D33F49" },
    { t: "Investors & Donation", d: "Join us in shaping the future", href: "/investors", icon: "chart", color: "#3FB7D3" },
    { t: "Reviews", d: "Our public review profiles", href: "/reviews", icon: "star", color: "#20BF55" }] }] },
  { label: "Resources", href: "/blog", cols: [{ title: "Resources", items: [
    { t: "Blog", d: "Industry insights & strategies", href: "/blog", icon: "book", color: "#48BDED" },
    { t: "FAQ", d: "Answers to common questions", href: "/faq", icon: "help", color: "#3FB7D3" },
    { t: "Pricing", d: "Packages & digital products", href: "/pricing", icon: "tag", color: "#D33F49" }] }] },
];
