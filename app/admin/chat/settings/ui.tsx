"use client";
import ResourceManager from "@/components/admin/ResourceManager";
import { SettingEditor } from "@/components/admin/SettingEditor";
import { Badge, PageHeader, fmtDate } from "@/components/admin/kit";
export default function UI() {
  return <><PageHeader title="Chat & AI knowledge" sub="Widget behaviour, the AI first-responder (only active when OPENAI_API_KEY is set) and knowledge documents the AI answers from, alongside llms.txt facts." />
    <div className="grid gap-6"><SettingEditor k="chat" hints={{ systemPrompt: { kind: "textarea", help: "Empty = built-in prompt" }, aiModel: { help: "Empty = OPENAI_MODEL or gpt-4o-mini" } }} />
      <ResourceManager res="knowledgeDoc" title="Knowledge base" cols={[{ key: "title", label: "Title", sort: r => String(r.title) }, { key: "locale", label: "Locale", render: r => <Badge>{String(r.locale)}</Badge> }, { key: "enabled", label: "Used by AI", render: r => r.enabled ? <Badge tone="green">yes</Badge> : <Badge>no</Badge> }, { key: "updatedAt", label: "Updated", render: r => fmtDate(r.updatedAt as string) }]}
        fields={[{ key: "title", label: "Title" }, { key: "locale", label: "Locale", kind: "select", def: "en", options: ["en", "bn", "ar", "es", "fr", "de", "hi"] }, { key: "enabled", label: "Enabled", kind: "bool" }, { key: "body", label: "Content", kind: "textarea", help: "Plain facts: policies, turnaround, what's included. Max 20,000 characters." }]} /></div>
  </>;
}
