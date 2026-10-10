#!/usr/bin/env python3
"""Check that every package installed with apt in the labs exists in the Ubuntu archive,
and that bash/python code blocks are syntactically valid.

Run on an Ubuntu 24.04 machine with apt sources configured.
Usage: python3 tools/check_packages.py [lab ids...]
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

LABS = Path(__file__).resolve().parent.parent / "labs"
BLOCK_RE = re.compile(r"^([ \t]*)```(\{?[.\w-]*\}?)[ \t]*\n(.*?)^\1```[ \t]*$", re.M | re.S)


def blocks(text):
    for m in BLOCK_RE.finditer(text):
        indent, lang, body = m.group(1), m.group(2).strip("{}.").lower(), m.group(3)
        body = "\n".join(l[len(indent):] if l.startswith(indent) else l for l in body.split("\n"))
        yield lang, body, text.count("\n", 0, m.start()) + 1


def apt_packages(body):
    pkgs = set()
    joined = re.sub(r"\\\n\s*", " ", body)
    for line in joined.split("\n"):
        m = re.search(r"\bapt(?:-get)?\s+install\s+(.*)", line)
        if not m:
            continue
        for tok in m.group(1).split():
            if tok in ("&&", "||", ";", "|") or tok.startswith((">", "2>")):
                break
            if tok.startswith("-") or "=" in tok or tok.startswith(("./", "/", "$", "<")):
                continue
            tok = tok.split(":")[0]
            if re.fullmatch(r"[a-z0-9][a-z0-9.+-]+", tok):
                pkgs.add(tok)
    return pkgs


def exists(pkg, cache={}):
    if pkg not in cache:
        out = subprocess.run(["apt-cache", "show", "--no-all-versions", pkg],
                             capture_output=True, text=True).stdout
        if not out.strip():
            # virtual packages (provided by another package) count as installable
            prov = subprocess.run(["apt-cache", "showpkg", pkg], capture_output=True, text=True).stdout
            out = prov if "Reverse Provides:" in prov and prov.split("Reverse Provides:")[1].strip() else ""
        cache[pkg] = bool(out.strip())
    return cache[pkg]


def main():
    ids = sys.argv[1:] or sorted(p.stem for p in LABS.glob("[1-5].[0-9].md"))
    problems = 0
    for lid in ids:
        text = (LABS / f"{lid}.md").read_text()
        pkgs, syntax = set(), []
        for lang, body, line in blocks(text):
            if lang in ("bash", "sh"):
                if body.lstrip().startswith("# on rocky-lab"):
                    continue
                pkgs |= apt_packages(body)
                r = subprocess.run(["bash", "-n"], input=body, capture_output=True, text=True)
                if r.returncode:
                    syntax.append(f"line {line}: bash: {r.stderr.strip().splitlines()[-1]}")
            elif lang == "python":
                with tempfile.NamedTemporaryFile("w", suffix=".py") as f:
                    f.write(body); f.flush()
                    r = subprocess.run([sys.executable, "-m", "py_compile", f.name], capture_output=True, text=True)
                    if r.returncode and ">>>" not in body:
                        syntax.append(f"line {line}: python: {r.stderr.strip().splitlines()[-1]}")
        missing = sorted(p for p in pkgs if not exists(p))
        status = "ok  " if not (missing or syntax) else "WARN"
        print(f"{lid}  {status}  {len(pkgs)} apt packages")
        for p in missing:
            print(f"    x package not found in archive: {p}")
        for s in syntax:
            print(f"    x {s}")
        problems += bool(missing or syntax)
    print(f"\n{problems} lab(s) with warnings")


if __name__ == "__main__":
    main()
