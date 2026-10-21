"use client";
import { useState } from "react";
import { track } from "@/lib/analytics";
const inp = "w-full rounded-xl bg-navy-950/70 border border-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-brand focus:outline-none focus:ring-2 focus:ring-sky-brand/30";
const lbl = "block text-sm text-slate-300 mb-1.5";
export type FT = Record<string, string>;
const tf = (t: FT | undefined, k: string) => t?.[k] ?? k;
function useSubmit(type: string, t?: FT) {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle"); const [msg, setMsg] = useState("");
  const [t0] = useState(() => Date.now());
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget; setState("sending");
    const fd = new FormData(form); fd.set("type", type); fd.set("_t", String(t0));
    try { const r = await fetch("/api/forms", { method: "POST", body: fd }); const j = await r.json();
      if (j.ok) { setState("ok"); form.reset(); track("Lead", { form: type }); } else { setState("err"); setMsg(j.error); if (j.field) (form.elements.namedItem(j.field) as HTMLElement | null)?.focus?.(); } } catch { setState("err"); setMsg(tf(t, "Network error — please use WhatsApp or email.")); }
  }
  const status = <p role="status" aria-live="polite" className={state === "ok" ? "text-area-lime" : "text-amber-300"}>{state === "ok" ? tf(t, "Thanks! We received your message and will reply soon.") : state === "err" ? msg : ""}</p>;
  const hp = <div aria-hidden className="absolute -left-[9999px] w-px h-px overflow-hidden"><label>{tf(t, "Website")}<input name="website" tabIndex={-1} autoComplete="off" /></label></div>;
  return { onSubmit, sending: state === "sending", status, hp };
}
const Submit = ({ sending, children, t }: { sending: boolean; children: React.ReactNode; t?: FT }) => <button disabled={sending} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand px-8 py-3.5 font-semibold text-white disabled:opacity-60">{sending ? tf(t, "Sending…") : children}</button>;

export function ContactForm({ services, t, topic }: { services: string[]; t?: FT; topic?: string }) {
  const { onSubmit, sending, status, hp } = useSubmit("contact", t);
  return (
    <form onSubmit={onSubmit} noValidate={false} className="relative glass rounded-3xl p-6 sm:p-8 grid gap-5 sm:grid-cols-2">
      <div><label className={lbl} htmlFor="name">{tf(t, "Full name")}</label><input id="name" name="name" required className={inp} autoComplete="name" /></div>
      <div><label className={lbl} htmlFor="email">{tf(t, "Email")}</label><input id="email" name="email" type="email" required className={inp} autoComplete="email" /></div>
      <div><label className={lbl} htmlFor="phone">{tf(t, "Phone / WhatsApp")}</label><input id="phone" name="phone" className={inp} autoComplete="tel" /></div>
      <div><label className={lbl} htmlFor="service">{tf(t, "Interested service")}</label><select id="service" name="service" className={inp}>{services.map(s => <option key={s}>{s}</option>)}</select></div>
      <div><label className={lbl} htmlFor="budget">{tf(t, "Budget")}</label><select id="budget" name="budget" className={inp}><option>{tf(t, "Not sure yet")}</option><option>{tf(t, "Under $1,000")}</option><option value="$1,000 \u2013 $3,000">{tf(t, "$1,000 \u2013 $3,000")}</option><option value="$3,000 \u2013 $5,000">{tf(t, "$3,000 \u2013 $5,000")}</option><option value="$5,000+">{tf(t, "$5,000+")}</option></select></div>
      <div><label className={lbl} htmlFor="timeline">{tf(t, "Timeline")}</label><select id="timeline" name="timeline" className={inp}><option>{tf(t, "Flexible")}</option><option>{tf(t, "ASAP")}</option><option>{tf(t, "1 month")}</option><option>{tf(t, "2–3 months")}</option></select></div>
      <div className="sm:col-span-2"><label className={lbl} htmlFor="message">{tf(t, "Project details")}</label><textarea id="message" name="message" rows={5} required className={inp} placeholder={tf(t, "Tell us about your project, goals and timeline.")} defaultValue={topic ? `${tf(t, "I’m interested in")}: ${topic}\n\n` : undefined} /></div>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">{hp}<Submit t={t} sending={sending}>{tf(t, "Send Proposal")}</Submit>{status}</div>
    </form>
  );
}
export function ApplyForm({ areas, t }: { areas: string[]; t?: FT }) {
  const { onSubmit, sending, status, hp } = useSubmit("job-application", t);
  const R = ({ name, opts }: { name: string; opts: string[] }) => <div className="flex flex-wrap gap-2">{opts.map(o => <label key={o} className="cursor-pointer"><input type="radio" name={name} value={o} className="peer sr-only" /><span className="inline-block rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 peer-checked:border-sky-brand peer-checked:bg-sky-brand/15 peer-checked:text-white">{tf(t, o)}</span></label>)}</div>;
  const H = ({ n, label }: { n: number; label: string }) => <h2 className="sm:col-span-2 font-display text-lg font-bold text-white pt-4 border-t border-white/10 first:border-0 first:pt-0"><span className="text-sky-brand mr-2">0{n}</span>{tf(t, label)}</h2>;
  return (
    <form onSubmit={onSubmit} noValidate={false} className="relative glass rounded-3xl p-6 sm:p-10 grid gap-5 sm:grid-cols-2">
      <H n={1} label="Personal information" />
      <div><label className={lbl} htmlFor="fn">{tf(t, "Full name")}</label><input id="fn" name="name" required className={inp} /></div>
      <div><label className={lbl} htmlFor="em">{tf(t, "Email")}</label><input id="em" name="email" type="email" required className={inp} /></div>
      <div><label className={lbl} htmlFor="ph">{tf(t, "Phone")}</label><input id="ph" name="phone" className={inp} /></div>
      <div><label className={lbl} htmlFor="ad">Address (city, country)</label><input id="ad" name="address" className={inp} /></div>
      <div className="sm:col-span-2"><label className={lbl} htmlFor="li">LinkedIn profile (optional)</label><input id="li" name="linkedin" type="url" className={inp} /></div>
      <H n={2} label="Position applying for (select multiple)" />
      <div className="sm:col-span-2 flex flex-wrap gap-2">{areas.map(a => <label key={a} className="cursor-pointer"><input type="checkbox" name="positions" value={a} className="peer sr-only" /><span className="inline-block rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 peer-checked:border-sky-brand peer-checked:bg-sky-brand/15 peer-checked:text-white">{a}</span></label>)}</div>
      <H n={3} label="Experience & skills" />
      <div className="sm:col-span-2"><label className={lbl} htmlFor="ex">{tf(t, "Relevant experience")}</label><textarea id="ex" name="experience" rows={3} className={inp} /></div>
      <div><label className={lbl} htmlFor="sk">{tf(t, "Skills")}</label><input id="sk" name="skills" className={inp} placeholder="SEO, Graphic Design, Video Editing…" /></div>
      <div><label className={lbl} htmlFor="pf">{tf(t, "Portfolio / work samples link")}</label><input id="pf" name="portfolio" type="url" className={inp} /></div>
      <div className="sm:col-span-2"><span className={lbl}>{tf(t, "Years of experience")}</span><R name="years" opts={["Less than 1 year", "1–3 years", "3–5 years", "More than 5 years"]} /></div>
      <H n={4} label="Education" />
      <div><label className={lbl} htmlFor="ed">{tf(t, "Highest level completed")}</label><select id="ed" name="education" className={inp}><option>{tf(t, "High School Diploma")}</option><option>{tf(t, "Bachelor’s Degree")}</option><option>{tf(t, "Master’s Degree")}</option><option>{tf(t, "Other")}</option></select></div>
      <div><label className={lbl} htmlFor="fs">{tf(t, "Field of study")}</label><input id="fs" name="field" className={inp} /></div>
      <H n={5} label="Availability" />
      <div><span className={lbl}>{tf(t, "Work type")}</span><R name="availability" opts={["Full-time", "Part-time", "Freelance/Contract"]} /></div>
      <div><label className={lbl} htmlFor="sd">{tf(t, "Preferred start date")}</label><input id="sd" name="start" type="date" className={inp} /></div>
      <H n={6} label="Cover letter & resume" />
      <div className="sm:col-span-2"><label className={lbl} htmlFor="cl">Cover letter (max 300 words)</label><textarea id="cl" name="cover" rows={5} maxLength={2000} className={inp} /></div>
      <div className="sm:col-span-2"><label className={lbl} htmlFor="cv">Resume / CV (PDF, DOCX)</label><input id="cv" name="cv" type="file" accept=".pdf,.docx" className={`${inp} file:mr-4 file:rounded-full file:border-0 file:bg-sky-brand file:px-4 file:py-1 file:text-white`} /><p className="mt-1 text-xs text-slate-400">{tf(t, "PDF or Word, max 5 MB.")}</p></div>
      <H n={7} label="Additional information" />
      <div><label className={lbl} htmlFor="hh">{tf(t, "How did you hear about this job?")}</label><select id="hh" name="source" className={inp}><option>{tf(t, "Company Website")}</option><option>{tf(t, "Social Media")}</option><option>{tf(t, "Referral")}</option><option>{tf(t, "Job Portal")}</option><option>{tf(t, "Other")}</option></select></div>
      <div><span className={lbl}>{tf(t, "Willing to relocate?")}</span><R name="relocate" opts={["Yes", "No", "Remote only"]} /></div>
      <div className="sm:col-span-2"><label className={lbl} htmlFor="wy">Why do you want to work with Stag Prime? (optional)</label><textarea id="wy" name="why" rows={3} className={inp} /></div>
      <label className="sm:col-span-2 flex gap-3 text-sm text-slate-300"><input type="checkbox" required name="agree" className="mt-1 accent-sky-500" />{tf(t, "I agree to the Privacy Policy and Terms of Service.")}</label>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">{hp}<Submit t={t} sending={sending}>{tf(t, "Submit Application")}</Submit>{status}</div>
    </form>
  );
}
export function AuthForm({ t, locale = "en", google = false, initial = "login" }: { t?: FT; locale?: string; google?: boolean; initial?: "login" | "signup" | "forgot" }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initial);
  const [st, setSt] = useState<{ s: "idle" | "busy" | "ok" | "err"; m?: string }>({ s: "idle" });
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>; setSt({ s: "busy" });
    try {
      if (mode === "login") {
        const { signIn } = await import("next-auth/react");
        const r = await signIn("credentials", { email: fd.email, password: fd.password, redirect: false });
        if (r?.error) setSt({ s: "err", m: tf(t, r.code === "unverified" || String(r.error).includes("unverified") ? "Please verify your email first — check your inbox." : "Incorrect email or password.") });
        else { location.href = `/${locale}/account`; }
        return;
      }
      const r = await fetch("/api/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fd, action: mode === "signup" ? "register" : "forgot", locale }) }); const j = await r.json();
      if (!j.ok) return setSt({ s: "err", m: j.error });
      if (mode === "signup") track("CompleteRegistration", { method: "email" });
      setSt({ s: "ok", m: tf(t, mode === "signup" ? "Check your inbox to verify your email, then log in." : "If an account exists for that email, a reset link is on its way.") });
    } catch { setSt({ s: "err", m: tf(t, "Network error — please use WhatsApp or email.") }); }
  }
  return (
    <div className="glass rounded-3xl p-6 sm:p-10 max-w-md w-full mx-auto">
      {mode !== "forgot" && <div className="grid grid-cols-2 rounded-full bg-navy-950/70 p-1 mb-8" role="tablist">
        {(["login", "signup"] as const).map(m => <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setSt({ s: "idle" }); }} className={`rounded-full py-2.5 text-sm font-semibold ${mode === m ? "bg-gradient-to-r from-sky-brand to-blue-brand text-white" : "text-slate-300"}`}>{m === "login" ? tf(t, "Login") : tf(t, "Sign up")}</button>)}
      </div>}
      <h1 className="font-display text-2xl font-bold text-white">{mode === "login" ? tf(t, "Login to Your Account") : mode === "signup" ? tf(t, "Create a New Account") : tf(t, "Reset your password")}</h1>
      <form onSubmit={submit} className="mt-6 grid gap-4">
        <div aria-hidden className="absolute -left-[9999px]"><input name="website" tabIndex={-1} autoComplete="off" /></div>
        {mode === "signup" && <div><label className={lbl} htmlFor="an">{tf(t, "Full name")}</label><input id="an" name="name" className={inp} autoComplete="name" /></div>}
        <div><label className={lbl} htmlFor="ae">{tf(t, "Email")}</label><input id="ae" name="email" type="email" required className={inp} autoComplete="email" /></div>
        {mode !== "forgot" && <div><label className={lbl} htmlFor="ap">{tf(t, "Password")}</label><input id="ap" name="password" type="password" required minLength={8} className={inp} autoComplete={mode === "login" ? "current-password" : "new-password"} /></div>}
        {mode === "signup" && <div><label className={lbl} htmlFor="ac">{tf(t, "Confirm password")}</label><input id="ac" name="confirm" type="password" required minLength={8} className={inp} autoComplete="new-password" /></div>}
        {mode === "login" && <div className="flex justify-end text-sm"><button type="button" onClick={() => { setMode("forgot"); setSt({ s: "idle" }); }} className="text-sky-brand hover:text-white">{tf(t, "Forgot password?")}</button></div>}
        {mode === "signup" && <label className="flex gap-2 text-sm text-slate-300"><input type="checkbox" required className="accent-sky-500" />{tf(t, "I agree to the Terms of Service and Privacy Policy")}</label>}
        <button disabled={st.s === "busy"} className="rounded-full bg-gradient-to-r from-sky-brand to-blue-brand py-3.5 font-semibold text-white disabled:opacity-60">{st.s === "busy" ? tf(t, "Sending…") : mode === "login" ? tf(t, "Login") : mode === "signup" ? tf(t, "Create Account") : tf(t, "Send reset link")}</button>
        <p role="status" aria-live="polite" className={`text-sm ${st.s === "ok" ? "text-area-lime" : "text-amber-300"}`}>{st.m}</p>
        {mode === "forgot" && <button type="button" onClick={() => setMode("login")} className="text-sm text-sky-brand">← {tf(t, "Back to login")}</button>}
        {google && mode !== "forgot" && <><div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-white/10" />{tf(t, "or")}<span className="h-px flex-1 bg-white/10" /></div>
          <button type="button" onClick={async () => { const { signIn } = await import("next-auth/react"); signIn("google", { callbackUrl: `/${locale}/account` }); }} className="rounded-full border border-white/15 py-3 text-sm text-white hover:border-sky-brand">{tf(t, "Continue with Google")}</button></>}
      </form>
    </div>
  );
}
export function InvestorForm({ t }: { t?: FT }) {
  const { onSubmit, sending, status, hp } = useSubmit("investor", t);
  return (
    <form onSubmit={onSubmit} className="relative glass rounded-3xl p-6 sm:p-8 grid gap-5 sm:grid-cols-2">
      <div><label className={lbl} htmlFor="iv-n">{tf(t, "Full name")}</label><input id="iv-n" name="name" required className={inp} autoComplete="name" /></div>
      <div><label className={lbl} htmlFor="iv-e">{tf(t, "Email")}</label><input id="iv-e" name="email" type="email" required className={inp} autoComplete="email" /></div>
      <div><label className={lbl} htmlFor="iv-c">{tf(t, "Company / fund (optional)")}</label><input id="iv-c" name="company" className={inp} autoComplete="organization" /></div>
      <div><label className={lbl} htmlFor="iv-i">{tf(t, "I'm interested in")}</label><select id="iv-i" name="interest" required className={inp}>{["Investing in Stag Prime", "Strategic partnership", "Sponsoring the internship program", "Making a donation"].map(o => <option key={o} value={o}>{tf(t, o)}</option>)}</select></div>
      <div><label className={lbl} htmlFor="iv-r">{tf(t, "Indicative range")}</label><select id="iv-r" name="range" className={inp}>{["Prefer to discuss", "Under $10,000", "$10,000 – $50,000", "$50,000 – $250,000", "$250,000+"].map(o => <option key={o} value={o}>{tf(t, o)}</option>)}</select></div>
      <div><label className={lbl} htmlFor="iv-p">{tf(t, "Phone / WhatsApp")}</label><input id="iv-p" name="phone" className={inp} autoComplete="tel" /></div>
      <div className="sm:col-span-2"><label className={lbl} htmlFor="iv-m">{tf(t, "Message")}</label><textarea id="iv-m" name="message" rows={4} required className={inp} /></div>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">{hp}<Submit t={t} sending={sending}>{tf(t, "Request the investor pack")}</Submit>{status}</div>
    </form>
  );
}
