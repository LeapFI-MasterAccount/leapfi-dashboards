#!/usr/bin/env python3
"""
LeapFI Dashboards - publish pipeline.

WORKFLOW
  1. Drop / replace your self-contained dashboard HTML files in ./src/
  2. Run:
        python3 publish.py            # build only (writes ./docs, prints URLs)
        python3 publish.py --push     # build + commit + push -> GitHub Pages goes live

Each file in src/ becomes a live page at:
    <base_url>/<slug>.html
where <base_url> is set in dashboards.config.json.

The <slug> is derived from the filename (lowercased, non-alphanumerics -> '-').
To pin a nice title / stable slug / display order, add an entry to
dashboards.config.json under "dashboards" keyed by the exact filename.

Index page uses LeapFI Brand Kit v2.2 (Inter; obsidian/cyan/teal/gallery).
"""
import json, re, sys, shutil, subprocess, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
DOCS = ROOT / "docs"          # GitHub Pages serves from main branch /docs
CFG = ROOT / "dashboards.config.json"


def slugify(name: str) -> str:
    s = re.sub(r"\.html?$", "", name.lower())
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "dashboard"


def load_config() -> dict:
    return json.loads(CFG.read_text()) if CFG.exists() else {}


def is_full_doc(html: str) -> bool:
    low = html.lower()
    return ("<html" in low) or ("<!doctype" in low)


def wrap_fragment(title: str, body: str) -> str:
    return (
        '<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        "<title>" + title + "</title></head><body>\n" + body + "\n</body></html>"
    )


def extract_title(raw: str, fallback: str) -> str:
    m = re.search(r"<title[^>]*>(.*?)</title>", raw, re.I | re.S)
    return m.group(1).strip() if m and m.group(1).strip() else fallback


INDEX_CSS = """<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
:root{--obsidian:#111111;--charcoal:#2D2D2D;--cyan:#00F2FF;--teal:#0A8FA3;--gallery:#F4F4F4;--card:#fff;--muted:#5b5b5b}
*{box-sizing:border-box}
body{margin:0;font-family:'Inter',-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:var(--gallery);color:var(--obsidian)}
.hero{background:var(--obsidian);color:#fff;padding:40px 24px}
.hero .inner{max-width:960px;margin:0 auto}
.hero .chev{color:var(--cyan);font-weight:800;letter-spacing:.14em;font-size:12px;text-transform:uppercase}
.hero h1{font-size:30px;margin:8px 0 4px;font-weight:800;letter-spacing:-.01em}
.hero .sub{color:#c9c9c9;margin:0;font-size:14px}
.wrap{max-width:960px;margin:0 auto;padding:32px 24px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
a.card{display:block;text-decoration:none;background:var(--card);border:1px solid #e3e3e3;border-left:4px solid var(--teal);border-radius:10px;padding:18px 20px;color:var(--obsidian);transition:.15s}
a.card:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(17,17,17,.12);border-left-color:var(--cyan)}
.card h3{margin:0 0 6px;font-size:16px;font-weight:700}
.card .u{color:var(--muted);font-size:12px;word-break:break-all}
.foot{margin-top:32px;color:var(--muted);font-size:12px}
code{background:#e9e9e9;padding:2px 6px;border-radius:4px;font-size:12px}
</style>"""


def build_index(entries, updated: str) -> str:
    cards = ""
    for e in entries:
        cards += (
            '<a class="card" href="./' + e["slug"] + '.html">'
            "<h3>" + e["title"] + "</h3>"
            '<div class="u">' + e["slug"] + ".html</div></a>\n"
        )
    return (
        '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        "<title>LeapFI Dashboards</title>" + INDEX_CSS + "</head><body>"
        '<div class="hero"><div class="inner">'
        '<div class="chev">&#9656;&#9656;&#9656; LEAPFI</div>'
        "<h1>Dashboards</h1>"
        '<p class="sub">Live dashboard index &bull; updated ' + updated + "</p>"
        "</div></div>"
        '<div class="wrap"><div class="grid">' + cards + "</div>"
        '<p class="foot">Maintained via the publish pipeline. Drop updated HTML into '
        "<code>src/</code> and run <code>python3 publish.py --push</code>.</p>"
        "</div></body></html>"
    )


def main():
    push = "--push" in sys.argv
    cfg = load_config()
    base = cfg.get("base_url", "").rstrip("/")
    meta = cfg.get("dashboards", {})

    SRC.mkdir(parents=True, exist_ok=True)
    if DOCS.exists():
        shutil.rmtree(DOCS)
    DOCS.mkdir(parents=True)

    files = sorted(SRC.glob("*.html"))
    entries = []
    seen = {}
    for p in files:
        raw = p.read_text(encoding="utf-8", errors="replace")
        m = meta.get(p.name, {})
        slug = m.get("slug") or slugify(p.name)
        if slug in seen:
            slug = slug + "-" + str(seen[slug] + 1)
        seen[slug] = seen.get(slug, 0) + 1
        title = m.get("title") or extract_title(raw, p.stem)
        html = raw if is_full_doc(raw) else wrap_fragment(title, raw)
        (DOCS / (slug + ".html")).write_text(html, encoding="utf-8")
        entries.append({
            "file": p.name,
            "slug": slug,
            "title": title,
            "order": m.get("order", 999),
            "url": (base + "/" + slug + ".html") if base else (slug + ".html"),
            "kb": round(len(html.encode("utf-8")) / 1024, 1),
        })

    entries.sort(key=lambda e: (e["order"], e["title"].lower()))
    updated = datetime.date.today().isoformat()
    (DOCS / "manifest.json").write_text(json.dumps(entries, indent=2))
    (DOCS / ".nojekyll").write_text("")  # serve files verbatim, no Jekyll
    (DOCS / "index.html").write_text(build_index(entries, updated), encoding="utf-8")

    if not entries:
        print("No .html files found in ./src -- drop your dashboards there, then re-run.")
    else:
        print("\nBuilt " + str(len(entries)) + " dashboard(s) into ./docs:\n")
        for e in entries:
            print("  - " + e["title"] + "  (" + str(e["kb"]) + " KB)")
            print("      " + e["url"])
        if base:
            print("\n  Index: " + base + "/index.html")
    print()

    if push:
        subprocess.run(["git", "add", "-A"], cwd=ROOT, check=True)
        subprocess.run(["git", "commit", "-m", "Publish dashboards " + updated], cwd=ROOT)
        subprocess.run(["git", "push"], cwd=ROOT, check=True)
        print("Pushed. Live in ~1-2 min; updates to an existing page can take up to ~10 min (GitHub Pages CDN cache).")


if __name__ == "__main__":
    main()
