"use client";
import { useState } from "react";
import ResourceManager from "@/components/admin/ResourceManager";
import { Badge, Button, PageHeader, Tabs, api, fmtDate, toast } from "@/components/admin/kit";
type R = Record<string, unknown>;
export default function UI() {
  const [tab, setTab] = useState("r"); const [k, setK] = useState(0);
  const fix = async (r: R) => { const to = prompt(`Redirect ${r.path} to:`, "/"); if (!to) return; const from = String(r.path).replace(/^\/(en|bn|ar|es|fr|de|hi)(?=\/|$)/, "") || "/";
    if (await api("/api/admin/r?res=redirect", { method: "POST", body: { from, to, code: "301" } })) { await api(`/api/admin/r?res=notFoundLog&id=${encodeURIComponent(String(r.path))}`, { method: "DELETE", quiet: true }); toast(`Redirect ${from} → ${to} added (all locales)`); setK(x => x + 1); } };
  return <><PageHeader title="Redirects & 404s" sub="Rules run in middleware before pages render. Locale-less rules (/old) apply to every language. 410 Gone and 451 return real status codes. The 404 log shows broken URLs visitors hit." />
    <div className="mb-4"><Tabs tabs={[["r", "Redirects"], ["404", "404 log"]]} value={tab} onChange={setTab} /></div>
    {tab === "r" ? <ResourceManager key={k} res="redirect" cols={[{ key: "from", label: "From", sort: r => String(r.from), render: r => <code>{String(r.from)}</code> }, { key: "to", label: "To", render: r => <code className="text-slate-300">{String(r.to || "—")}</code> }, { key: "code", label: "Code", render: r => <Badge tone={Number(r.code) >= 400 ? "red" : "sky"}>{String(r.code)}</Badge> }, { key: "hits", label: "Hits", sort: r => Number(r.hits) }]}
        fields={[{ key: "from", label: "From path", placeholder: "/old-page" }, { key: "to", label: "To", placeholder: "/new-page or https://…", help: "Leave empty for 410/451" }, { key: "code", label: "Type", kind: "select", def: "301", options: [["301", "301 Permanent"], ["302", "302 Temporary"], ["410", "410 Gone"], ["451", "451 Unavailable for legal reasons"]] }]} />
      : <ResourceManager key={k} res="notFoundLog" canCreate={false} fields={[]} rowKey={r => String(r.path)} filter={<Button size="sm" kind="ghost" onClick={async () => { if (confirm("Clear the whole 404 log?") && await api("/api/admin/r?res=notFoundLog&all=1", { method: "DELETE" })) setK(x => x + 1); }}>Clear log</Button>}
        cols={[{ key: "path", label: "Path", render: r => <code>{String(r.path)}</code> }, { key: "hits", label: "Hits", sort: r => Number(r.hits) }, { key: "referrer", label: "Referrer" }, { key: "lastSeen", label: "Last seen", sort: r => String(r.lastSeen), render: r => fmtDate(r.lastSeen as string) }]}
        actions={r => <Button size="sm" onClick={() => fix(r)}>Redirect…</Button>} />}
  </>;
}
