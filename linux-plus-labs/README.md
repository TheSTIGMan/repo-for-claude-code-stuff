# Linux+ XK0-006 Hands-On Lab Book

A beginner-friendly lab book with one hands-on lab for every CompTIA Linux+ XK0-006 exam objective (v5.0).

**Download the book:** [`dist/Linux-Plus-XK0-006-Lab-Book.pdf`](dist/Linux-Plus-XK0-006-Lab-Book.pdf)

- **Lab 0** builds the lab: an Ubuntu Server 24.04 LTS VM (`ubuntu-lab`) and a Rocky Linux 9 VM (`rocky-lab`) for the RHEL-only topics (SELinux, firewalld, dnf/rpm, dracut, Kickstart).
- **29 labs**, one per objective, grouped into the 5 exam domains. Every lab has a plain-English "How it works" section, numbered steps with real commands and sample output, "What just happened" explanations, checkpoints, a challenge, clean-up steps, and review questions.
- **Domain 5 labs** are break-and-fix troubleshooting scenarios.
- **Appendices:** answer key, exam corner review sheet, objective coverage map, lab VM troubleshooting, and the official acronym list.

## Build the PDF

Requirements: Python 3 with `pypdf`, `pandoc`, Node.js with `playwright` and Chromium.

```bash
python3 tools/validate.py   # every lab present, every exam keyword covered, template sections present
python3 tools/build.py      # writes dist/Linux-Plus-XK0-006-Lab-Book.pdf
```

## Layout

| Path | What it is |
| --- | --- |
| `labs/00-front.md`, `labs/00-setup.md` | How to use the book, and Lab 0 |
| `labs/1.1.md` … `labs/5.5.md` | One lab per objective |
| `labs/99-troubleshooting.md` | Appendix D |
| `AUTHORING.md` | The lab template and writing rules |
| `book.css` | Print stylesheet |
| `tools/build.py`, `tools/pdf.js` | Markdown → pandoc HTML → Chromium PDF (two passes for TOC page numbers) |
| `tools/validate.py` | Coverage and structure check (uses `../linux-plus-study/tools/objectives.js`) |

Unofficial study guide. CompTIA and Linux+ are trademarks of CompTIA, Inc.
