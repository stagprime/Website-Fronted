"use client";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Field, Input, PageHeader, Tabs, api, fmtDate, toast } from "@/components/admin/kit";
import { uploadFiles } from "@/components/admin/MediaPicker";
type M = { id: string; url: string; name: string; mime: string; size: number; width?: number; height?: number; alt: Record<string, string>; folder: string; createdAt: string };
const LOCS = ["en", "bn", "ar", "es", "fr", "de", "hi"];
export default function UI() {
  const [items, setItems] = useState<M[] | null>(null); const [q, setQ] = useState(""); const [missing, setMissing] = useState(false); const [sel, setSel] = useState<M | null>(null); const [drag, setDrag] = useState(false); const [loc, setLoc] = useState("en");
  const load = () => api<{ items: M[] }>(`/api/admin/media?q=${encodeURIComponent(q)}${missing ? "&missingAlt=1" : ""}`).then(j => setItems(j?.items || []));
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [q, missing]); // eslint-disable-line react-hooks/exhaustive-deps
  const up = async (f: FileList | null) => { if (!f?.length) return; const j = await uploadFiles(f); if (j) { toast(`Uploaded ${j.items.length}`); load(); } };
  const save = async () => { if (!sel) return; if (await api("/api/admin/media", { method: "PUT", body: { id: sel.id, alt: sel.alt, name: sel.name } })) { toast("Saved"); load(); } };
  return <><PageHeader title="Media library" sub="Images and files for pages, blog and branding. Served from /media/… with long-term caching. Add alt text per language for accessibility and image SEO." actions={<label className="cursor-pointer rounded-lg bg-gradient-to-r from-sky-brand to-blue-brand px-4 py-2 text-sm font-semibold text-white">Upload<input type="file" multiple className="sr-only" onChange={e => up(e.target.files)} /></label>} />
    <div className="mb-4 flex flex-wrap items-center gap-3"><Input className="max-w-xs" placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} /><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={missing} onChange={e => setMissing(e.target.checked)} />Missing alt text</label></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); up(e.dataTransfer.files); }} className={`min-h-[300px] rounded-2xl border-2 border-dashed p-3 ${drag ? "border-sky-brand bg-sky-brand/5" : "border-white/10"}`}>
        {!items ? <p className="p-6 text-sm text-slate-400">Loading…</p> : !items.length ? <p className="p-10 text-center text-sm text-slate-400">Drop files here or click Upload.</p> :
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">{items.map(m => <button key={m.id} onClick={() => setSel(m)} className={`rounded-xl border p-1.5 text-left ${sel?.id === m.id ? "border-sky-brand" : "border-white/10 hover:border-white/30"}`}>
            {m.mime.startsWith("image/") ? <img src={m.url} alt={m.alt.en || ""} loading="lazy" className="aspect-square w-full rounded-lg bg-white/5 object-cover" /> : <div className="grid aspect-square place-items-center rounded-lg bg-white/5 text-xs uppercase text-slate-400">{m.name.split(".").pop()}</div>}
            <p className="mt-1 truncate text-[11px] text-slate-300">{m.name}</p>{m.mime.startsWith("image/") && !m.alt.en && <Badge tone="amber">no alt</Badge>}</button>)}</div>}
      </div>
      {sel ? <Card title="Details" actions={<Button size="sm" kind="danger" onClick={async () => { if (confirm("Delete this file? Pages using it will show a broken image.") && await api(`/api/admin/media?id=${sel.id}`, { method: "DELETE" })) { setSel(null); load(); } }}>Delete</Button>}>
        {sel.mime.startsWith("image/") && <img src={sel.url} alt="" className="mb-3 max-h-56 w-full rounded-lg bg-white/5 object-contain" />}
        <div className="grid gap-3 text-sm"><Field label="URL"><div className="flex gap-2"><Input readOnly value={sel.url} onFocus={e => e.target.select()} /><Button size="sm" kind="ghost" onClick={() => { navigator.clipboard.writeText(sel.url); toast("Copied"); }}>Copy</Button></div></Field>
          <Field label="Name"><Input value={sel.name} onChange={e => setSel({ ...sel, name: e.target.value })} /></Field>
          <div><Tabs tabs={LOCS} value={loc} onChange={setLoc} /><Input className="mt-2" dir={loc === "ar" ? "rtl" : "ltr"} aria-label={`Alt text ${loc}`} placeholder={loc === "en" ? "Describe the image" : sel.alt.en || "Falls back to English"} value={sel.alt[loc] || ""} onChange={e => setSel({ ...sel, alt: { ...sel.alt, [loc]: e.target.value } })} /></div>
          <p className="text-xs text-slate-500">{sel.mime} · {(sel.size / 1024).toFixed(0)} KB{sel.width ? ` · ${sel.width}×${sel.height}` : ""} · {fmtDate(sel.createdAt)}</p><Button onClick={save}>Save</Button></div></Card>
        : <Card><p className="text-sm text-slate-400">Select a file to edit its alt text or copy its URL.</p></Card>}
    </div></>;
}
