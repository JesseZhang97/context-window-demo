(() => {
  "use strict";

  const CAPACITY = 200_000;
  const HELD = 8_192;

  /** Initial dataset matching the source video frames */
  const INITIAL = {
    headline: "Over half of this window is work that already landed",
    caption: "Every copy was worth reading once, and is charged again on every turn since",
    doneHeadline: "Every token left in here is work still in play",
    doneCaption: "Superseded copies, unread tool output, and old turns collapsed to summaries",
    sections: [
      {
        id: "preamble",
        title: "Preamble",
        hint: "Cannot go",
        col: "left",
        items: [
          { id: "sys", name: "System prompt", tokens: 2310, desc: "one file, sent every turn", kind: "inplay" },
          { id: "tools", name: "Tool schemas", tokens: 11840, desc: "14 tools, whether called or not", kind: "inplay" },
          { id: "proj", name: "Project instructions", tokens: 3560, desc: "AGENTS.md and two nested", kind: "inplay" },
          { id: "mem", name: "Recalled memory", tokens: 940, desc: "8 of 23 files matched", kind: "inplay" },
        ],
      },
      {
        id: "files",
        title: "Files read",
        hint: "Drop superseded copies",
        action: "dropped",
        col: "right",
        items: [
          { id: "machine", name: "machine.ts", tokens: 15940, reclaim: 11955, desc: "effort-warning · read 4 times, once per edit", kind: "landed" },
          { id: "globals", name: "globals.css", tokens: 15476, reclaim: 7738, desc: "app · read twice, 25 kB each time", kind: "landed" },
          { id: "card", name: "card.tsx", tokens: 6630, reclaim: 4420, desc: "effort-warning · read 3 times, 2 superseded", kind: "landed" },
          { id: "slider", name: "slider.tsx", tokens: 4442, reclaim: 2221, desc: "effort-warning · read twice over the pointer fix", kind: "landed" },
          { id: "five", name: "Five more files", tokens: 7259, desc: "flame, roll, swarm, svg, run — once each", kind: "inplay" },
        ],
      },
      {
        id: "toolsOut",
        title: "Tool output",
        hint: "Drop what nothing read",
        action: "dropped",
        col: "left",
        items: [
          { id: "npm", name: "npm run build", tokens: 12630, reclaim: 8420, desc: "3 runs, the 2 failures long since fixed", kind: "landed" },
          { id: "grep", name: "grep -rn effort src", tokens: 9984, reclaim: 9984, desc: "312 matches, 3 of them were read", kind: "landed" },
          { id: "shots", name: "Screenshots of the card", tokens: 4620, reclaim: 3080, desc: "3 images at 1,540 each, 2 now out of date", kind: "landed" },
          { id: "devlog", name: "Dev server log", tokens: 3390, reclaim: 3390, desc: "2 tails, neither had the error in it", kind: "landed" },
        ],
      },
      {
        id: "convo",
        title: "Conversation",
        hint: "Collapse to a summary",
        action: "summarised",
        col: "right",
        items: [
          { id: "t1", name: "Turns 1 – 9", tokens: 24300, reclaim: 22980, desc: "the heat model, shipped", kind: "landed" },
          { id: "t2", name: "Turns 10 – 21", tokens: 31600, reclaim: 29920, desc: "pointer capture on the slider, fixed", kind: "landed" },
          { id: "t3", name: "Turns 22 – 34", tokens: 26800, desc: "the swarm and the flame, still open", kind: "inplay" },
          { id: "t4", name: "Turns 35 – 38", tokens: 8400, desc: "the warning card, in progress", kind: "inplay" },
        ],
      },
    ],
    /** Visual order of slabs on the bar (item ids), matching the video's mixed chronology */
    barOrder: [
      "sys", "tools", "proj", "mem",
      "t1", "machine", "npm", "t2",
      "globals", "grep", "card", "shots",
      "slider", "devlog", "five", "t3", "t4",
    ],
  };

  const $ = (sel, el = document) => el.querySelector(sel);
  const fmt = (n) => Math.round(n).toLocaleString("en-US");

  function cloneState() {
    return {
      headline: INITIAL.headline,
      caption: INITIAL.caption,
      animating: false,
      done: false,
      hoverId: null,
      items: Object.fromEntries(
        INITIAL.sections.flatMap((s) =>
          s.items.map((it) => [
            it.id,
            {
              ...it,
              current: it.tokens,
              reclaimLeft: it.reclaim || 0,
              status: null, // 'dropped' | 'summarised'
              sectionId: s.id,
              action: s.action || null,
            },
          ])
        )
      ),
    };
  }

  let state = cloneState();

  function allItems() {
    return Object.values(state.items);
  }

  function sectionTotal(sectionId) {
    const sec = INITIAL.sections.find((s) => s.id === sectionId);
    return sec.items.reduce((sum, it) => sum + state.items[it.id].current, 0);
  }

  function carried() {
    return allItems().reduce((s, it) => s + it.current, 0);
  }

  function reclaimable() {
    return allItems().reduce((s, it) => s + (it.status ? 0 : it.reclaimLeft), 0);
  }

  function freeTokens() {
    return Math.max(0, CAPACITY - carried() - HELD);
  }

  function roomLeft() {
    return freeTokens();
  }

  function pctFull() {
    return Math.round((carried() / CAPACITY) * 100);
  }

  function slabCount() {
    // Match the video: always 17 context slabs, even after some go to 0 tokens
    return INITIAL.barOrder.length;
  }

  /* —— Render —— */
  function renderBar() {
    const bar = $("#bar");
    const tip = $("#hoverTip");
    const frag = document.createDocumentFragment();

    INITIAL.barOrder.forEach((id) => {
      const it = state.items[id];
      if (it.current <= 0 && it.status) {
        // keep a zero-width placeholder? skip — item gone from bar when fully dropped
        if (it.current === 0) return;
      }
      if (it.current <= 0) return;

      const el = document.createElement("div");
      el.className = `slab ${it.kind}`;
      el.dataset.id = id;
      el.style.flexGrow = String(it.current);
      el.style.flexBasis = "0";
      el.title = `${it.name} · ${fmt(it.current)} tokens`;

      if (state.hoverId === id) el.classList.add("highlight");

      el.addEventListener("mouseenter", () => setHover(id));
      el.addEventListener("mouseleave", () => setHover(null));
      el.addEventListener("click", () => {
        if (it.reclaimLeft && !it.status) setHover(id);
      });

      frag.appendChild(el);
    });

    // Free
    const free = freeTokens();
    if (free > 0) {
      const el = document.createElement("div");
      el.className = "slab free";
      el.dataset.id = "__free";
      el.style.flexGrow = String(free);
      el.style.flexBasis = "0";
      el.title = `Free · ${fmt(free)} tokens`;
      frag.appendChild(el);
    }

    // Held
    const held = document.createElement("div");
    held.className = "slab held";
    held.dataset.id = "__held";
    held.style.flexGrow = String(HELD);
    held.style.flexBasis = "0";
    held.title = `Held for the reply · ${fmt(HELD)} tokens`;
    frag.appendChild(held);

    bar.replaceChildren(frag);

    // Tip position
    if (state.hoverId && state.items[state.hoverId]) {
      const slab = bar.querySelector(`[data-id="${state.hoverId}"]`);
      const it = state.items[state.hoverId];
      if (slab && it) {
        const slabRect = slab.getBoundingClientRect();
        tip.hidden = false;
        tip.classList.add("visible");
        tip.style.left = `${slabRect.left + slabRect.width / 2}px`;
        tip.style.top = `${slabRect.top}px`;
        const rec = it.status ? 0 : it.reclaimLeft;
        tip.textContent = rec
          ? `${it.name} · ${fmt(it.current)} tokens · ${fmt(rec)} of it reclaimable`
          : `${it.name} · ${fmt(it.current)} tokens`;
      } else {
        tip.classList.remove("visible");
        tip.hidden = true;
      }
    } else {
      tip.classList.remove("visible");
      tip.hidden = true;
    }
  }

  function renderBreakdown() {
    const root = $("#breakdown");
    const left = document.createElement("div");
    left.className = "col";
    const right = document.createElement("div");
    right.className = "col";

    INITIAL.sections.forEach((sec) => {
      const total = sectionTotal(sec.id);
      const pct = Math.round((total / CAPACITY) * 100);
      const section = document.createElement("div");
      section.className = "section";
      section.dataset.section = sec.id;

      section.innerHTML = `
        <div class="section-head">
          <div class="section-title">
            <span class="section-icon" aria-hidden="true"><span></span><span></span></span>
            ${sec.title}
          </div>
          <div class="section-total">${fmt(total)}</div>
        </div>
        <p class="section-hint">${sec.hint} · ${pct}% of the window</p>
      `;

      sec.items.forEach((def) => {
        const it = state.items[def.id];
        const row = document.createElement("div");
        const interactive = !!(it.reclaimLeft || it.status);
        row.className = "row" + (interactive ? " interactive" : "") + (it.status ? " done" : "");
        row.dataset.id = it.id;
        if (state.hoverId === it.id) row.classList.add("hovered");

        const reclaimHtml =
          !it.status && it.reclaimLeft
            ? `<div class="row-reclaim">−${fmt(it.reclaimLeft)}</div>`
            : "";
        const statusHtml = it.status
          ? `<div class="row-status visible">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5.25" stroke="currentColor" stroke-width="1.2"/>
                <path d="M3.5 6.2l1.7 1.7 3.3-3.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${it.status}
            </div>`
          : `<div class="row-status"></div>`;

        row.innerHTML = `
          <div class="row-main">
            <div class="row-name">${it.name}</div>
            <div class="row-desc">${it.desc}</div>
          </div>
          <div class="row-nums">
            <div class="row-tokens">${fmt(it.current)}</div>
            ${reclaimHtml}
            ${statusHtml}
          </div>
        `;

        if (interactive) {
          row.addEventListener("mouseenter", () => setHover(it.id));
          row.addEventListener("mouseleave", () => setHover(null));
          row.addEventListener("click", () => {
            if (it.status || !it.reclaimLeft) {
              setHover(it.id);
              return;
            }
            reclaimItems([it.id]);
          });
        }

        section.appendChild(row);
      });

      (sec.col === "left" ? left : right).appendChild(section);
    });

    root.replaceChildren(left, right);
  }

  function renderHeader() {
    const c = carried();
    const room = roomLeft();
    const pct = pctFull();
    const rec = reclaimable();

    $("#carriedValue").textContent = fmt(c);
    $("#capacityValue").textContent = fmt(CAPACITY);
    $("#roomValue").textContent = fmt(room);
    $("#pctLabel").textContent = `${pct}% full`;
    $("#slabMeta").textContent = `${slabCount()} slabs · ${fmt(rec)} reclaimable`;
    $("#heldLabel").textContent = fmt(HELD);
    $("#headline").textContent = state.done ? INITIAL.doneHeadline : state.headline;
    $("#caption").textContent = state.done ? INITIAL.doneCaption : state.caption;

    const btn = $("#btnReclaim");
    const label = $("#reclaimLabel");
    if (state.done || rec === 0) {
      label.textContent = state.done ? "Reclaimed" : "Reclaim 0";
      btn.classList.toggle("done", state.done);
      btn.disabled = state.animating || rec === 0;
    } else {
      label.textContent = `Reclaim ${fmt(rec)}`;
      btn.classList.remove("done");
      btn.disabled = state.animating;
    }

    $("#btnReset").disabled = state.animating;
  }

  function render() {
    renderHeader();
    renderBar();
    renderBreakdown();
  }

  function setHover(id) {
    if (state.animating) return;
    state.hoverId = id;
    // Lightweight update: bar highlight + row hover + tip
    document.querySelectorAll(".slab.highlight").forEach((el) => el.classList.remove("highlight"));
    document.querySelectorAll(".row.hovered").forEach((el) => el.classList.remove("hovered"));
    if (id) {
      const slab = $(`.slab[data-id="${id}"]`);
      const row = $(`.row[data-id="${id}"]`);
      if (slab) slab.classList.add("highlight");
      if (row) row.classList.add("hovered");
    }
    // tip
    const tip = $("#hoverTip");
    const bar = $("#bar");
    if (id && state.items[id]) {
      const slab = bar.querySelector(`[data-id="${id}"]`);
      const it = state.items[id];
      if (slab) {
        const slabRect = slab.getBoundingClientRect();
        tip.hidden = false;
        tip.classList.add("visible");
        tip.style.left = `${slabRect.left + slabRect.width / 2}px`;
        tip.style.top = `${slabRect.top}px`;
        const rec = it.status ? 0 : it.reclaimLeft;
        tip.textContent = rec
          ? `${it.name} · ${fmt(it.current)} tokens · ${fmt(rec)} of it reclaimable`
          : `${it.name} · ${fmt(it.current)} tokens`;
      }
    } else {
      tip.classList.remove("visible");
      tip.hidden = true;
    }
  }

  /* —— Animation helpers —— */
  function animateNumber(from, to, duration, onUpdate) {
    return new Promise((resolve) => {
      const start = performance.now();
      const delta = to - from;
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        onUpdate(from + delta * eased);
        if (t < 1) requestAnimationFrame(frame);
        else {
          onUpdate(to);
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function reclaimAll() {
    const ids = INITIAL.barOrder.filter((id) => {
      const it = state.items[id];
      return it && it.reclaimLeft > 0 && !it.status;
    });
    return reclaimItems(ids);
  }

  async function reclaimItems(ids) {
    if (state.animating) return;
    const queue = ids
      .map((id) => state.items[id])
      .filter((it) => it && it.reclaimLeft > 0 && !it.status);

    if (!queue.length) return;

    state.animating = true;
    state.hoverId = null;
    $("#btnReclaim").disabled = true;
    $("#btnReset").disabled = true;

    for (const it of queue) {
      const slab = $(`.slab[data-id="${it.id}"]`);
      const row = $(`.row[data-id="${it.id}"]`);
      if (slab) slab.classList.add("reclaiming", "highlight");
      if (row) {
        row.classList.add("hovered", "flash");
        row.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }

      const fromTokens = it.current;
      const toTokens = it.tokens - it.reclaimLeft;
      const fromRec = reclaimable();
      const dropAmount = it.reclaimLeft;

      await animateNumber(fromTokens, toTokens, 380, (v) => {
        it.current = v;
        // live header + bar flex
        $("#carriedValue").textContent = fmt(carried());
        $("#roomValue").textContent = fmt(roomLeft());
        $("#pctLabel").textContent = `${pctFull()}% full`;
        const rem = fromRec - (fromTokens - v);
        $("#slabMeta").textContent = `${slabCount()} slabs · ${fmt(Math.max(0, rem))} reclaimable`;
        $("#reclaimLabel").textContent = `Reclaim ${fmt(Math.max(0, rem))}`;
        if (slab) slab.style.flexGrow = String(Math.max(v, 0.01));
        const freeEl = $(`.slab[data-id="__free"]`);
        if (freeEl) freeEl.style.flexGrow = String(freeTokens());
        const tokEl = row && row.querySelector(".row-tokens");
        if (tokEl) tokEl.textContent = fmt(v);
        const sec = INITIAL.sections.find((s) => s.id === it.sectionId);
        if (sec) {
          const totalEl = $(`.section[data-section="${sec.id}"] .section-total`);
          if (totalEl) totalEl.textContent = fmt(sectionTotal(sec.id));
          const hintEl = $(`.section[data-section="${sec.id}"] .section-hint`);
          if (hintEl) {
            const pct = Math.round((sectionTotal(sec.id) / CAPACITY) * 100);
            hintEl.textContent = `${sec.hint} · ${pct}% of the window`;
          }
        }
      });

      it.current = toTokens;
      it.reclaimLeft = 0;
      it.kind = "inplay";
      it.status = it.action || "dropped";

      // Update row status without full re-render mid-loop for smoothness
      if (row) {
        const reclaimEl = row.querySelector(".row-reclaim");
        if (reclaimEl) reclaimEl.remove();
        let statusEl = row.querySelector(".row-status");
        if (!statusEl) {
          statusEl = document.createElement("div");
          statusEl.className = "row-status";
          row.querySelector(".row-nums").appendChild(statusEl);
        }
        statusEl.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="5.25" stroke="currentColor" stroke-width="1.2"/>
            <path d="M3.5 6.2l1.7 1.7 3.3-3.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          ${it.status}
        `;
        // force reflow then show
        void statusEl.offsetWidth;
        statusEl.classList.add("visible");
        row.classList.add("done");
        row.classList.remove("flash");
      }

      if (slab) {
        slab.classList.remove("landed");
        slab.classList.add("inplay");
        if (toTokens <= 0) {
          slab.style.flexGrow = "0";
          slab.style.opacity = "0";
          await sleep(120);
          slab.remove();
        } else {
          slab.classList.remove("reclaiming", "highlight");
        }
      }

      // Ensure free slab exists / grows
      let freeEl = $(`.slab[data-id="__free"]`);
      const bar = $("#bar");
      if (!freeEl && freeTokens() > 0) {
        freeEl = document.createElement("div");
        freeEl.className = "slab free";
        freeEl.dataset.id = "__free";
        freeEl.style.flexBasis = "0";
        const held = $(`.slab[data-id="__held"]`);
        bar.insertBefore(freeEl, held);
      }
      if (freeEl) freeEl.style.flexGrow = String(freeTokens());

      await sleep(90);
    }

    state.done = reclaimable() === 0;
    state.animating = false;
    state.headline = INITIAL.doneHeadline;
    // Snap exact final values
    allItems().forEach((it) => {
      if (it.status) {
        it.current = it.tokens - (it.reclaim || 0);
        it.reclaimLeft = 0;
        it.kind = "inplay";
      }
    });
    render();
  }

  function reset() {
    if (state.animating) return;
    state = cloneState();
    render();
  }

  /* —— Wire up —— */
  $("#btnReclaim").addEventListener("click", reclaimAll);
  $("#btnReset").addEventListener("click", reset);

  document.addEventListener("keydown", (e) => {
    if (e.target.matches("input, textarea, select")) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      reclaimAll();
    } else if (e.key === "r" || e.key === "R") {
      e.preventDefault();
      reset();
    } else if (e.key === "Escape") {
      setHover(null);
    }
  });

  // Initial paint
  render();

  // Screenshot / deep-link helpers: ?shot=after applies reclaim instantly
  const params = new URLSearchParams(location.search);
  if (params.get("shot") === "after") {
    INITIAL.barOrder.forEach((id) => {
      const it = state.items[id];
      if (it.reclaimLeft > 0) {
        it.current = it.tokens - it.reclaimLeft;
        it.reclaimLeft = 0;
        it.kind = "inplay";
        it.status = it.action || "dropped";
      }
    });
    state.done = true;
    render();
  }

  // Expose for screenshot / debug
  window.__cw = { reset, reclaimAll, getState: () => state, CAPACITY, HELD };
})();
