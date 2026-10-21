import type { Perm } from "@/lib/rbac";
export type NavItem = { href: string; label: string; perm: Perm; icon: string; keys?: string };
export const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Mission Control", perm: "dashboard.view", icon: "◎", keys: "g d" }] },
  { group: "Sell", items: [
    { href: "/admin/orders", label: "Orders", perm: "orders.view", icon: "▤", keys: "g o" },
    { href: "/admin/customers", label: "Customers", perm: "customers.view", icon: "☺", keys: "g c" },
    { href: "/admin/store", label: "Store & catalog", perm: "catalog.edit", icon: "◫" },
    { href: "/admin/gigs", label: "Gig Studio", perm: "catalog.edit", icon: "★" },
    { href: "/admin/coupons", label: "Coupons & offers", perm: "catalog.edit", icon: "%" },
    { href: "/admin/stripe", label: "Stripe sync", perm: "catalog.edit", icon: "⇄" },
  ] },
  { group: "Content", items: [
    { href: "/admin/pages", label: "Pages & builder", perm: "content.edit", icon: "▦", keys: "g p" },
    { href: "/admin/menus", label: "Menus", perm: "content.edit", icon: "☰" },
    { href: "/admin/blog", label: "Blog", perm: "content.edit", icon: "✎", keys: "g b" },
    { href: "/admin/media", label: "Media library", perm: "content.edit", icon: "▣", keys: "g m" },
    { href: "/admin/content", label: "Content lists", perm: "content.edit", icon: "≡" },
    { href: "/admin/translations", label: "Translations", perm: "content.edit", icon: "文", keys: "g t" },
  ] },
  { group: "Engage", items: [
    { href: "/admin/chat", label: "Live chat inbox", perm: "chat.use", icon: "✉", keys: "g i" },
    { href: "/admin/chat/settings", label: "Chat & AI knowledge", perm: "chat.settings", icon: "✦" },
    { href: "/admin/forms", label: "Forms", perm: "forms.view", icon: "☐" },
    { href: "/admin/emails", label: "Email templates", perm: "emails.edit", icon: "@" },
  ] },
  { group: "Grow", items: [
    { href: "/admin/seo", label: "SEO", perm: "seo.edit", icon: "↗", keys: "g s" },
    { href: "/admin/seo/redirects", label: "Redirects & 404s", perm: "seo.edit", icon: "↪" },
    { href: "/admin/seo/technical", label: "Schema, robots, sitemap, llms", perm: "seo.edit", icon: "{ }" },
    { href: "/admin/tracking", label: "Tracking & consent", perm: "settings.edit", icon: "◉" },
  ] },
  { group: "System", items: [
    { href: "/admin/branding", label: "Branding & contact", perm: "settings.edit", icon: "◆" },
    { href: "/admin/settings", label: "Site settings", perm: "settings.edit", icon: "⚙" },
    { href: "/admin/team", label: "Team & roles", perm: "users.manage", icon: "⚑" },
    { href: "/admin/audit", label: "Audit log", perm: "audit.view", icon: "⌚" },
    { href: "/admin/backups", label: "Backups", perm: "backups.manage", icon: "⛁" },
    { href: "/admin/security", label: "My security (2FA)", perm: "dashboard.view", icon: "🔒" },
  ] },
];
