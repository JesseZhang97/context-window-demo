(() => {
  "use strict";

  const CAPACITY = 200_000;
  const HELD = 8_192;

  let lang = localStorage.getItem("cw-lang") === "zh" ? "zh" : "en";

  const I18N = {
    en: {
      title: "Context window",
      pctFull: (n) => `${n}% full`,
      headline: "Over half of this window is work that already landed",
      doneHeadline: "Every token left in here is work still in play",
      caption: "Worth reading once — charged again every turn since",
      doneCaption: "Old copies, unread output, and turns collapsed to summaries",
      carried: "Carried",
      of: "of",
      room: "Room left",
      roomSub: "for the next message",
      inplay: "In play",
      landed: "Already landed",
      free: "Free",
      held: "Held for the reply",
      ofWindow: (pct) => `${pct}% of the window`,
      slabMeta: (slabs, rec) => `${slabs} slabs · ${rec} reclaimable`,
      reclaim: (n) => `Reclaim ${n}`,
      reclaimZero: "Reclaim 0",
      reclaimed: "Reclaimed",
      reset: "Reset",
      toggle: "中文",
      tipRec: (name, cur, rec) => `${name} · ${cur} tokens · ${rec} of it reclaimable`,
      tipPlain: (name, cur) => `${name} · ${cur} tokens`,
      freeTip: (n) => `Free · ${n} tokens`,
      heldTip: (n) => `Held for the reply · ${n} tokens`,
      dropped: "dropped",
      summarised: "summarised",
      sections: {
        preamble: { title: "Preamble", hint: "Cannot go" },
        files: { title: "Files read", hint: "Drop superseded copies" },
        toolsOut: { title: "Tool output", hint: "Drop what nothing read" },
        convo: { title: "Conversation", hint: "Collapse to a summary" },
      },
      items: {
        sys: { name: "System prompt", desc: "one file, sent every turn" },
        tools: { name: "Tool schemas", desc: "14 tools, whether called or not" },
        proj: { name: "Project instructions", desc: "AGENTS.md and two nested" },
        mem: { name: "Recalled memory", desc: "8 of 23 files matched" },
        machine: { name: "machine.ts", desc: "effort-warning · read 4 times, once per edit" },
        globals: { name: "globals.css", desc: "app · read twice, 25 kB each time" },
        card: { name: "card.tsx", desc: "effort-warning · read 3 times, 2 superseded" },
        slider: { name: "slider.tsx", desc: "effort-warning · read twice over the pointer fix" },
        five: { name: "Five more files", desc: "flame, roll, swarm, svg, run — once each" },
        npm: { name: "npm run build", desc: "3 runs, the 2 failures long since fixed" },
        grep: { name: "grep -rn effort src", desc: "312 matches, 3 of them were read" },
        shots: { name: "Screenshots of the card", desc: "3 images at 1,540 each, 2 now out of date" },
        devlog: { name: "Dev server log", desc: "2 tails, neither had the error in it" },
        t1: { name: "Turns 1 – 9", desc: "the heat model, shipped" },
        t2: { name: "Turns 10 – 21", desc: "pointer capture on the slider, fixed" },
        t3: { name: "Turns 22 – 34", desc: "the swarm and the flame, still open" },
        t4: { name: "Turns 35 – 38", desc: "the warning card, in progress" },
      },
    },
    zh: {
      title: "上下文窗口",
      pctFull: (n) => `${n}% 已满`,
      headline: "超过一半的窗口，是已经落地的工作",
      doneHeadline: "剩下的每个 token，都还在进行中",
      caption: "每一份拷贝都值得读一次，但之后每一轮都会再计费",
      doneCaption: "过时副本、未读工具输出、旧轮次已收成摘要",
      carried: "已占用",
      of: "/",
      room: "剩余空间",
      roomSub: "留给下一条消息",
      inplay: "进行中",
      landed: "已落地",
      free: "空闲",
      held: "为回复预留",
      ofWindow: (pct) => `占窗口 ${pct}%`,
      slabMeta: (slabs, rec) => `${slabs} 个片段 · 可回收 ${rec}`,
      reclaim: (n) => `回收 ${n}`,
      reclaimZero: "回收 0",
      reclaimed: "已回收",
      reset: "重置",
      toggle: "EN",
      tipRec: (name, cur, rec) => `${name} · ${cur} token · 其中可回收 ${rec}`,
      tipPlain: (name, cur) => `${name} · ${cur} token`,
      freeTip: (n) => `空闲 · ${n} token`,
      heldTip: (n) => `为回复预留 · ${n} token`,
      dropped: "已丢弃",
      summarised: "已摘要",
      sections: {
        preamble: { title: "前导上下文", hint: "无法剔除" },
        files: { title: "已读文件", hint: "丢掉被覆盖的副本" },
        toolsOut: { title: "工具输出", hint: "丢掉未读过的输出" },
        convo: { title: "对话", hint: "收成摘要" },
      },
      items: {
        sys: { name: "系统提示", desc: "一个文件，每轮都会发送" },
        tools: { name: "工具 Schema", desc: "14 个工具，无论是否调用" },
        proj: { name: "项目说明", desc: "AGENTS.md 与两个嵌套文件" },
        mem: { name: "召回记忆", desc: "23 个文件中匹配到 8 个" },
        machine: { name: "machine.ts", desc: "effort-warning · 读了 4 次，每次编辑一次" },
        globals: { name: "globals.css", desc: "app · 读了两次，每次约 25 kB" },
        card: { name: "card.tsx", desc: "effort-warning · 读了 3 次，2 份已过时" },
        slider: { name: "slider.tsx", desc: "effort-warning · 指针修复期间读了两次" },
        five: { name: "另外五个文件", desc: "flame、roll、swarm、svg、run — 各一次" },
        npm: { name: "npm run build", desc: "跑了 3 次，2 次失败早已修好" },
        grep: { name: "grep -rn effort src", desc: "312 条匹配，只读了 3 条" },
        shots: { name: "卡片截图", desc: "3 张图各 1,540，2 张已过时" },
        devlog: { name: "开发服务器日志", desc: "2 段尾部，都没找到报错" },
        t1: { name: "第 1 – 9 轮", desc: "热力模型，已交付" },
        t2: { name: "第 10 – 21 轮", desc: "滑块指针捕获，已修好" },
        t3: { name: "第 22 – 34 轮", desc: "swarm 与 flame，仍在进行" },
        t4: { name: "第 35 – 38 轮", desc: "警告卡片，进行中" },
      },
    },
  };

  function L() {
    return I18N[lang];
  }

  function itemCopy(id) {
    return L().items[id] || { name: id, desc: "" };
  }

  function sectionCopy(id) {
    return L().sections[id] || { title: id, hint: "" };
  }

  function statusLabel(status) {
    if (status === "dropped") return L().dropped;
    if (status === "summarised") return L().summarised;
    return status || "";
  }

  function applyChrome() {
    const t = L();
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = t.title;
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    set("titleText", t.title);
    set("labelCarried", t.carried);
    set("labelOf", t.of);
    set("labelRoom", t.room);
    set("labelRoomSub", t.roomSub);
    set("legInplay", t.inplay);
    set("legLanded", t.landed);
    set("legFree", t.free);
    set("legHeld", t.held);
    set("labelReset", t.reset);
    const btn = document.getElementById("btnLang");
    if (btn) btn.textContent = t.toggle;
  }

  function setLang(next) {
    lang = next === "zh" ? "zh" : "en";
    localStorage.setItem("cw-lang", lang);
    applyChrome();
    render();
  }


  /** Initial dataset matching the source video frames */
  const INITIAL = {
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
      const copy = itemCopy(id);
      el.title = L().tipPlain(copy.name, fmt(it.current));

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
      el.title = L().freeTip(fmt(free));
      frag.appendChild(el);
    }

    // Held
    const held = document.createElement("div");
    held.className = "slab held";
    held.dataset.id = "__held";
    held.style.flexGrow = String(HELD);
    held.style.flexBasis = "0";
    held.title = L().heldTip(fmt(HELD));
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
        const copy = itemCopy(state.hoverId);
        tip.textContent = rec
          ? L().tipRec(copy.name, fmt(it.current), fmt(rec))
          : L().tipPlain(copy.name, fmt(it.current));
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

      const sc = sectionCopy(sec.id);
      section.innerHTML = `
        <div class="section-head">
          <div class="section-title">
            <span class="section-icon" aria-hidden="true"><span></span><span></span></span>
            ${sc.title}
          </div>
          <div class="section-total">${fmt(total)}</div>
        </div>
        <p class="section-hint">${sc.hint} · ${L().ofWindow(pct)}</p>
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
              ${statusLabel(it.status)}
            </div>`
          : `<div class="row-status"></div>`;

        const ic = itemCopy(it.id);
        row.innerHTML = `
          <div class="row-main">
            <div class="row-name">${ic.name}</div>
            <div class="row-desc">${ic.desc}</div>
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
    $("#pctLabel").textContent = L().pctFull(pct);
    $("#slabMeta").textContent = L().slabMeta(slabCount(), fmt(rec));
    $("#heldLabel").textContent = fmt(HELD);
    $("#headline").textContent = state.done ? L().doneHeadline : L().headline;
    $("#caption").textContent = state.done ? L().doneCaption : L().caption;

    const btn = $("#btnReclaim");
    const label = $("#reclaimLabel");
    if (state.done || rec === 0) {
      label.textContent = state.done ? L().reclaimed : L().reclaimZero;
      btn.classList.toggle("done", state.done);
      btn.disabled = state.animating || rec === 0;
    } else {
      label.textContent = L().reclaim(fmt(rec));
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
        const copy = itemCopy(id);
        tip.textContent = rec
          ? L().tipRec(copy.name, fmt(it.current), fmt(rec))
          : L().tipPlain(copy.name, fmt(it.current));
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
        $("#pctLabel").textContent = L().pctFull(pctFull());
        const rem = fromRec - (fromTokens - v);
        $("#slabMeta").textContent = L().slabMeta(slabCount(), fmt(Math.max(0, rem)));
        $("#reclaimLabel").textContent = L().reclaim(fmt(Math.max(0, rem)));
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
            const sc = sectionCopy(sec.id);
            hintEl.textContent = `${sc.hint} · ${L().ofWindow(pct)}`;
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
          ${statusLabel(it.status)}
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
    // done flag drives L().doneHeadline in renderHeader
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
  $("#btnLang").addEventListener("click", () => setLang(lang === "zh" ? "en" : "zh"));

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
  applyChrome();
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
