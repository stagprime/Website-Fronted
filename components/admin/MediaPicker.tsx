"use client";
import { useState } from "react";
import { Button, Modal, Input, api, toast } from "./kit";
type M = { id: string; url: string; name: string; mime: string; width?: number; height?: number };
export async function uploadFiles(files: FileList | File[], folder = "") { const fd = new FormData(); for (const f of Array.from(files)) fd.append("file", f); if (folder) fd.append("folder", folder); return api<{ items: M[] }>("/api/admin/media", { method: "POST", form: fd }); }
/** Pick or upload a file from the Media library; returns its public URL. */
export default function MediaPicker({ onPick, accept = "image/*" }: { onPick: (url: string) => void; accept?: string }) {
  const [open, setOpen] = useState(false); const [items, setItems] = useState<M[]>([]); const [q, setQ] = useState("");
  const load = async () => { setOpen(true); const r = await api<{ items: M[] }>("/api/admin/media"); if (r) setItems(r.items); };
  const up = async (f: FileList | null) => { if (!f?.length) return; const r = await uploadFiles(f); if (r) { toast("Uploaded"); setItems(i => [...r.items, ...i]); if (r.items[0]) { onPick(r.items[0].url); setOpen(false); } } };
  return <>
    <Button type="button" size="sm" kind="ghost" onClick={load}>Media…</Button>
    <Modal open={open} onClose={() => setOpen(false)} title="Media library" wide>
      <div className="mb-3 flex flex-wrap gap-2"><Input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} className="max-w-xs" /><label className="cursor-pointer rounded-lg bg-sky-brand px-3 py-2 text-sm font-semibold text-navy-950">Upload<input type="file" multiple accept={accept} className="sr-only" onChange={e => up(e.target.files)} /></label></div>
      <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-auto sm:grid-cols-5">
        {items.filter(m => !q || m.name.toLowerCase().includes(q.toLowerCase())).map(m => <button key={m.id} type="button" onClick={() => { onPick(m.url); setOpen(false); }} className="group rounded-lg border border-white/10 p-1 text-left hover:border-sky-brand">
          {m.mime.startsWith("image/") ? <img src={m.url} alt="" className="aspect-square w-full rounded object-cover bg-white/5" /> : <div className="grid aspect-square place-items-center rounded bg-white/5 text-xs text-slate-400">{m.name.split(".").pop()}</div>}
          <p className="mt-1 truncate text-[11px] text-slate-400">{m.name}</p></button>)}
        {!items.length && <p className="col-span-full p-6 text-center text-sm text-slate-400">No media yet — upload a file.</p>}
      </div>
    </Modal>
  </>;
}
