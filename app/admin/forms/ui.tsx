"use client";
import { useState } from "react";
import ResourceManager from "@/components/admin/ResourceManager";
import { Badge, Button, Modal, PageHeader, Tabs, api, fmtDate } from "@/components/admin/kit";
type R = Record<string, unknown>;
const FIELD_TPL = [{ key: "name", type: "text", label: { en: "Name" }, required: true, width: "half" }, { key: "email", type: "email", label: { en: "Email" }, required: true, width: "half" }, { key: "message", type: "textarea", label: { en: "Message" }, required: true }];
export default function UI() {
  const [tab, setTab] = useState("subs"); const [st, setSt] = useState("new"); const [view, setView] = useState<R | null>(null);
  const data = (r: R) => { try { return JSON.parse(String(r.data)) as Record<string, string>; } catch { return {}; } };
  const exportCsv = (rows: R[]) => { const keys = [...new Set(rows.flatMap(r => Object.keys(data(r))))]; const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [["createdAt", "form", "status", ...keys].join(","), ...rows.map(r => [r.createdAt, r.formKey, r.status, ...keys.map(k => data(r)[k])].map(esc).join(","))].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "submissions.csv"; a.click(); };
  const [subs, setSubs] = useState<R[]>([]);
  return <><PageHeader title="Forms" sub="Inbox of every form submission (contact, job, investor and forms you build), and a builder for new forms. Embed a built form on any page with the Form block." />
    <div className="mb-4"><Tabs tabs={[["subs", "Submissions"], ["forms", "Form builder"]]} value={tab} onChange={setTab} /></div>
    {tab === "subs" ? <ResourceManager res="formSubmission" extraQuery={st ? `&f_status=${st}` : ""} canCreate={false} fields={[]} onLoaded={setSubs}
        filter={<><Tabs tabs={[["new", "New"], ["read", "Read"], ["archived", "Archived"], ["", "All"]]} value={st} onChange={setSt} /><Button size="sm" kind="ghost" onClick={() => exportCsv(subs)}>Export CSV</Button></>}
        cols={[{ key: "createdAt", label: "Received", sort: r => String(r.createdAt), render: r => fmtDate(r.createdAt as string) }, { key: "formKey", label: "Form", render: r => <Badge tone="sky">{String(r.formKey)}</Badge> },
          { key: "from", label: "From", render: r => { const d = data(r); return <button className="text-left hover:text-sky-brand" onClick={() => setView(r)}>{d.name || "—"} <span className="text-slate-400">{d.email}</span></button>; } },
          { key: "preview", label: "Message", render: r => <span className="line-clamp-2 text-slate-400">{Object.values(data(r)).slice(2).join(" · ").slice(0, 140)}</span> }, { key: "status", label: "Status", render: r => <Badge tone={r.status === "new" ? "amber" : "slate"}>{String(r.status)}</Badge> }]}
        actions={(r, reload) => <>{r.status !== "read" && <Button size="sm" kind="ghost" onClick={async () => { await api("/api/admin/r?res=formSubmission", { method: "PUT", body: { id: r.id, status: "read" } }); reload(); }}>Mark read</Button>}{r.status !== "archived" && <Button size="sm" kind="ghost" onClick={async () => { await api("/api/admin/r?res=formSubmission", { method: "PUT", body: { id: r.id, status: "archived" } }); reload(); }}>Archive</Button>}</>} />
      : <ResourceManager res="form" cols={[{ key: "title", label: "Form", sort: r => String(r.title) }, { key: "key", label: "Key", render: r => <code>{String(r.key)}</code> }, { key: "active", label: "Status", render: r => r.active ? <Badge tone="green">active</Badge> : <Badge>off</Badge> }, { key: "updatedAt", label: "Updated", render: r => fmtDate(r.updatedAt as string) }]}
        fields={[{ key: "title", label: "Title" }, { key: "key", label: "Key", help: "Used in the Form block, e.g. partner-apply" }, { key: "active", label: "Active", kind: "bool" },
          { key: "fields", label: "Fields", kind: "json", def: FIELD_TPL, help: "type: text, email, tel, textarea, select (with options), checkbox, date, number, url · width: half or full · label per locale: {en, bn, ar…}" },
          { key: "settings", label: "Settings", kind: "json", def: { recipients: "", submitLabel: { en: "Send" }, successMsg: { en: "Thanks! We'll reply within one business day." } }, help: "recipients = comma-separated emails (default MAIL_TO)" }]} />}
    <Modal open={!!view} onClose={() => setView(null)} title={`Submission · ${String(view?.formKey || "")}`}>
      {view && <dl className="grid gap-2 text-sm">{Object.entries(data(view)).map(([k, v]) => <div key={k}><dt className="text-xs uppercase text-slate-400">{k}</dt><dd className="whitespace-pre-wrap text-white">{v}</dd></div>)}<p className="text-xs text-slate-500">{fmtDate(view.createdAt as string)} · {String(view.locale)} · IP {String(view.ip || "—")}</p></dl>}
    </Modal>
  </>;
}
