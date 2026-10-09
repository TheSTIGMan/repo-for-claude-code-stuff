# Linux+ Study Console (XK0-006)

A free, offline study app for the **CompTIA Linux+ XK0-006** exam (objectives v5.0).

- **All 29 objectives** across the 5 domains, each explained in plain English.
- **Real examples**: every topic shows commands in a terminal box with a one-line "what it does".
- **Anki-style flashcards** with spaced repetition: flip the card, then rate it Again / Hard / Good / Easy. Cards you miss come back sooner.
- **Acronym drill** using the official acronym list.
- **Command Match** mini-game: pair commands with what they do, against the clock.
- XP, levels, a daily streak, and search across all lessons and cards.

## Use it

Open `index.html` in any modern browser. No install or server needed.
Progress is saved in your browser (`localStorage`). Use **Copy progress** / **Paste progress** on the dashboard to move it to another browser.

Keyboard shortcuts while studying cards: `Space` flips, `1`–`4` rates.

## Files

| Path | What it is |
| --- | --- |
| `index.html`, `styles.css`, `app.js` | The app |
| `data/00-core.js` | Domain names and exam weights |
| `data/domain1.js` … `domain5.js` | Lessons, examples, and flashcards per objective |
| `data/acronyms.js` | Acronym list from the objectives PDF |
| `tools/objectives.js` | Official objective list with required keywords |
| `tools/validate.js` | Coverage check |
| `tools/build-single.js` | Builds one self-contained HTML file |

## Check coverage

```bash
node tools/validate.js      # every objective, 2+ cards each, every listed keyword present
node tools/build-single.js  # writes dist/linux-plus-study.html (single file you can share)
```

## Add or edit content

Each objective in `data/domainN.js` looks like this:

```js
{ id: "1.3", domain: 1, title: "…", summary: "…",
  topics: [{ name: "…", explain: "…", examples: [{ cmd: "lsblk", what: "…" }], tip: "…" }],
  cards: [{ q: "…", a: "…" }] }
```

Wrap text in backticks (`` `like this` ``) to show it as code. Run `node tools/validate.js` after changes.

This is an unofficial study aid. CompTIA and Linux+ are trademarks of CompTIA, Inc.
