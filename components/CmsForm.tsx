"use client";
import { useState } from "react";
import { track } from "@/lib/analytics";
export type CmsField = { key: string; type: string; label: string; required?: boolean; options?: string[]; placeholder?: string; width?: string };
const inp = "w-full rounded-xl bg-navy-950/70 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-brand focus:outline-none focus:ring-2 focus:ring-sky-brand/30";
/** Renders a form built in Admin → Forms and posts to /api/forms/cms. */
export function CmsForm({ formKey, fields, submit, success, locale }: { formKey: string; fields: CmsField[]; submit: string; success: string; locale: string }) {
  const [st, setSt] = useState<"idle" | "sending" | "ok" | "err">("idle"); const [msg, setMsg] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget; setSt("sending");
    const fd = new FormData(f); fd.set("_form", formKey); fd.set("_locale", locale);
    try { const r = await fetch("/api/forms/cms", { method: "POST", body: fd }); const j = await r.json();
      if (j.ok) { setSt("ok"); f.reset(); track("Lead", { form: formKey }); } else { setSt("err"); setMsg(j.error || "Error"); } } catch { setSt("err"); setMsg("Network error"); }
  }
  return (
    <form onSubmit={onSubmit} className="relative glass rounded-3xl p-6 sm:p-8 grid gap-5 sm:grid-cols-2">
      <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      {fields.map(fl => { const id = `f_${formKey}_${fl.key}`; const full = fl.width !== "half" || fl.type === "textarea";
        return <div key={fl.key} className={full ? "sm:col-span-2" : ""}>
          {fl.type === "checkbox" ? <label className="flex gap-2 text-sm text-slate-300"><input type="checkbox" name={fl.key} required={fl.required} />{fl.label}</label> : <>
            <label htmlFor={id} className="block text-sm text-slate-300 mb-1.5">{fl.label}{fl.required && " *"}</label>
            {fl.type === "textarea" ? <textarea id={id} name={fl.key} required={fl.required} rows={5} placeholder={fl.placeholder} className={inp} />
              : fl.type === "select" ? <select id={id} name={fl.key} required={fl.required} className={inp}>{(fl.options || []).map(o => <option key={o}>{o}</option>)}</select>
              : <input id={id} name={fl.key} type={["email", "tel", "date", "number", "url"].includes(fl.type) ? fl.type : "text"} required={fl.required} placeholder={fl.placeholder} className={inp} />}</>}
        </div>; })}
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <button disabled={st === "sending"} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-8 py-3.5 font-semibold text-white disabled:opacity-60">{st === "sending" ? "…" : submit}</button>
        <p role="status" aria-live="polite" className={st === "ok" ? "text-area-lime" : "text-amber-300"}>{st === "ok" ? success : st === "err" ? msg : ""}</p>
      </div>
    </form>
  );
}
