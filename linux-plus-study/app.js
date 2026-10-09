/* Linux+ Study Console: routing, lessons, spaced-repetition flashcards, and a matching game.
   No dependencies. All content comes from window.LINUX_PLUS_DATA (see data/*.js). */
(function () {
  "use strict";

  const DATA = window.LINUX_PLUS_DATA || { domains: [], objectives: [], acronyms: [] };
  const OBJS = DATA.objectives.slice().sort((a, b) => cmpId(a.id, b.id));
  const OBJ_BY_ID = Object.fromEntries(OBJS.map(o => [o.id, o]));
  const DOMAIN = Object.fromEntries(DATA.domains.map(d => [d.id, d]));
  const app = document.getElementById("app");

  function cmpId(a, b) {
    const [a1, a2] = a.split(".").map(Number), [b1, b2] = b.split(".").map(Number);
    return a1 - b1 || a2 - b2;
  }

  /* ---------------- cards ---------------- */
  const CARDS = [];
  OBJS.forEach(o => (o.cards || []).forEach((c, i) =>
    CARDS.push({ id: o.id + ":" + i, obj: o.id, domain: o.domain, q: c.q, a: c.a })));
  const ACR_CARDS = (DATA.acronyms || []).map(x => ({
    id: "acr:" + x.term, obj: null, domain: 0, acronym: true,
    q: "What does `" + x.term + "` stand for?", a: x.meaning
  }));
  const CARD_BY_ID = Object.fromEntries(CARDS.concat(ACR_CARDS).map(c => [c.id, c]));

  /* ---------------- persistent state ---------------- */
  const KEY = "linuxplus-xk0-006-v1";
  const blank = () => ({ xp: 0, learned: {}, srs: {}, streak: { count: 0, last: null }, reviews: 0, theme: null, bestMatch: null });
  let S = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
    } catch (e) { /* storage unavailable: run without saving */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
    updateStats();
  }

  /* day numbers in local time */
  function today() {
    const d = new Date();
    return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
  }
  function touchStreak() {
    const t = today(), last = S.streak.last;
    if (last === t) return;
    S.streak.count = last === t - 1 ? S.streak.count + 1 : 1;
    S.streak.last = t;
  }
  function currentStreak() {
    const last = S.streak.last;
    return last === today() || last === today() - 1 ? S.streak.count : 0;
  }

  /* ---------------- XP & levels ---------------- */
  const levelOf = xp => Math.floor(Math.sqrt(xp / 40)) + 1;
  const xpFor = lvl => 40 * (lvl - 1) * (lvl - 1);
  function addXp(n) {
    const before = levelOf(S.xp);
    S.xp += n;
    touchStreak();
    const after = levelOf(S.xp);
    if (after > before) { toast("Level up! You reached level " + after); confetti(); }
  }

  /* ---------------- spaced repetition (simplified SM-2) ---------------- */
  function schedule(prev, r) {
    const s = Object.assign({ e: 2.5, i: 0, r: 0 }, prev || {});
    if (r === 0) { s.r = 0; s.i = 0; s.e = Math.max(1.3, s.e - 0.2); }
    else if (r === 1) { s.i = Math.max(1, Math.round(s.i * 1.2)); s.e = Math.max(1.3, s.e - 0.15); s.r++; }
    else if (r === 2) { s.i = s.r === 0 ? 1 : s.r === 1 ? 3 : Math.round(s.i * s.e); s.r++; }
    else { s.i = s.r === 0 ? 4 : Math.round(Math.max(s.i, 1) * s.e * 1.3); s.e += 0.15; s.r++; }
    s.due = today() + s.i;
    return s;
  }
  const isNew = c => !S.srs[c.id];
  const isDue = c => S.srs[c.id] && S.srs[c.id].due <= today();
  const fmtInterval = d => d === 0 ? "<1d" : d < 30 ? d + "d" : d < 365 ? Math.round(d / 30) + "mo" : (d / 365).toFixed(1) + "y";
  const reviewedCount = list => list.filter(c => S.srs[c.id]).length;

  /* ---------------- helpers ---------------- */
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  function fmt(s) {
    return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>");
  }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const domainObjs = d => OBJS.filter(o => o.domain === d);
  const domainCards = d => CARDS.filter(c => c.domain === d);
  const looksLikeCommand = cmd => !cmd.includes("\n") && /^(sudo |[a-z0-9_.\/~-]+(\s|$)|\.\/)/.test(cmd) && !/^[a-z0-9_-]+:\s/.test(cmd);

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function copyText(text, btn, msg) {
    const done = () => {
      if (msg) toast(msg);
      if (btn) { btn.textContent = "copied"; setTimeout(() => (btn.textContent = "copy"), 1200); }
    };
    try {
      navigator.clipboard.writeText(text).then(done, () => toast("Copy blocked here. Select the text instead."));
    } catch (e) { toast("Copy blocked here. Select the text instead."); }
  }

  function ring(pct, color) {
    const r = 26, c = 2 * Math.PI * r, off = c * (1 - pct);
    return `<svg class="ring" viewBox="0 0 64 64" style="--dc:${color}" aria-hidden="true">
      <circle class="track" cx="32" cy="32" r="${r}"></circle>
      <circle class="val" cx="32" cy="32" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"></circle>
      <text x="32" y="37" text-anchor="middle">${Math.round(pct * 100)}%</text></svg>`;
  }

  function updateStats() {
    document.getElementById("stat-streak").textContent = currentStreak();
    document.getElementById("stat-xp").textContent = S.xp;
  }

  /* ---------------- theme ---------------- */
  function applyTheme() {
    if (S.theme) document.documentElement.setAttribute("data-theme", S.theme);
    else document.documentElement.removeAttribute("data-theme");
  }
  document.getElementById("theme-btn").addEventListener("click", () => {
    const dark = S.theme ? S.theme === "dark" : !matchMedia("(prefers-color-scheme: light)").matches;
    S.theme = dark ? "light" : "dark";
    applyTheme(); save();
  });

  /* ---------------- router ---------------- */
  let session = null;        // active flashcard session
  let searchQuery = "";
  let pendingTopic = null;   // topic index to scroll to after opening a lesson

  function route() {
    const h = (location.hash || "#home").slice(1);
    document.querySelectorAll("[data-nav]").forEach(a => a.classList.toggle("active",
      h === a.dataset.nav || (a.dataset.nav === "cards" && h === "study")));
    if (h.startsWith("domain-")) renderDomain(Number(h.slice(7)));
    else if (h.startsWith("obj-")) renderLesson(h.slice(4));
    else if (h === "cards") renderDecks();
    else if (h === "study") session ? renderStudy() : (location.hash = "cards");
    else if (h === "match") renderMatch();
    else if (h === "search") renderSearch();
    else renderHome();
    if (h !== "study" || !session) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  function go(hash) { if (location.hash === "#" + hash) route(); else location.hash = hash; }

  /* ---------------- dashboard ---------------- */
  function renderHome() {
    const lvl = levelOf(S.xp), lo = xpFor(lvl), hi = xpFor(lvl + 1);
    const learnedN = OBJS.filter(o => S.learned[o.id]).length;
    const due = CARDS.filter(isDue).length, fresh = CARDS.filter(isNew).length;
    const nextObj = OBJS.find(o => !S.learned[o.id]);
    app.innerHTML = `
    <div class="stack">
      <section class="hero">
        <div class="hero-term">
          <div><span class="p">student@linuxplus:~$</span> cat /etc/exam-release</div>
          <h1>Linux+ Study Console</h1>
          <div>CompTIA Linux+ · exam XK0-006 · objectives v5.0</div>
          <div class="c"># ${DATA.domains.length} domains · ${OBJS.length} objectives · ${CARDS.length} flashcards · ${ACR_CARDS.length} acronyms</div>
          <div class="exam-meta"><span>max 90 questions</span><span>90 minutes</span><span>multiple-choice + performance-based</span></div>
          <div style="margin-top:14px"><span class="p">student@linuxplus:~$</span> ./study --next <span class="cursor" style="display:inline-block;width:.55em;height:1em;background:var(--d1);vertical-align:-2px"></span></div>
        </div>
        <div class="player">
          <div class="level-line"><div><div class="eyebrow">Level</div><div class="level-num">${lvl}</div></div>
            <div class="muted" style="font-family:var(--font-mono);font-size:.85rem">${S.xp - lo} / ${hi - lo} xp to level ${lvl + 1}</div></div>
          <div class="bar"><span style="width:${Math.min(100, ((S.xp - lo) / (hi - lo)) * 100)}%"></span></div>
          <div class="kpis">
            <div class="kpi"><b>${currentStreak()}</b><span>day streak</span></div>
            <div class="kpi"><b>${due}</b><span>cards due</span></div>
            <div class="kpi"><b>${learnedN}/${OBJS.length}</b><span>objectives learned</span></div>
          </div>
          <div class="row">
            <button class="btn primary" id="btn-due">${due ? "Review " + due + " due cards" : "Study new cards (" + Math.min(fresh, 20) + ")"}</button>
            ${nextObj ? `<a class="btn" href="#obj-${nextObj.id}">Next lesson: ${nextObj.id}</a>` : ""}
          </div>
        </div>
      </section>

      <section class="stack" style="gap:10px">
        <div class="eyebrow">Exam weight by domain</div>
        <div class="weights">${DATA.domains.map(d => `<span style="width:${d.weight}%;background:${d.color}" title="${esc(d.name)} ${d.weight}%"></span>`).join("")}</div>
        <div class="legend">${DATA.domains.map(d => `<span><i style="background:${d.color}"></i>${d.id}.0 ${esc(d.name)} · ${d.weight}%</span>`).join("")}</div>
      </section>

      <section class="domain-grid">
        ${DATA.domains.map(d => {
          const objs = domainObjs(d.id), cards = domainCards(d.id);
          const pct = objs.length ? objs.filter(o => S.learned[o.id]).length / objs.length : 0;
          return `<a class="domain-card" href="#domain-${d.id}" style="--dc:${d.color}">
            ${ring(pct, d.color)}
            <div class="info"><span class="tag">${d.id}.0 · ${d.icon} · ${d.weight}% OF EXAM</span>
              <h3>${esc(d.name)}</h3>
              <span class="muted" style="font-size:.85rem">${objs.length} objectives · ${reviewedCount(cards)}/${cards.length} cards reviewed</span></div>
          </a>`;
        }).join("")}
        <button class="domain-card extra" id="btn-acr" type="button">
          ${ring(ACR_CARDS.length ? reviewedCount(ACR_CARDS) / ACR_CARDS.length : 0, "var(--accent)")}
          <div class="info"><span class="tag">BONUS · ACRONYMS</span><h3>Acronym drill</h3>
            <span class="muted" style="font-size:.85rem">${reviewedCount(ACR_CARDS)}/${ACR_CARDS.length} acronyms reviewed</span></div>
        </button>
      </section>

      <section class="quick-grid">
        <a class="quick" href="#match"><span class="cmdline">$ ./command-match</span><h3>Command Match</h3><span class="muted">Pair commands with what they do. Beat your best time${S.bestMatch ? " (" + S.bestMatch + "s)" : ""}.</span></a>
        <a class="quick" href="#cards"><span class="cmdline">$ ls ~/decks</span><h3>All flashcard decks</h3><span class="muted">Study by domain or by single objective.</span></a>
      </section>

      <section class="panel stack" style="gap:12px">
        <div class="eyebrow">Your progress</div>
        <p class="muted" style="margin:0">Progress is saved in this browser. Copy it to back it up or move it to another device.</p>
        <div class="row">
          <button class="btn small" id="btn-export">Copy progress</button>
          <button class="btn small" id="btn-import">Paste progress</button>
          <span class="confirm-row" id="reset-wrap"><button class="btn small" id="btn-reset">Reset progress</button></span>
        </div>
        <div id="import-box" hidden class="stack" style="gap:8px">
          <textarea id="import-text" rows="4" style="width:100%;font:.8rem var(--font-mono);background:var(--surface-2);color:var(--fg);border:1px solid var(--line);border-radius:8px;padding:8px" placeholder="Paste copied progress here"></textarea>
          <div><button class="btn small primary" id="btn-import-go">Load progress</button></div>
        </div>
      </section>
    </div>`;

    document.getElementById("btn-due").onclick = () => startSession("due");
    document.getElementById("btn-acr").onclick = () => startSession("acr");
    document.getElementById("btn-export").onclick = e => copyText(JSON.stringify(S), null, "Progress copied to clipboard");
    document.getElementById("btn-import").onclick = () => { document.getElementById("import-box").hidden = false; };
    document.getElementById("btn-import-go").onclick = () => {
      try {
        const v = JSON.parse(document.getElementById("import-text").value);
        if (typeof v !== "object" || !v.srs) throw new Error();
        S = Object.assign(blank(), v); save(); applyTheme(); toast("Progress loaded"); renderHome();
      } catch (e) { toast("That text is not valid progress data. Copy it again and retry."); }
    };
    document.getElementById("btn-reset").onclick = () => {
      document.getElementById("reset-wrap").innerHTML =
        `<span class="muted">Erase all progress?</span><button class="btn small" id="reset-yes" style="border-color:var(--bad);color:var(--bad)">Yes, erase</button><button class="btn small" id="reset-no">Cancel</button>`;
      document.getElementById("reset-yes").onclick = () => { const t = S.theme; S = blank(); S.theme = t; save(); toast("Progress erased"); renderHome(); };
      document.getElementById("reset-no").onclick = renderHome;
    };
  }

  /* ---------------- domain page ---------------- */
  function renderDomain(id) {
    const d = DOMAIN[id];
    if (!d) return go("home");
    const objs = domainObjs(id);
    app.innerHTML = `
    <div class="stack" style="--dc:${d.color}">
      <div class="crumbs"><a href="#home">~</a> / domain-${id}</div>
      <div class="row" style="justify-content:space-between">
        <div class="stack" style="gap:6px"><span class="eyebrow" style="color:${d.color}">Domain ${id}.0 · ${d.weight}% of the exam</span><h1>${esc(d.name)}</h1></div>
        <button class="btn primary" id="dom-study">Flashcards for this domain</button>
      </div>
      <div class="obj-list">
        ${objs.map(o => {
          const n = (o.cards || []).length, rev = reviewedCount(CARDS.filter(c => c.obj === o.id));
          return `<a class="obj-row" href="#obj-${o.id}">
            <span class="obj-id">${o.id}</span>
            <span style="min-width:0"><b>${esc(o.title)}</b><br><span class="meta">${o.topics.length} topics · ${n} cards · ${rev} reviewed</span></span>
            <span class="chip ${S.learned[o.id] ? "done" : ""}">${S.learned[o.id] ? "✓ learned" : "not yet"}</span></a>`;
        }).join("")}
      </div>
    </div>`;
    document.getElementById("dom-study").onclick = () => startSession("domain", id);
  }

  /* ---------------- lesson page ---------------- */
  function renderLesson(id) {
    const o = OBJ_BY_ID[id];
    if (!o) return go("home");
    const d = DOMAIN[o.domain];
    const i = OBJS.indexOf(o), prev = OBJS[i - 1], next = OBJS[i + 1];
    const exCount = o.topics.reduce((n, t) => n + (t.examples || []).length, 0);
    app.innerHTML = `
    <article class="stack" style="--dc:${d.color}">
      <div class="crumbs"><a href="#home">~</a> / <a href="#domain-${d.id}">domain-${d.id}</a> / ${o.id}</div>
      <div class="man-head"><span>LINUX+(${o.id})</span><span>XK0-006 Study Manual</span><span>LINUX+(${o.id})</span></div>
      <header class="lesson-title">
        <span class="section-label">NAME</span>
        <h1><span style="color:${d.color}">${o.id}</span> ${esc(o.title)}</h1>
        <span class="section-label">SYNOPSIS</span>
        <p class="summary" style="margin:0">${fmt(o.summary)}</p>
        <span class="muted" style="font:.82rem var(--font-mono)">${o.topics.length} topics · ${exCount} examples · ${o.cards.length} flashcards</span>
      </header>
      <nav class="toc" aria-label="Topics">${o.topics.map((t, k) => `<a href="#obj-${o.id}" data-topic="${k}">${esc(t.name)}</a>`).join("")}</nav>
      <div class="row" style="justify-content:space-between"><span class="section-label">DESCRIPTION</span>
        <button class="btn small" id="toggle-all">Expand all</button></div>
      <div class="stack" style="gap:12px" id="topics">
        ${o.topics.map((t, k) => `
        <details class="topic" id="topic-${k}" ${k < 2 ? "open" : ""}>
          <summary><h3>${esc(t.name)}</h3><span class="count">${(t.examples || []).length ? (t.examples.length + " example" + (t.examples.length > 1 ? "s" : "")) : ""}</span></summary>
          <div class="topic-body">
            <p>${fmt(t.explain)}</p>
            ${(t.examples || []).map(ex => `
              <div class="term">
                <div class="term-cmd"><pre class="${looksLikeCommand(ex.cmd) ? "" : "multi"}">${esc(ex.cmd)}</pre><button class="copy" type="button" data-cmd="${esc(ex.cmd)}">copy</button></div>
                <div class="term-what">${fmt(ex.what)}</div>
              </div>`).join("")}
            ${t.tip ? `<div class="tip"><b>EXAM TIP</b> ${fmt(t.tip)}</div>` : ""}
          </div>
        </details>`).join("")}
      </div>
      <div class="lesson-actions">
        <button class="btn ${S.learned[o.id] ? "" : "primary"}" id="mark">${S.learned[o.id] ? "✓ Learned" : "Mark as learned (+20 xp)"}</button>
        <button class="btn" id="study-obj">Flashcards (${o.cards.length})</button>
        ${next ? `<a class="btn" href="#obj-${next.id}">Next: ${next.id} →</a>` : ""}
      </div>
      <div class="pager">
        ${prev ? `<a class="btn small" href="#obj-${prev.id}">← ${prev.id}</a>` : "<span></span>"}
        <a class="btn small" href="#domain-${d.id}">All of domain ${d.id}</a>
      </div>
    </article>`;

    app.querySelectorAll(".copy").forEach(b => b.onclick = () => copyText(b.dataset.cmd, b));
    app.querySelectorAll(".toc a").forEach(a => a.onclick = e => { e.preventDefault(); openTopic(Number(a.dataset.topic)); });
    const toggle = document.getElementById("toggle-all");
    toggle.onclick = () => {
      const all = app.querySelectorAll("details.topic"), open = toggle.textContent === "Expand all";
      all.forEach(x => (x.open = open));
      toggle.textContent = open ? "Collapse all" : "Expand all";
    };
    document.getElementById("mark").onclick = () => {
      if (S.learned[o.id]) { delete S.learned[o.id]; save(); return renderLesson(id); }
      S.learned[o.id] = true; addXp(20); save();
      toast("Objective " + o.id + " learned. +20 xp");
      if (OBJS.every(x => S.learned[x.id]) || domainObjs(o.domain).every(x => S.learned[x.id])) confetti();
      renderLesson(id);
    };
    document.getElementById("study-obj").onclick = () => startSession("obj", o.id);
    if (pendingTopic !== null) { const k = pendingTopic; pendingTopic = null; setTimeout(() => openTopic(k), 0); }
  }
  function openTopic(k) {
    const el = document.getElementById("topic-" + k);
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  /* ---------------- deck picker ---------------- */
  function renderDecks() {
    const due = CARDS.filter(isDue).length, fresh = CARDS.filter(isNew).length;
    app.innerHTML = `
    <div class="stack">
      <div class="stack" style="gap:6px"><span class="eyebrow">Anki-style flashcards</span><h1>Pick a deck</h1>
        <p class="muted" style="margin:0;max-width:68ch">Read the question, say your answer out loud, then flip. Rate how well you knew it. Cards you miss come back soon; cards you know well wait longer. That is spaced repetition.</p></div>
      <div class="deck-picker">
        <button class="deck" data-mode="due"><h3>Daily review</h3><span class="n"><span class="due">${due} due</span> · ${fresh} new</span><span class="muted">Due cards first, then up to 20 new ones.</span></button>
        <button class="deck" data-mode="random"><h3>Random 25</h3><span class="n">${CARDS.length} cards in the pool</span><span class="muted">Mixed practice across every domain.</span></button>
        <button class="deck" data-mode="acr"><h3>Acronyms</h3><span class="n">${ACR_CARDS.length} cards · ${reviewedCount(ACR_CARDS)} reviewed</span><span class="muted">20 at a time from the official list.</span></button>
        ${DATA.domains.map(d => {
          const cards = domainCards(d.id);
          return `<button class="deck" data-mode="domain" data-arg="${d.id}" style="--dc:${d.color}"><span class="eyebrow" style="color:${d.color}">Domain ${d.id}.0</span><h3>${esc(d.name)}</h3><span class="n">${cards.length} cards · <span class="due">${cards.filter(isDue).length} due</span></span></button>`;
        }).join("")}
      </div>
      <div class="panel row">
        <label for="obj-select" class="eyebrow">Single objective</label>
        <select class="select" id="obj-select">${OBJS.map(o => `<option value="${o.id}">${o.id} · ${esc(o.title)} (${o.cards.length})</option>`).join("")}</select>
        <button class="btn primary" id="obj-go">Study</button>
      </div>
    </div>`;
    app.querySelectorAll(".deck").forEach(b => b.onclick = () => startSession(b.dataset.mode, b.dataset.arg ? Number(b.dataset.arg) : undefined));
    document.getElementById("obj-go").onclick = () => startSession("obj", document.getElementById("obj-select").value);
  }

  /* ---------------- study session ---------------- */
  function prioritize(list) {
    // due cards (most overdue first), then new cards, then the rest
    const due = list.filter(isDue).sort((a, b) => S.srs[a.id].due - S.srs[b.id].due);
    const fresh = shuffle(list.filter(isNew));
    const rest = shuffle(list.filter(c => !isDue(c) && !isNew(c)));
    return { due, fresh, rest };
  }
  function startSession(mode, arg) {
    let cards, title;
    if (mode === "due") {
      const p = prioritize(CARDS);
      cards = p.due.concat(p.fresh.slice(0, 20));
      title = "Daily review";
      if (!cards.length) { toast("Nothing due. Here are 15 random cards instead."); cards = shuffle(CARDS.slice()).slice(0, 15); }
    } else if (mode === "random") {
      cards = shuffle(CARDS.slice()).slice(0, 25); title = "Random 25";
    } else if (mode === "acr") {
      const p = prioritize(ACR_CARDS); cards = p.due.concat(p.fresh, p.rest).slice(0, 20); title = "Acronyms";
    } else if (mode === "domain") {
      const p = prioritize(domainCards(arg)); cards = p.due.concat(p.fresh, p.rest).slice(0, 30);
      title = "Domain " + arg + ".0 · " + DOMAIN[arg].name;
    } else {
      const p = prioritize(CARDS.filter(c => c.obj === arg)); cards = p.due.concat(p.fresh, p.rest);
      title = "Objective " + arg;
    }
    session = { title, queue: cards.slice(), pos: 0, total: cards.length, flipped: false, again: {}, tally: [0, 0, 0, 0], back: mode === "obj" ? "obj-" + arg : "cards" };
    go("study");
  }

  function renderStudy() {
    const s = session;
    if (s.pos >= s.queue.length) return renderDone();
    const c = s.queue[s.pos];
    const o = c.obj ? OBJ_BY_ID[c.obj] : null;
    const color = o ? DOMAIN[o.domain].color : "var(--accent)";
    const doneCount = Math.min(s.pos, s.total);
    const prev = S.srs[c.id];
    const status = !prev ? "NEW" : isDue(c) ? "DUE" : "REVIEW";
    const labels = ["Again", "Hard", "Good", "Easy"];
    app.innerHTML = `
    <div class="study">
      <div class="study-top">
        <div class="row"><span class="crumbs"><a href="#${s.back}">← back</a> · ${esc(s.title)}</span>
          <span class="crumbs">${doneCount} / ${s.total} · ${s.queue.length - s.pos} left</span></div>
        <div class="bar"><span style="width:${(doneCount / Math.max(1, s.total)) * 100}%"></span></div>
      </div>
      <div class="card-scene">
        <div class="flashcard ${s.flipped ? "flipped" : ""}" id="fc" tabindex="0" role="button" aria-label="Flashcard. Press space to flip.">
          <div class="face front" style="border-top:4px solid ${color}">
            <div class="label"><span>${o ? "OBJECTIVE " + o.id : "ACRONYM"}</span><span>${status}</span></div>
            <div class="text"><div>${fmt(c.q)}</div></div>
            <div class="hint">tap or press space to flip</div>
          </div>
          <div class="face back">
            <div class="label"><span>ANSWER</span><span>${o ? esc(o.title.slice(0, 48)) + (o.title.length > 48 ? "…" : "") : ""}</span></div>
            <div class="text"><div>${fmt(c.a)}</div></div>
            ${o ? `<div class="hint"><a href="#obj-${o.id}">open lesson ${o.id}</a></div>` : ""}
          </div>
        </div>
      </div>
      <div class="ratings" ${s.flipped ? "" : "hidden"}>
        ${labels.map((l, r) => `<button class="rate" data-r="${r}">${l}<small>${r + 1} · ${fmtInterval(schedule(prev, r).i)}</small></button>`).join("")}
      </div>
      <button class="btn primary" id="flip-btn" ${s.flipped ? "hidden" : ""}>Show answer</button>
      <div class="kbd-help"><kbd>Space</kbd> flip · <kbd>1</kbd>–<kbd>4</kbd> rate</div>
    </div>`;
    const fc = document.getElementById("fc");
    fc.onclick = e => { if (e.target.closest("a")) return; flip(); };
    document.getElementById("flip-btn").onclick = flip;
    app.querySelectorAll(".rate").forEach(b => b.onclick = () => rate(Number(b.dataset.r)));
  }
  function flip() {
    if (!session) return;
    session.flipped = !session.flipped;
    document.getElementById("fc").classList.toggle("flipped", session.flipped);
    app.querySelector(".ratings").hidden = !session.flipped;
    document.getElementById("flip-btn").hidden = session.flipped;
  }
  function rate(r) {
    const s = session;
    if (!s || !s.flipped) return;
    const c = s.queue[s.pos];
    S.srs[c.id] = schedule(S.srs[c.id], r);
    S.reviews++;
    s.tally[r]++;
    addXp([1, 2, 3, 3][r]);
    if (r === 0 && (s.again[c.id] || 0) < 3) { s.again[c.id] = (s.again[c.id] || 0) + 1; s.queue.push(c); }
    s.pos++; s.flipped = false;
    save();
    renderStudy();
  }
  function renderDone() {
    const s = session, seen = s.tally.reduce((a, b) => a + b, 0);
    const pct = seen ? Math.round(((s.tally[2] + s.tally[3]) / seen) * 100) : 0;
    app.innerHTML = `
    <div class="study"><div class="done-panel">
      <span class="eyebrow">Session complete · ${esc(s.title)}</span>
      <div class="big">${pct}%</div>
      <p style="margin:0">You rated ${seen} cards: ${s.tally[3]} easy, ${s.tally[2]} good, ${s.tally[1]} hard, ${s.tally[0]} again.</p>
      <p class="muted" style="margin:0">Cards you found hard come back sooner. Check the dashboard tomorrow for due cards.</p>
      <div class="row" style="justify-content:center">
        <button class="btn primary" id="again-btn">Study more</button>
        <a class="btn" href="#${s.back}">Back</a>
        <a class="btn" href="#home">Dashboard</a>
      </div>
    </div></div>`;
    confetti();
    document.getElementById("again-btn").onclick = () => startSession("due");
  }

  document.addEventListener("keydown", e => {
    if (location.hash !== "#study" || !session) return;
    if (e.target.matches("input, textarea, select")) return;
    if (e.key === " " || e.key === "Enter") { if (e.target.closest("button, a") && e.key === "Enter") return; e.preventDefault(); flip(); }
    else if (["1", "2", "3", "4"].includes(e.key)) rate(Number(e.key) - 1);
  });

  /* ---------------- command match game ---------------- */
  let match = null;
  function examplePool(domain) {
    const seen = new Set(), pool = [];
    OBJS.filter(o => !domain || o.domain === domain).forEach(o => o.topics.forEach(t => (t.examples || []).forEach(ex => {
      if (ex.cmd.includes("\n") || ex.cmd.length > 52 || ex.what.length > 120 || seen.has(ex.cmd)) return;
      if (/^(also|same|this|that|it|then|again|now|here)\b/i.test(ex.what)) return; // needs context to make sense
      seen.add(ex.cmd); pool.push({ cmd: ex.cmd, what: ex.what, obj: o.id });
    })));
    return pool;
  }
  function renderMatch(domain) {
    domain = domain === undefined ? (match ? match.domain : 0) : domain;
    const pool = examplePool(domain);
    const pairs = shuffle(pool).slice(0, 6).map((p, i) => Object.assign({ k: i }, p));
    match = { domain, pairs, left: shuffle(pairs.slice()), right: shuffle(pairs.slice()), sel: null, found: 0, misses: 0, start: Date.now() };
    app.innerHTML = `
    <div class="stack">
      <div class="row" style="justify-content:space-between">
        <div class="stack" style="gap:6px"><span class="eyebrow">Mini-game</span><h1>Command Match</h1>
          <p class="muted" style="margin:0">Tap a command, then tap what it does. Clear all six pairs as fast as you can.</p></div>
        <div class="row">
          <select class="select" id="match-domain" aria-label="Domain">
            <option value="0">All domains</option>
            ${DATA.domains.map(d => `<option value="${d.id}" ${d.id === domain ? "selected" : ""}>${d.id}.0 ${esc(d.name)}</option>`).join("")}
          </select>
          <button class="btn" id="match-new">New round</button>
        </div>
      </div>
      <div class="row muted" style="font-family:var(--font-mono);font-size:.85rem;gap:18px">
        <span>pairs <b id="m-found" style="color:var(--fg)">0</b>/6</span><span>misses <b id="m-miss" style="color:var(--fg)">0</b></span>
        <span>time <b id="m-time" style="color:var(--fg)">0</b>s</span>${S.bestMatch ? `<span>best <b style="color:var(--accent)">${S.bestMatch}s</b></span>` : ""}
      </div>
      <div class="match-board">
        <div class="match-col">${match.left.map(p => `<button class="tile cmd" data-side="L" data-k="${p.k}">${esc(p.cmd)}</button>`).join("")}</div>
        <div class="match-col">${match.right.map(p => `<button class="tile" data-side="R" data-k="${p.k}">${fmt(p.what)}</button>`).join("")}</div>
      </div>
      <div id="match-result"></div>
    </div>`;
    document.getElementById("match-domain").onchange = e => renderMatch(Number(e.target.value));
    document.getElementById("match-new").onclick = () => renderMatch(match.domain);
    app.querySelectorAll(".tile").forEach(t => t.onclick = () => pickTile(t));
    clearInterval(renderMatch._timer);
    renderMatch._timer = setInterval(() => {
      const el = document.getElementById("m-time");
      if (!el || !match || match.found === 6) return clearInterval(renderMatch._timer);
      el.textContent = Math.floor((Date.now() - match.start) / 1000);
    }, 500);
  }
  function pickTile(t) {
    if (t.classList.contains("ok")) return;
    const m = match;
    if (!m.sel || m.sel.dataset.side === t.dataset.side) {
      if (m.sel) m.sel.classList.remove("sel");
      m.sel = t; t.classList.add("sel"); return;
    }
    const a = m.sel; a.classList.remove("sel"); m.sel = null;
    if (a.dataset.k === t.dataset.k) {
      a.classList.add("ok"); t.classList.add("ok"); a.disabled = t.disabled = true;
      m.found++; document.getElementById("m-found").textContent = m.found;
      if (m.found === 6) finishMatch();
    } else {
      m.misses++; document.getElementById("m-miss").textContent = m.misses;
      [a, t].forEach(x => { x.classList.remove("no"); void x.offsetWidth; x.classList.add("no"); });
    }
  }
  function finishMatch() {
    const secs = Math.round((Date.now() - match.start) / 1000);
    const best = !S.bestMatch || secs < S.bestMatch;
    if (best) S.bestMatch = secs;
    addXp(15); save();
    confetti();
    document.getElementById("m-time").textContent = secs;
    document.getElementById("match-result").innerHTML = `
      <div class="panel stack" style="gap:10px">
        <h2>${best ? "New best time: " + secs + "s" : "Cleared in " + secs + "s"} · ${match.misses} miss${match.misses === 1 ? "" : "es"} · +15 xp</h2>
        <div class="muted">Review the lessons behind this round:</div>
        <div class="toc">${match.pairs.map(p => `<a href="#obj-${p.obj}">${p.obj} · ${esc(p.cmd)}</a>`).join("")}</div>
        <div><button class="btn primary" id="match-again">Play again</button></div>
      </div>`;
    document.getElementById("match-again").onclick = () => renderMatch(match.domain);
  }

  /* ---------------- search ---------------- */
  const searchForm = document.getElementById("search-form"), searchInput = document.getElementById("search-input");
  searchForm.addEventListener("submit", e => { e.preventDefault(); searchQuery = searchInput.value.trim(); go("search"); });
  searchInput.addEventListener("input", () => {
    clearTimeout(searchInput._t);
    searchInput._t = setTimeout(() => {
      searchQuery = searchInput.value.trim();
      if (searchQuery.length >= 2) { if (location.hash === "#search") renderSearch(); else location.hash = "search"; }
    }, 250);
  });
  function snippet(text, q) {
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) return esc(text.slice(0, 160)) + (text.length > 160 ? "…" : "");
    const start = Math.max(0, i - 70), end = Math.min(text.length, i + q.length + 90);
    const part = text.slice(start, end);
    return (start ? "…" : "") + esc(part).replace(new RegExp(esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), m => "<mark>" + m + "</mark>") + (end < text.length ? "…" : "");
  }
  function renderSearch() {
    const q = searchQuery;
    const ql = q.toLowerCase();
    const results = [];
    if (q.length >= 2) {
      OBJS.forEach(o => {
        o.topics.forEach((t, k) => {
          const parts = [t.name, t.explain, t.tip || ""].concat((t.examples || []).map(e => e.cmd + " " + e.what));
          const hay = parts.join(" \n ");
          if (hay.toLowerCase().includes(ql)) {
            const hit = t.name.toLowerCase().includes(ql) ? 3 : (t.examples || []).some(e => e.cmd.toLowerCase().includes(ql)) ? 2 : 1;
            const src = (t.examples || []).find(e => (e.cmd + " " + e.what).toLowerCase().includes(ql));
            results.push({ score: hit, html: `<a class="result" href="#obj-${o.id}" data-topic="${k}"><div class="where">${o.id} · topic</div><b>${esc(t.name)}</b><div class="muted">${snippet(src && !t.explain.toLowerCase().includes(ql) ? src.cmd + " — " + src.what : t.explain, q)}</div></a>` });
          }
        });
        o.cards.forEach(c => {
          if ((c.q + " " + c.a).toLowerCase().includes(ql))
            results.push({ score: 0, html: `<a class="result" href="#obj-${o.id}"><div class="where">${o.id} · flashcard</div><b>${snippet(c.q, q)}</b><div class="muted">${snippet(c.a, q)}</div></a>` });
        });
      });
      (DATA.acronyms || []).forEach(a => {
        if ((a.term + " " + a.meaning).toLowerCase().includes(ql))
          results.push({ score: a.term.toLowerCase() === ql ? 4 : 0, html: `<div class="result"><div class="where">acronym</div><b>${esc(a.term)}</b> <span class="muted">${esc(a.meaning)}</span></div>` });
      });
    }
    results.sort((a, b) => b.score - a.score);
    app.innerHTML = `
    <div class="stack">
      <div class="stack" style="gap:6px"><span class="eyebrow">grep -ri "${esc(q)}"</span><h1>${results.length} result${results.length === 1 ? "" : "s"}</h1></div>
      ${q.length < 2 ? `<p class="muted">Type at least 2 characters in the search box.</p>` : ""}
      <div class="stack" style="gap:10px">${results.slice(0, 80).map(r => r.html).join("")}</div>
      ${results.length > 80 ? `<p class="muted">Showing the first 80. Try a more specific search.</p>` : ""}
    </div>`;
    app.querySelectorAll("a.result[data-topic]").forEach(a => a.addEventListener("click", () => { pendingTopic = Number(a.dataset.topic); }));
  }

  /* ---------------- confetti ---------------- */
  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = document.getElementById("confetti"), ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const cs = getComputedStyle(document.documentElement);
    const colors = ["--d1", "--d2", "--d3", "--d4", "--d5"].map(v => cs.getPropertyValue(v).trim() || "#f2a541");
    const parts = Array.from({ length: 140 }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35,
      vx: (Math.random() - .5) * 12, vy: -Math.random() * 11 - 4, s: 4 + Math.random() * 5,
      r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[Math.floor(Math.random() * colors.length)]
    }));
    const t0 = performance.now();
    (function frame(t) {
      const age = t - t0;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(p => {
        p.vy += .32; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= .99;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, 1 - age / 1800);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
      });
      if (age < 1800) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  /* ---------------- boot ---------------- */
  applyTheme();
  updateStats();
  route();
})();
