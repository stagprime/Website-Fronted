"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";
export function ViewContent({ name, type, value, id }: { name: string; type: string; value?: number; id?: string }) {
  useEffect(() => { track("ViewContent", { content_name: name, content_type: type, content_ids: id ? [id] : undefined, value, currency: value ? "USD" : undefined }); }, [name, type, value, id]);
  return null;
}
export function Purchase({ id, value, name }: { id: string; value?: number; name?: string }) {
  // event_id = Stripe session id → Meta dedups browser Pixel + server CAPI (webhook) events.
  useEffect(() => { if (sessionStorage.getItem(`p_${id}`)) return; sessionStorage.setItem(`p_${id}`, "1"); track("Purchase", { value, currency: "USD", transaction_id: id, content_name: name }, id); }, [id, value, name]);
  return null;
}
