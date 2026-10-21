"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Field, Input, Modal, PageHeader, api, fmtDate, toast } from "@/components/admin/kit";
type P = { key: string; title: string; group: string; managed: boolean; status: string; updatedAt: string | null; hasDraft: boolean; kind: string };
export default function UI() {
  const [rows, setRows] = useState<P[] | null>(null); const [q, setQ] = useState(""); const [nw, setNw] = useState(false); const [f, setF] = useState({ key: "/", title: "" });
  const load = () => api<{ pages: P[] }>("/api/admin/pages").then(j => setRows(j?.pages || [])); useEffect(() => { load(); }, []);
  const groups = [...new Set((rows || []).map(r => r.group))];
  return <><PageHeader title="Pages & builder" sub="Edit copy, reorder or hide sections, and add blocks to any page in all 7 languages. Built-in pages keep their design; unchanged pages use the code defaults. Custom pages are built entirely from blocks." actions={<Button onClick={() => setNw(true)}>+ New page</Button>} />
    <Input className="mb-4 max-w-xs" placeholder="Filter pages…" value={q} onChange={e => setQ(e.target.value)} />
    {!rows ? <p className="text-sm text-slate-400">Loading…</p> : <div className="grid gap-6">{groups.map(g => <Card key={g} title={g}><ul className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">{rows.filter(r => r.group === g && (!q || `${r.key} ${r.title}`.toLowerCase().includes(q.toLowerCase()))).map(r =>
      <li key={r.key}><Link href={`/admin/pages/edit?key=${encodeURIComponent(r.key)}`} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm hover:bg-white/10"><span className="min-w-0"><span className="block truncate capitalize text-white">{r.title}</span><code className="text-[11px] text-slate-500">{r.key === "home" ? "/" : r.key}</code></span>
        <span className="flex shrink-0 flex-col items-end gap-1">{r.managed ? <Badge tone="sky">customised</Badge> : <Badge>default</Badge>}{r.hasDraft && <Badge tone="amber">draft</Badge>}{r.status === "draft" && <Badge tone="red">unpublished</Badge>}{r.updatedAt && <span className="text-[10px] text-slate-500">{fmtDate(r.updatedAt)}</span>}</span></Link></li>)}</ul></Card>)}</div>}
    <Modal open={nw} onClose={() => setNw(false)} title="New custom page"><form className="grid gap-3" onSubmit={async e => { e.preventDefault(); const j = await api<{ key: string }>("/api/admin/pages", { method: "POST", body: f }); if (j) { toast("Page created (unpublished)"); location.assign(`/admin/pages/edit?key=${encodeURIComponent(j.key)}`); } }}>
      <Field label="Title"><Input required value={f.title} onChange={e => setF({ ...f, title: e.target.value, key: f.key === "/" || f.key === "/" + slug(f.title) ? "/" + slug(e.target.value) : f.key })} /></Field>
      <Field label="Path" help="Available in every language: /en/your-path, /bn/your-path …"><Input required value={f.key} onChange={e => setF({ ...f, key: e.target.value })} /></Field><Button>Create</Button></form></Modal></>;
}
const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
