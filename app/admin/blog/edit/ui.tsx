"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, Field, Input, Select, Tabs, Textarea, api, toast, useDirty } from "@/components/admin/kit";
import MediaPicker from "@/components/admin/MediaPicker";
import JsonEditor from "@/components/admin/JsonEditor";
type Post = { slug: string; locale: string; title: string; description: string; category: string; service: string | null; keyword: string | null; body: string; faq: string[][]; image: string | null; status: string; publishAt: string | null };
const LOCS = ["en", "bn", "ar", "es", "fr", "de", "hi"];
function md(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/^### (.*)$/gm, "<h3>$1</h3>").replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\[(.+?)\]\((.+?)\)/g, (_, t: string, u: string) => /^(https?:|mailto:|\/|#)/i.test(u.trim()) ? `<a href="${u.trim().replace(/"/g, "&quot;")}">${t}</a>` : t).replace(/^- (.*)$/gm, "<li>$1</li>").replace(/\n{2,}/g, "<br/><br/>"); }
export default function UI({ slug, locale }: { slug: string; locale: string }) {
  const [p, setP] = useState<Post | null>(null); const [src, setSrc] = useState(""); const [langs, setLangs] = useState<{ locale: string; status: string }[]>([]); const [ai, setAi] = useState(false); const [warn, setWarn] = useState<string[]>([]); const [prev, setPrev] = useState(false);
  const dirty = useDirty(p);
  useEffect(() => { api<{ post: Post; source: string; langs: { locale: string; status: string }[]; ai: boolean }>(`/api/admin/blog?slug=${encodeURIComponent(slug)}&locale=${locale}`).then(j => { if (j) { setP(j.post); dirty.reset(j.post); setSrc(j.source); setLangs(j.langs); setAi(j.ai); } }); }, [slug, locale]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!p) return <p className="text-sm text-slate-400">Loading…</p>;
  const set = (k: keyof Post, v: unknown) => setP({ ...p, [k]: v } as Post);
  const save = async (status?: string) => { const j = await api<{ warnings: string[] }>("/api/admin/blog", { method: "PUT", body: { ...p, status: status || p.status } }); if (j) { setWarn(j.warnings); dirty.reset({ ...p, status: status || p.status }); setP({ ...p, status: status || p.status }); setSrc("db"); toast(status === "published" ? "Published" : "Saved"); } };
  const words = p.body.split(/\s+/).filter(Boolean).length;
  return <><Link href="/admin/blog" className="text-xs text-slate-400 hover:text-white">← Blog</Link>
    <div className="mb-4 mt-1 flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-2xl font-bold text-white">{p.title || "New post"} {dirty.dirty && <Badge tone="amber">unsaved</Badge>}</h1>
      <div className="flex flex-wrap gap-2"><a href={`/${locale}/blog/${slug}`} target="_blank" rel="noreferrer"><Button size="sm" kind="ghost">View ↗</Button></a>{ai && locale === "en" && <Select aria-label="AI translate to" className="!w-44" value="" options={[["", "✨ AI translate to…"], ...LOCS.slice(1).map(l => [l, l] as [string, string])]} onChange={async e => { const to = e.target.value; if (to && await api("/api/admin/blog", { method: "POST", body: { slug, to } })) { toast(`Draft created in ${to}`); location.assign(`/admin/blog/edit?slug=${slug}&locale=${to}`); } }} />}
        <Button size="sm" kind="ghost" onClick={() => save("draft")}>Save draft</Button><Button size="sm" onClick={() => save(p.status === "scheduled" ? "scheduled" : "published")}>{p.status === "scheduled" ? "Save schedule" : "Publish"}</Button></div></div>
    <div className="mb-4"><Tabs tabs={LOCS.map(l => [l, <span key={l}>{l}{langs.some(x => x.locale === l) && " •"}</span>])} value={locale} onChange={l => { if (!dirty.dirty || confirm("Discard unsaved changes?")) location.assign(`/admin/blog/edit?slug=${slug}&locale=${l}`); }} /></div>
    {src === "code" && <p className="mb-4 rounded-lg bg-white/5 p-3 text-xs text-slate-300">This is a built-in article. Saving creates a database override for <b>{locale}</b>; the code version stays as fallback.</p>}
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]"><div className="grid gap-4">
      <Field label={`Title (${p.title.length}/60)`}><Input dir={locale === "ar" ? "rtl" : "ltr"} value={p.title} onChange={e => set("title", e.target.value)} /></Field>
      <Field label={`Meta description (${p.description.length}/155)`}><Textarea rows={2} dir={locale === "ar" ? "rtl" : "ltr"} value={p.description} onChange={e => set("description", e.target.value)} /></Field>
      <Card title={`Body — markdown · ${words} words`} actions={<Button size="sm" kind="subtle" onClick={() => setPrev(!prev)}>{prev ? "Edit" : "Preview"}</Button>}>{prev ? <div className="prose prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: md(p.body) }} /> : <Textarea rows={28} dir={locale === "ar" ? "rtl" : "ltr"} className="font-mono text-xs" value={p.body} onChange={e => set("body", e.target.value)} />}</Card>
      <Card title="FAQ (emits FAQPage schema)"><JsonEditor value={p.faq?.length ? p.faq : [["", ""]]} onChange={v => set("faq", v)} /></Card></div>
      <div className="grid content-start gap-4"><Card title="Publishing"><div className="grid gap-3"><Field label="Status"><Select value={p.status} options={["draft", "scheduled", "published"]} onChange={e => set("status", e.target.value)} /></Field>
        {p.status !== "draft" && <Field label="Publish at (your local time)"><Input type="datetime-local" value={p.publishAt ? new Date(new Date(p.publishAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""} onChange={e => set("publishAt", e.target.value ? new Date(e.target.value).toISOString() : null)} /></Field>}</div></Card>
        <Card title="SEO & taxonomy"><div className="grid gap-3"><Field label="Focus keyword"><Input value={p.keyword || ""} onChange={e => set("keyword", e.target.value)} /></Field><Field label="Category"><Input value={p.category} onChange={e => set("category", e.target.value)} /></Field><Field label="Related service slug"><Input value={p.service || ""} onChange={e => set("service", e.target.value)} /></Field>
          <Field label="Featured image"><div className="flex gap-2"><Input value={p.image || ""} onChange={e => set("image", e.target.value)} /><MediaPicker onPick={u => set("image", u)} /></div></Field></div>
          {!!warn.length && <ul className="mt-3 grid gap-1 text-xs text-amber-200">{warn.map(w => <li key={w}>⚠ {w}</li>)}</ul>}</Card></div></div></>;
}
