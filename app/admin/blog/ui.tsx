"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, DataTable, PageHeader, api, fmtDate } from "@/components/admin/kit";
type P = { id: string; slug: string; title: string; category: string; status: string; source: string; locales: string[]; publishAt: string | null; updatedAt: string | null };
export default function UI() {
  const [rows, setRows] = useState<P[] | null>(null); useEffect(() => { api<{ posts: P[] }>("/api/admin/blog").then(j => setRows(j?.posts || [])); }, []);
  return <><PageHeader title="Blog" sub="Built-in articles (from code) can be overridden per language; new posts live in the database. Scheduled posts go live automatically at their publish time." actions={<Button onClick={() => { const s = prompt("New post slug (lowercase-with-dashes):"); if (s) location.assign(`/admin/blog/edit?slug=${encodeURIComponent(s.trim().toLowerCase())}&locale=en`); }}>+ New post</Button>} />
    {!rows ? <p className="text-sm text-slate-400">Loading…</p> : <DataTable rows={rows} search={r => `${r.slug} ${r.title} ${r.category}`} onRow={r => location.assign(`/admin/blog/edit?slug=${r.slug}&locale=en`)} cols={[
      { key: "title", label: "Post", sort: r => r.title, render: r => <Link href={`/admin/blog/edit?slug=${r.slug}&locale=en`} className="text-white hover:text-sky-brand">{r.title}<code className="block text-xs text-slate-500">/blog/{r.slug}</code></Link> },
      { key: "category", label: "Category", sort: r => r.category }, { key: "status", label: "Status", sort: r => r.status, render: r => <Badge tone={r.status === "published" ? "green" : r.status === "scheduled" ? "sky" : "slate"}>{r.status}</Badge> },
      { key: "source", label: "Source", render: r => <Badge tone={r.source === "code" ? "slate" : "purple"}>{r.source}</Badge> }, { key: "locales", label: "Edited locales", render: r => r.locales.join(", ") || "—" },
      { key: "updatedAt", label: "Updated", sort: r => r.updatedAt || "", render: r => fmtDate(r.updatedAt) }]} />}</>;
}
