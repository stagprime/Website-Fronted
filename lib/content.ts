/**
 * Content data layer. Every page/component should read site content through these getters, never import
 * content/*.ts directly. Each getter is cached with the Next.js tags "settings" and "content:<key>".
 * Source today: Prisma `Setting` override (JSON) → else the code default in content/*.ts / lib/*.ts.
 * The admin can later switch a getter to the typed CMS tables (cms-data-model.md) without touching callers,
 * and call `revalidateTag("content:<key>")` after saving.
 */
import { unstable_cache } from "next/cache";
import { getSetting, type SettingKey, type Settings } from "@/lib/settings";

const cached = <K extends SettingKey>(key: K) =>
  unstable_cache(() => getSetting(key), ["content", key], { tags: ["settings", `content:${key}`], revalidate: 300 }) as () => Promise<Settings[K]>;

export const getBrand = cached("brand");
export const getContact = cached("contact");
export const getSocials = cached("socials");
export const getProfiles = cached("profiles");
export const getServices = cached("services");
export const getProducts = cached("products");
export const getStoreCats = cached("storeCats");
export const getPricing = cached("pricing");
export const getFaqs = cached("faqs");
export const getProcess = cached("process");
export const getVentures = cached("ventures");
export const getPortfolio = cached("portfolio");
export const getPartners = cached("partners");
export const getJobAreas = cached("jobAreas");
export const getNav = cached("nav");
export const getGigs = cached("gigs");
export const getTeam = cached("team");
export const getTracking = cached("tracking");

export async function getService(slug: string) { return (await getServices()).find((s) => s.slug === slug); }
export async function getGig(svc: string) { return (await getGigs()).find((g) => g.svc === svc); }
export async function getProduct(slug: string) { return (await getProducts()).find((p) => p.slug === slug); }
