import { T } from "./loc";
const K: Record<string, string> = { title: "We value your privacy", body: "We use cookies to run this site, understand how it's used and, with your consent, measure ads. You can change your choice any time.", accept: "Accept all", reject: "Reject non-essential", customize: "Customize", save: "Save choices", necessary: "Necessary (always on)", analytics: "Analytics", ads: "Marketing & ads", policy: "Privacy policy" };
export const consentT = () => Object.fromEntries(Object.entries(K).map(([k, v]) => [k, T(v)]));
export const consentStrings = Object.values(K);
