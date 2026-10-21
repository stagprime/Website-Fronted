"use client";
import { useEffect, useState } from "react";
import { Badge, Button, Card, Field, Input, PageHeader, api, fmtDate, toast } from "@/components/admin/kit";
export default function UI() {
  const [s, setS] = useState<{ enabled: boolean; lastLoginAt: string | null } | null>(null); const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(null); const [code, setCode] = useState("");
  const load = () => api<{ enabled: boolean; lastLoginAt: string | null }>("/api/admin/security").then(setS); useEffect(() => { load(); }, []);
  const go = async (action: string) => { const j = await api<{ secret: string; uri: string }>("/api/admin/security", { method: "POST", body: { action, code } }); if (!j) return; if (action === "setup") setSetup(j); else { toast(action === "enable" ? "2FA is on" : "2FA is off"); setSetup(null); setCode(""); load(); } };
  if (!s) return <p className="text-sm text-slate-400">Loading…</p>;
  return <><PageHeader title="My security" sub={`Optional two-factor authentication with any authenticator app (Google Authenticator, 1Password, Authy…). Last login: ${fmtDate(s.lastLoginAt)}.`} />
    <Card className="max-w-xl" title={<>Two-factor authentication {s.enabled ? <Badge tone="green">on</Badge> : <Badge>off</Badge>}</>}>
      {s.enabled ? <div className="grid gap-3"><p className="text-sm text-slate-300">You'll be asked for a 6-digit code at every password login. Google sign-in is blocked while 2FA is on.</p><Field label="Current code to turn off"><Input inputMode="numeric" value={code} onChange={e => setCode(e.target.value)} /></Field><Button kind="danger" onClick={() => go("disable")}>Turn off 2FA</Button></div>
        : !setup ? <Button onClick={() => go("setup")}>Set up 2FA</Button>
        : <div className="grid gap-3"><p className="text-sm text-slate-300">1. In your authenticator app choose “Enter a setup key” and paste:</p><code className="select-all break-all rounded-lg bg-navy-950 p-3 text-sm text-white">{setup.secret}</code>
          <p className="text-xs text-slate-500">Or open this link on your phone: <a className="break-all text-sky-brand" href={setup.uri}>{setup.uri}</a></p>
          <Field label="2. Enter the 6-digit code it shows"><Input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)} /></Field><Button onClick={() => go("enable")}>Verify & turn on</Button></div>}
    </Card></>;
}
