"""Machine-translate UI keys + top blog posts offline with NLLB-200 (CTranslate2). Usage: python scripts/i18n-translate.py <locale> [ui|blog]
Existing entries in lib/tr/<locale>.json are kept (so human edits survive re-runs). Output needs native-speaker review."""
import json, re, sys, os
import ctranslate2, sentencepiece as spm, glob
L = sys.argv[1]; mode = sys.argv[2] if len(sys.argv) > 2 else "ui"
KEEP = r"(\[[^\]]*\]\([^)]*\)|\*\*|`[^`]*`|https?://\S+|[\w.+-]+@[\w-]+\.[\w.]+|\+1 307-396-4184|@stagprime|Stag Prime Sentinel|Stag Prime LLC|Stag Prime|Stag VPN|Sentinel|WhatsApp|Telegram|Stripe|Figma|Amazon KDP|KDP|YouTube|Redbubble|TeePublic|Zazzle|Threadless|Spreadshirt|Creator-Spring|Google Play|App Store|Shopify|WooCommerce|Next\.js|Python|SaaS|SEO|ASO|MVP|POD|NexGlobo|Md Tariq Hossain|\$[\d,.]+\+?|\d[\d,.]*\+?%?)"
# Model: Meta NLLB-200 distilled 600M converted to CTranslate2 (float32): ct2-transformers-converter --model facebook/nllb-200-distilled-600M --output_dir /tmp/nllb/f32
import transformers
NLLB = {"bn": "ben_Beng", "ar": "arb_Arab", "es": "spa_Latn", "fr": "fra_Latn", "de": "deu_Latn", "hi": "hin_Deva"}
TOK = transformers.AutoTokenizer.from_pretrained("facebook/nllb-200-distilled-600M", src_lang="eng_Latn")
MT = ctranslate2.Translator(os.environ.get("NLLB_DIR", "/tmp/nllb/f32"), device="cpu", intra_threads=8)
cache, pending, COLLECT = {}, set(), [True]
def sents(core): return [x for x in re.split(r"(?<=[.!?])\s+", core) if x]
def tr(s):
    if not s.strip() or not re.search(r"[A-Za-z]", s): return s
    lead, core, trail = re.match(r"^(\s*)(.*?)(\s*)$", s, re.S).groups()
    if COLLECT[0]: pending.update(sents(core)); return s
    return lead + " ".join(cache.get(x, x) for x in sents(core)) + trail
def flush():
    src = sorted(pending - cache.keys(), key=len)
    for i in range(0, len(src), 64):
        b = src[i:i + 64]; r = MT.translate_batch([TOK.convert_ids_to_tokens(TOK.encode(x)) for x in b], target_prefix=[[NLLB[L]]] * len(b), beam_size=4, max_decoding_length=400, repetition_penalty=1.1)
        for x, h in zip(b, r): cache[x] = TOK.decode(TOK.convert_tokens_to_ids(h.hypotheses[0][1:]), skip_special_tokens=True).strip()
    COLLECT[0] = False
def seg(s):
    parts = re.split(KEEP, s); out = []
    for p in parts:
        if not p: continue
        if re.fullmatch(KEEP, p):
            m = re.fullmatch(r"\[([^\]]*)\]\(([^)]*)\)", p)
            out.append(f"[{tr(m.group(1))}]({m.group(2)})" if m else p)
        else: out.append(tr(p))
    r = "".join(out)
    return re.sub(r"\s+([,.;:!?।])", r"\1", r) if L != "fr" else r
def md(body):
    lines = []
    for ln in body.split("\n"):
        m = re.match(r"^(\s*(?:#{1,6} |[-*] |\d+\. |> )?)(.*)$", ln)
        lines.append(m.group(1) + seg(m.group(2)) if m.group(2).strip() else ln)
    return "\n".join(lines)
if mode == "ui":
    keys = json.load(open("data/i18n-keys.json")); f = f"lib/tr/{L}.json"
    d = json.load(open(f)) if os.path.exists(f) else {}
    en = json.load(open("lib/tr/en.json")) if os.path.exists("lib/tr/en.json") else {}
    have = {en.get(i, i) for i in d}  # d is keyed by stable id; new entries are written English-keyed, then run scripts/i18n-rekey.mjs
    todo = [k for k in keys if k not in have]
    for k in todo: seg(k)
    flush()
    for k in todo: d[k] = seg(k)
    json.dump(d, open(f, "w"), ensure_ascii=False, indent=0)
else:
    src = json.load(open("data/blog-src.json")); os.makedirs("content/posts/i18n", exist_ok=True); f = f"content/posts/i18n/{L}.json"
    d = json.load(open(f)) if os.path.exists(f) else {}
    todo = [p for p in src if p["slug"] not in d]
    def one(p): return {"t": seg(p["t"]), "d": seg(p["d"]), "body": md(p["body"]), "faq": [[seg(q), seg(a)] for q, a in (p.get("faq") or [])], "machine": True}
    for p in todo: one(p)
    flush()
    for p in todo:
        d[p["slug"]] = one(p)
    json.dump(d, open(f, "w"), ensure_ascii=False, indent=1)
print(L, mode, "done")
