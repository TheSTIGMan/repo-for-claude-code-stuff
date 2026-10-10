#!/usr/bin/env python3
"""Check that the lab book covers every XK0-006 objective.

Usage: python3 tools/validate.py          # all labs
       python3 tools/validate.py 1.3 2.1  # only these labs
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LABS = ROOT / "labs"
OBJ_JS = ROOT.parent / "linux-plus-study" / "tools" / "objectives.js"

REQUIRED = [
    (r"^## Lab \d\.\d: .+\{#lab-\d-\d\}\s*$", "lab heading '## Lab X.Y: Title {#lab-X-Y}'"),
    (r"^::: labinfo\s*$", "'::: labinfo' block"),
    (r"^### What you'll practice\s*$", "'### What you'll practice'"),
    (r"^### How it works\s*$", "'### How it works'"),
    (r"^### Tasks\s*$", "'### Tasks'"),
    (r"^#### Task 1: ", "'#### Task 1: ...'"),
    (r"^::: checkpoint\s*$", "'::: checkpoint' box"),
    (r"^::: explain\s*$", "'::: explain' box"),
    (r"^### Challenge\s*$", "'### Challenge'"),
    (r"^### Clean up\s*$", "'### Clean up'"),
    (r"^### Exam corner\s*$", "'### Exam corner'"),
    (r"^\*\*Review questions\*\*\s*$", "'**Review questions**'"),
    (r"^::: answers\s*$", "'::: answers' block"),
]


def load_objectives():
    js = f"console.log(JSON.stringify(require({json.dumps(str(OBJ_JS))})))"
    return json.loads(subprocess.check_output(["node", "-e", js]))


def check(lab_id, spec):
    path = LABS / f"{lab_id}.md"
    if not path.exists():
        return ["file missing"], 0
    text = path.read_text(encoding="utf-8")
    problems = []
    for pattern, label in REQUIRED:
        if not re.search(pattern, text, re.M):
            problems.append("missing " + label)
    if not re.search(r"^## Lab " + re.escape(lab_id) + ":", text, re.M):
        problems.append(f"heading must start with '## Lab {lab_id}:'")
    if re.search(r"^# ", text, re.M):
        problems.append("contains a level-1 heading")
    # answers block must be last
    tail = text.rstrip().split("\n")
    if tail[-1].strip() != ":::":
        problems.append("file must end with the closing ':::' of the answers block")
    ans = re.search(r"^::: answers\s*$(.*?)^:::\s*$", text, re.M | re.S)
    if ans and text[ans.end():].strip():
        problems.append("answers block is not the last thing in the file")
    # fences must be balanced
    if len(re.findall(r"^\s*```", text, re.M)) % 2:
        problems.append("unbalanced ``` code fences")
    opens = len(re.findall(r"^\s*::: ?\w", text, re.M))
    closes = len(re.findall(r"^\s*:::\s*$", text, re.M))
    if opens != closes:
        problems.append(f"unbalanced ::: divs ({opens} open, {closes} close)")
    low = text.lower()
    missing = [k for k in spec["keywords"] if k.lower() not in low]
    if missing:
        problems.append("missing keywords: " + ", ".join(missing))
    words = len(re.findall(r"\S+", text))
    return problems, words


def main():
    objs = load_objectives()
    wanted = sys.argv[1:] or list(objs)
    bad = 0
    total = 0
    for lab_id in wanted:
        problems, words = check(lab_id, objs[lab_id])
        total += words
        print(f"{lab_id}  {'FAIL' if problems else 'ok  '}  {words:>6} words")
        for p in problems:
            print("    x " + p)
        bad += bool(problems)
    print(f"\n{len(wanted)} labs, {total} words, {bad} with problems")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
