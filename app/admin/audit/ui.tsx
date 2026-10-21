"use client";
import { useEffect, useState } from "react";
import { Badge, Button, Input, Modal, PageHeader, Select, api, fmtDate } from "@/components/admin/kit";
type A = { id: string; actor: string | null; action: string; entity: string; entityId: string | null; diff: string | null; ip: string | null; createdAt: string };
export default function UI() {
  const [rows, setRows] = useState<A[]>([]); const [ents, setEnts] = useState<string[]>([]); const [q, setQ] = useState(""); const [ent, setEnt] = useState(""); const [view, setView] = useState<A | null>(null); const [more, setMore] = useState(true);
  const qs = (before?: string) => `/api/admin/audit?q=${encodeURIComponent(q)}&entity=${ent}${before ? `&before=${before}` : ""}`;
  const load = async () => { const j = await api<{ rows: A[]; entities: string[] }>(qs()); if (j) { setRows(j.rows); setEnts(j.entities); setMore(j.rows.length === 200); } };
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q, ent]); // eslint-disable-line react-hooks/exhaustive-deps
  const pretty = (s: string | null) => { try { return JSON.stringify(JSON.parse(s || "null"), null, 2); } catch { return s; } };
  return <><PageHeader title="Audit log" sub="Every change made in the admin: who, what, when (Dhaka time) and the before/after diff." actions={<a href={`${qs()}&format=csv`}><Button kind="ghost" size="sm">Export CSV</Button></a>} />
    <div className="mb-4 flex flex-wrap gap-2"><Input className="max-w-xs" placeholder="Search action, id, content…" value={q} onChange={e => setQ(e.target.value)} /><Select className="max-w-[12rem]" aria-label="Entity" value={ent} options={[["", "All entities"], ...ents.map(e => [e, e] as [string, string])]} onChange={e => setEnt(e.target.value)} /></div>
    <div className="overflow-x-auto rounded-xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/5 text-left text-xs uppercase text-slate-400"><tr><th className="px-3 py-2">When</th><th className="px-3 py-2">Who</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Target</th><th className="px-3 py-2"></th></tr></thead>
      <tbody>{rows.map(r => <tr key={r.id} className="border-t border-white/5"><td className="whitespace-nowrap px-3 py-2 text-xs">{fmtDate(r.createdAt)}</td><td className="px-3 py-2">{r.actor || "system"}</td><td className="px-3 py-2"><Badge tone={/delete|refund|restore|reset/.test(r.action) ? "red" : "sky"}>{r.action}</Badge></td><td className="px-3 py-2"><code className="text-xs">{r.entity}{r.entityId ? ` · ${r.entityId.slice(0, 50)}` : ""}</code></td><td className="px-3 py-2 text-right">{r.diff && <Button size="sm" kind="subtle" onClick={() => setView(r)}>Diff</Button>}</td></tr>)}
        {!rows.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No entries.</td></tr>}</tbody></table></div>
    {more && rows.length > 0 && <Button className="mt-3" size="sm" kind="ghost" onClick={async () => { const j = await api<{ rows: A[] }>(qs(rows.at(-1)!.createdAt)); if (j) { setRows([...rows, ...j.rows]); setMore(j.rows.length === 200); } }}>Load older</Button>}
    <Modal open={!!view} onClose={() => setView(null)} title={view?.action || ""} wide><pre className="max-h-[60vh] overflow-auto rounded-lg bg-navy-950 p-3 text-xs text-slate-200">{pretty(view?.diff ?? null)}</pre><p className="mt-2 text-xs text-slate-500">IP {view?.ip || "—"}</p></Modal></>;
}
