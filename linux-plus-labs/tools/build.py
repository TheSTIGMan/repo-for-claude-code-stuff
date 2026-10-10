#!/usr/bin/env python3
"""Build the Linux+ XK0-006 lab book PDF.

Usage: python3 tools/build.py            # writes dist/Linux-Plus-XK0-006-Lab-Book.pdf
       python3 tools/build.py --html     # stop after the HTML (dist/book.html)

Pipeline: labs/*.md -> one Markdown file (parts, appendices generated) -> pandoc HTML
-> Chromium PDF (pass 1) -> read bookmark page numbers -> TOC page numbers -> PDF (pass 2).
"""
import html
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
LABS = ROOT / "labs"
DIST = ROOT / "dist"
STUDY = ROOT.parent / "linux-plus-study"
PDF_NAME = "Linux-Plus-XK0-006-Lab-Book.pdf"

DOMAINS = [
    (1, "System Management", 23),
    (2, "Services and User Management", 20),
    (3, "Security", 18),
    (4, "Automation, Orchestration, and Scripting", 17),
    (5, "Troubleshooting", 22),
]


def node_json(expr):
    return json.loads(subprocess.check_output(["node", "-e", f"console.log(JSON.stringify({expr}))"]))


def load_objectives():
    return node_json(f"require({json.dumps(str(STUDY / 'tools' / 'objectives.js'))})")


def load_acronyms():
    js = (
        "(()=>{global.window={LINUX_PLUS_DATA:{acronyms:[]}};"
        f"require({json.dumps(str(STUDY / 'data' / 'acronyms.js'))});"
        "return window.LINUX_PLUS_DATA.acronyms})()"
    )
    return node_json(js)


ANSWERS_RE = re.compile(r"^::: answers\s*\n(.*?)^:::\s*$", re.M | re.S)
HEADING_RE = re.compile(r"^## Lab (\d+(?:\.\d+)?): (.+?) \{#([\w-]+)\}\s*$", re.M)


def split_lab(text):
    """Return (lab_text_without_answers, answers_markdown, title)."""
    m = ANSWERS_RE.search(text)
    answers = m.group(1).strip() if m else ""
    if m:
        text = text[: m.start()].rstrip() + "\n"
    h = HEADING_RE.search(text)
    title = h.group(2) if h else ""
    # Lab heading -> eyebrow + title
    text = HEADING_RE.sub(lambda g: f"## [Lab {g.group(1)}]{{.labno}} {g.group(2)} {{#{g.group(3)}}}", text)
    return format_options(text), answers, title


OPTION_RE = re.compile(r"^[ \t]+(?:[-*][ \t]+)?\(?([A-F])[.)][ \t]+(.*?)[ \t]*\\?$")


def format_options(text):
    """Put each multiple-choice option (A. ... D.) on its own line with a hard line break."""
    m = re.search(r"^\*\*Review questions\*\*\s*$", text, re.M)
    if not m:
        return text
    head, tail = text[: m.end()], text[m.end():]
    out = []
    for line in tail.split("\n"):
        om = OPTION_RE.match(line)
        if om and out:
            j = len(out) - 1
            while j >= 0 and not out[j].strip():
                out.pop(); j -= 1          # options follow their question directly
            if out and not out[-1].rstrip().endswith("\\"):
                out[-1] = out[-1].rstrip() + "\\"
            out.append(f"   **{om.group(1)}.** {om.group(2)}\\")
            continue
        if out and out[-1].lstrip().startswith("**") and out[-1].endswith("\\") and not OPTION_RE.match(line):
            out[-1] = out[-1][:-1]           # no hard break after the last option
        out.append(line)
    return head + "\n".join(out)


def exam_corner(text):
    m = re.search(r"^### Exam corner\s*$(.*?)^\*\*Review questions\*\*", text, re.M | re.S)
    return m.group(1).strip() if m else ""


def coverage_rows(text, keywords):
    """Group each exam keyword under the first task heading where it appears."""
    low = text.lower()
    headings = [(m.start(), m.group(1).strip()) for m in re.finditer(r"^#{3,4} (.+)$", text, re.M)]
    groups = {}
    order = []
    for k in keywords:
        if not re.search(r"[A-Za-z0-9]", k) or len(k) < 2:
            continue
        pos = low.find(k.lower())
        if pos < 0:
            continue
        where = "Lab introduction"
        for hpos, name in headings:
            if hpos <= pos:
                where = name
            else:
                break
        if where not in groups:
            groups[where] = []
            order.append(where)
        groups[where].append(k)
    # keep the lab's own order of sections
    order.sort(key=lambda w: next((p for p, n in headings if n == w), -1))
    return [(w, groups[w]) for w in order]


def part_block(num, name, weight, labs):
    items = "".join(
        f'<div><b>{lid}</b><span>{html.escape(t)}</span></div>' for lid, t in labs
    )
    return (
        f'\n# Part {num}: {name} {{#part-{num} .part eyebrow="Part {num} · Domain {num}.0"}}\n\n'
        f'<div class="part-meta"><div class="part-weight">{weight}% of the exam · {len(labs)} labs</div>'
        f'<div class="part-list">{items}</div></div>\n'
    )


def fix_fences(text):
    """Make ':::' div fences parse inside list items.

    Pandoc only recognizes a fenced div when the fence starts exactly at the list item's
    content column, and it needs a blank line before a closing fence. Authors indent by
    4 spaces, so re-indent each fence to the content column of the enclosing list item.
    """
    out, stack, in_code = [], [], False   # stack of (marker_indent, content_col)
    item_re = re.compile(r"^(\s*)(\d+\.|[-*+])(\s+)\S")
    for line in text.split("\n"):
        stripped = line.lstrip()
        indent = len(line) - len(stripped)
        if stripped.startswith("```"):
            in_code = not in_code
        if not in_code:
            m = item_re.match(line)
            if m:
                mi = len(m.group(1))
                while stack and stack[-1][0] >= mi:
                    stack.pop()
                stack.append((mi, mi + len(m.group(2)) + len(m.group(3))))
            elif stripped and indent == 0 and not stripped.startswith(":::"):
                stack = []
            if stripped.startswith(":::") and indent > 0:
                while stack and stack[-1][0] >= indent:
                    stack.pop()
                col = stack[-1][1] if stack else 0
                if out and out[-1].strip():
                    out.append("")
                line = " " * col + stripped
            elif stripped.startswith(":::") and out and out[-1].strip() and re.fullmatch(r":::+\s*", stripped):
                out.append("")
        out.append(line)
    return "\n".join(out)


def assemble():
    objectives = load_objectives()
    chunks = [(LABS / "00-front.md").read_text(), (LABS / "00-setup.md").read_text()]
    chunks[1] = HEADING_RE.sub(lambda g: f"## [Lab {g.group(1)}]{{.labno}} {g.group(2)} {{#{g.group(3)}}}", chunks[1])
    chunks[1] = chunks[1].replace("## Lab 0: Build Your Lab {#lab-0}", "## [Lab 0]{.labno} Build Your Lab {#lab-0}")

    answer_sections, review_sections, coverage_sections = [], [], []
    missing = []
    for dnum, dname, weight in DOMAINS:
        ids = [i for i in objectives if i.startswith(f"{dnum}.")]
        labs = []
        bodies = []
        for lid in ids:
            path = LABS / f"{lid}.md"
            if not path.exists():
                missing.append(lid)
                continue
            raw = path.read_text(encoding="utf-8")
            body, answers, title = split_lab(raw)
            labs.append((lid, objectives[lid]["title"]))
            bodies.append(body)
            anchor = f"lab-{lid.replace('.', '-')}"
            answer_sections.append(f"#### Lab {lid}: {title}\n\n{answers}\n")
            review_sections.append(f"#### Lab {lid}: {title}\n\n{exam_corner(raw)}\n")
            rows = coverage_rows(raw, objectives[lid]["keywords"])
            table = "\n".join(
                f"| {html.escape(where)} | {', '.join('`' + k.replace('|', '&#124;').replace('`', '&#96;') + '`' for k in kws)} |"
                for where, kws in rows
            )
            coverage_sections.append(
                f"#### {lid} {objectives[lid]['title']}\n\nPracticed in [Lab {lid}](#{anchor}).\n\n"
                f"| Where in the lab | Exam topics practiced |\n|---|---|\n{table}\n"
            )
        if labs:
            chunks.append(part_block(dnum, dname, weight, labs))
            chunks.extend(bodies)

    acr = load_acronyms()
    acr_html = "".join(f"<div><b>{html.escape(a['term'])}</b> {html.escape(a['meaning'])}</div>" for a in acr)
    trouble = (LABS / "99-troubleshooting.md").read_text() if (LABS / "99-troubleshooting.md").exists() else ""

    chunks.append(
        '\n# Appendices {#appendices .part eyebrow="Reference"}\n\n'
        '<div class="part-meta"><div class="part-weight">Answer key · Exam corner review sheet · '
        'Coverage map · Lab VM troubleshooting · Acronyms</div></div>\n'
    )
    chunks.append("## Appendix A: Answer Key {#appendix-a}\n\nAnswers to the review questions at the end of every lab.\n\n"
                  "::: answers-lab\n" + "\n".join(answer_sections) + "\n:::\n")
    chunks.append("## Appendix B: Exam Corner Review Sheet {#appendix-b}\n\nEvery lab's key facts in one place. "
                  "Read this section in the days before your exam.\n\n::: review-sheet\n"
                  + "\n".join(review_sections) + "\n:::\n")
    chunks.append("## Appendix C: Exam Objective Coverage Map {#appendix-c}\n\n"
                  "This map shows where each topic from the official XK0-006 objectives is practiced. "
                  "Topics are listed under the part of the lab where they first appear.\n\n::: coverage\n"
                  + "\n".join(coverage_sections) + "\n:::\n")
    if trouble:
        chunks.append(trouble)
    chunks.append("## Appendix E: Acronym List {#appendix-e}\n\nThe acronyms from the official exam objectives. "
                  "Know what each one stands for.\n\n<div class=\"acronyms\">" + acr_html + "</div>\n")
    if missing:
        print("WARNING: missing labs:", ", ".join(missing))
    return fix_fences("\n\n".join(chunks))


COVER = """
<section class="cover">
  <div class="prompt">student@ubuntu-lab:~$ <span>cat README</span></div>
  <div class="cover-title">Linux+ Hands-On<br>Lab Book</div>
  <div class="subtitle">Step-by-step labs for every CompTIA Linux+ exam objective, explained in plain English.</div>
  <div class="exam-code">EXAM XK0-006 · OBJECTIVES V5.0</div>
  <div class="vms">
    <div class="vm"><strong>ubuntu-lab</strong>Ubuntu Server 24.04 LTS<br>main lab system</div>
    <div class="vm"><strong>rocky-lab</strong>Rocky Linux 9<br>RHEL-family topics</div>
  </div>
  <div class="term"><b>$</b> ls ~/labs
Part 1  System Management                        23%   7 labs
Part 2  Services and User Management             20%   6 labs
Part 3  Security                                 18%   6 labs
Part 4  Automation, Orchestration, and Scripting 17%   5 labs
Part 5  Troubleshooting                          22%   5 labs
<b>$</b> ./start --lab 0</div>
  <div class="footer-note">Unofficial study guide. CompTIA and Linux+ are trademarks of CompTIA, Inc.</div>
</section>
"""


def pandoc(md_path, html_path):
    cover = DIST / "cover.html"
    cover.write_text(COVER)
    subprocess.run([
        "pandoc", str(md_path), "-f", "markdown-implicit_figures", "-t", "html5", "-s",
        "--toc", "--toc-depth=2", "--highlight-style=pygments",
        "--metadata", "pagetitle=Linux+ XK0-006 Hands-On Lab Book",
        "--metadata", "lang=en",
        "--include-before-body", str(cover),
        "--css", str(ROOT / "book.css"),
        "-o", str(html_path),
    ], check=True)


def decorate_toc(html_text, pages):
    """Wrap TOC link text and add page numbers (or placeholders)."""
    def repl(m):
        href, attrs, inner = m.group(1), m.group(2), m.group(3)
        pg = pages.get(href.lstrip("#"), "000")
        return f'<a href="{href}"{attrs}><span class="t">{inner}</span><span class="pg">{pg}</span></a>'
    nav = re.search(r'<nav id="TOC".*?</nav>', html_text, re.S)
    new_nav = re.sub(r'<a href="([^"]+)"([^>]*)>(.*?)</a>', repl, nav.group(0), flags=re.S)
    return html_text[: nav.start()] + new_nav + html_text[nav.end():]


def render(html_path, pdf_path):
    env = dict(os.environ)
    env["NODE_PATH"] = subprocess.check_output(["npm", "root", "-g"], text=True).strip()
    subprocess.run(["node", str(ROOT / "tools" / "pdf.js"), str(html_path), str(pdf_path)], check=True, env=env)


def heading_pages(pdf_path, html_text):
    """Map heading ids to page numbers using the PDF outline from Chromium."""
    reader = PdfReader(str(pdf_path))
    flat = []

    def walk(items):
        for it in items:
            if isinstance(it, list):
                walk(it)
            else:
                flat.append((it.title.strip(), reader.get_destination_page_number(it) + 1))
    walk(reader.outline)
    # headings in document order (h1/h2 with ids)
    heads = [(m.group(2), re.sub(r"<[^>]+>", "", m.group(3)).strip())
             for m in re.finditer(r'<h([12])[^>]*id="([^"]+)"[^>]*>(.*?)</h\1>', html_text, re.S)]
    heads = [(i, html.unescape(re.sub(r"\s+", " ", t))) for i, t in heads]
    pages, j = {}, 0
    norm = lambda s: re.sub(r"\W+", "", s).lower()
    for hid, text in heads:
        for k in range(j, len(flat)):
            if norm(flat[k][0]) == norm(text):
                pages[hid] = flat[k][1]
                j = k + 1
                break
    return pages, len(reader.pages)


def main():
    DIST.mkdir(exist_ok=True)
    md = assemble()
    md_path = DIST / "book.md"
    md_path.write_text(md, encoding="utf-8")
    html_path = DIST / "book.html"
    pandoc(md_path, html_path)
    base = html_path.read_text(encoding="utf-8")
    html_path.write_text(decorate_toc(base, {}), encoding="utf-8")
    if "--html" in sys.argv:
        print("Wrote", html_path)
        return
    pdf_path = DIST / PDF_NAME
    render(html_path, pdf_path)                      # pass 1
    pages, n = heading_pages(pdf_path, base)
    html_path.write_text(decorate_toc(base, pages), encoding="utf-8")
    render(html_path, pdf_path)                      # pass 2 with page numbers
    size = pdf_path.stat().st_size / 1e6
    print(f"Wrote {pdf_path} ({n} pages, {size:.1f} MB, {len(pages)} TOC entries numbered)")


if __name__ == "__main__":
    main()
