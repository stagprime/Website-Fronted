// Simple in-memory sliding-window limiter (single PM2 instance). For multiple instances swap for Redis.
const hits = new Map<string, number[]>();
export function limit(key: string, max: number, windowMs: number) { const now = Date.now(); const h = (hits.get(key) || []).filter(t => now - t < windowMs); if (h.length >= max) { hits.set(key, h); return false; } h.push(now); hits.set(key, h); return true; }
