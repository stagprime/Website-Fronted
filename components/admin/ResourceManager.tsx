"use client";
import { useEffect, useState } from "react";
import { Button, Card, DataTable, Field, Input, Modal, Select, Textarea, Toggle, api, toast, type Col } from "./kit";
import JsonEditor from "./JsonEditor";
export type RField = { key: string; label: string; kind?: "text" | "textarea" | "number" | "bool" | "date" | "select" | "json" | "code"; options?: (string | [string, string])[]; help?: string; def?: unknown; full?: boolean; placeholder?: string };
type Row = Record<string, unknown> & { id?: string };
const toInput = (k: RField["kind"], v: unknown) => k === "date" ? (v ? new Date(String(v)).toISOString().slice(0, 16) : "") : k === "json" ? (typeof v === "string" ? JSON.parse(v || "null") : v) : v;
/** Generic list + edit modal for /api/admin/r?res=<res> resources. */
export default function ResourceManager({ res, title, cols, fields, canCreate = true, filter, search = r => JSON.stringify(r), rowKey, actions, extraQuery = "", onLoaded }: { res: string; title?: string; cols: Col<Row>[]; fields: RField[]; canCreate?: boolean; filter?: React.ReactNode; search?: (r: Row) => string; rowKey?: (r: Row) => string; actions?: (r: Row, reload: () => void) => React.ReactNode; extraQuery?: string; onLoaded?: (rows: Row[]) => void }) {
  const [rows, setRows] = useState<Row[] | null>(null); const [edit, setEdit] = useState<Row | null>(null); const [busy, setBusy] = useState(false);
  const idOf = (r: Row) => String(r.id ?? r.path);
  const load = async () => { const j = await api<{ rows: Row[] }>(`/api/admin/r?res=${res}${extraQuery}`); if (j) { setRows(j.rows); onLoaded?.(j.rows); } };
  useEffect(() => { load(); }, [res, extraQuery]); // eslint-disable-line react-hooks/exhaustive-deps
  const blank = () => Object.fromEntries(fields.map(f => [f.key, f.def ?? (f.kind === "bool" ? true : f.kind === "json" ? [] : "")]));
  const open = (r?: Row) => setEdit(r ? { ...r, ...Object.fromEntries(fields.map(f => [f.key, toInput(f.kind, r[f.key])])) } : { ...blank(), __new: true });
  const save = async () => { if (!edit) return; setBusy(true); const body = { ...edit }; delete body.__new;
    const j = await api(`/api/admin/r?res=${res}`, { method: edit.__new ? "POST" : "PUT", body }); setBusy(false); if (j) { toast("Saved"); setEdit(null); load(); } };
  const del = async (r: Row) => { if (!confirm("Delete this item?")) return; const j = await api<{ restore: Row }>(`/api/admin/r?res=${res}&id=${encodeURIComponent(idOf(r))}`, { method: "DELETE" });
    if (j) { load(); toast("Deleted", "ok", canCreate ? async () => { const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = j.restore as Row; void _i; void _c; void _u; await api(`/api/admin/r?res=${res}`, { method: "POST", body: rest }); load(); } : undefined); } };
  const set = (k: string, v: unknown) => setEdit(e => e && { ...e, [k]: v });
  return <Card title={title} actions={<div className="flex gap-2">{filter}{canCreate && <Button size="sm" onClick={() => open()}>+ New</Button>}</div>}>
    {!rows ? <p className="text-sm text-slate-400">Loading…</p> : <DataTable rows={rows} search={search} rowKey={rowKey || idOf} cols={[...cols, { key: "_a", label: "", className: "w-1 whitespace-nowrap text-right", render: r => <span className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>{actions?.(r, load)}{fields.length > 0 && <Button size="sm" kind="ghost" onClick={() => open(r)}>Edit</Button>}<Button size="sm" kind="subtle" aria-label="Delete" onClick={() => del(r)}>✕</Button></span> }]} onRow={fields.length ? r => open(r) : undefined} />}
    <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.__new ? "New" : "Edit"} wide>
      {edit && <form onSubmit={e => { e.preventDefault(); save(); }} className="grid gap-4 sm:grid-cols-2">
        {fields.map(f => <div key={f.key} className={f.full || ["textarea", "json", "code"].includes(f.kind || "") ? "sm:col-span-2" : ""}><Field label={f.label} help={f.help} group={f.kind === "bool" || f.kind === "json"}>
          {f.kind === "bool" ? <Toggle checked={!!edit[f.key]} onChange={v => set(f.key, v)} label={edit[f.key] ? "On" : "Off"} />
            : f.kind === "select" ? <Select options={f.options || []} value={String(edit[f.key] ?? "")} onChange={e => set(f.key, e.target.value)} />
            : f.kind === "textarea" || f.kind === "code" ? <Textarea rows={f.kind === "code" ? 14 : 6} className={f.kind === "code" ? "font-mono text-xs" : ""} value={String(edit[f.key] ?? "")} placeholder={f.placeholder} onChange={e => set(f.key, e.target.value)} />
            : f.kind === "json" ? <JsonEditor value={edit[f.key]} onChange={v => set(f.key, v)} />
            : <Input type={f.kind === "number" ? "number" : f.kind === "date" ? "datetime-local" : "text"} value={String(edit[f.key] ?? "")} placeholder={f.placeholder} onChange={e => set(f.key, f.kind === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : f.kind === "date" ? e.target.value : e.target.value)} />}
        </Field></div>)}
        <div className="sm:col-span-2 flex justify-end gap-2"><Button type="button" kind="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button disabled={busy}>{busy ? "Saving…" : "Save"}</Button></div>
      </form>}
    </Modal>
  </Card>;
}
