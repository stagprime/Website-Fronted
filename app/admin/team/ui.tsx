"use client";
import { useEffect, useState } from "react";
import { Badge, Button, Card, DataTable, Field, Input, PageHeader, Select, Toggle, api, fmtDate, toast } from "@/components/admin/kit";
type T = { id: string; name: string | null; email: string; role: string; disabled: boolean; totpEnabled: boolean; lastLoginAt: string | null; createdAt: string };
const DESC: Record<string, string> = { owner: "Everything incl. team, backups and custom HTML", admin: "Everything except team & backups; refunds", editor: "Pages, blog, media, translations, SEO, catalog", support: "Orders, customers, chat, forms (no refunds, no content)" };
export default function UI() {
  const [d, setD] = useState<{ team: T[]; roles: string[]; perms: Record<string, string[]> } | null>(null); const [inv, setInv] = useState({ email: "", name: "", role: "support" });
  const load = () => api<{ team: T[]; roles: string[]; perms: Record<string, string[]> }>("/api/admin/team").then(setD); useEffect(() => { load(); }, []);
  const put = async (body: Record<string, unknown>) => { if (await api("/api/admin/team", { method: "PUT", body })) { toast("Updated"); load(); } };
  if (!d) return <p className="text-sm text-slate-400">Loading…</p>;
  const roles = ["owner", "admin", "editor", "support"];
  return <><PageHeader title="Team & roles" sub="Invite staff and set what they can do. Role changes apply within 30 seconds, even for signed-in users. Setting a role to customer removes admin access." />
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]"><Card><DataTable rows={d.team} cols={[{ key: "email", label: "Member", render: t => <><span className="text-white">{t.name || "—"}</span><span className="block text-xs text-slate-400">{t.email}</span></> },
      { key: "role", label: "Role", render: t => <Select aria-label={`Role of ${t.email}`} value={t.role} options={[...roles, "customer"]} onChange={e => { if (e.target.value !== "customer" || confirm("Remove admin access?")) put({ id: t.id, role: e.target.value }); }} /> },
      { key: "2fa", label: "2FA", render: t => t.totpEnabled ? <span className="flex items-center gap-1"><Badge tone="green">on</Badge><Button size="sm" kind="subtle" onClick={() => confirm("Reset this member's 2FA?") && put({ id: t.id, reset2fa: true })}>reset</Button></span> : <Badge>off</Badge> },
      { key: "lastLoginAt", label: "Last login", render: t => fmtDate(t.lastLoginAt) }, { key: "disabled", label: "Access", render: t => <Toggle checked={!t.disabled} onChange={v => put({ id: t.id, disabled: !v })} label={t.disabled ? "Disabled" : "Active"} /> }]} /></Card>
      <div className="grid content-start gap-6"><Card title="Invite"><form className="grid gap-3" onSubmit={async e => { e.preventDefault(); const j = await api<{ invited: boolean }>("/api/admin/team", { method: "POST", body: inv }); if (j) { toast(j.invited ? "Invited — they get a set-password email" : "Existing user promoted"); setInv({ email: "", name: "", role: "support" }); load(); } }}>
        <Field label="Email"><Input type="email" required value={inv.email} onChange={e => setInv({ ...inv, email: e.target.value })} /></Field><Field label="Name"><Input value={inv.name} onChange={e => setInv({ ...inv, name: e.target.value })} /></Field>
        <Field label="Role"><Select value={inv.role} options={roles} onChange={e => setInv({ ...inv, role: e.target.value })} /></Field><Button>Invite</Button></form></Card>
        <Card title="Roles"><ul className="grid gap-2 text-sm">{roles.map(r => <li key={r}><b className="capitalize text-white">{r}</b><span className="block text-xs text-slate-400">{DESC[r]}</span></li>)}</ul>
          <details className="mt-3 text-xs"><summary className="cursor-pointer text-slate-400">Permission matrix</summary><table className="mt-2 w-full"><tbody>{Object.entries(d.perms).map(([p, rs]) => <tr key={p} className="border-t border-white/5"><td className="py-1 text-slate-300">{p}</td>{roles.map(r => <td key={r} className="text-center">{rs.includes(r) ? "✓" : ""}</td>)}</tr>)}</tbody></table></details></Card></div></div></>;
}
