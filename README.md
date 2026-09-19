**Live:** https://jessezhang97.github.io/context-window-demo/

# Context window demo

Interactive single-page recreation of the X video **“Context window”** by [@iszafar92](https://x.com/iszafar92) (status `2101011832576115024`).

## Open

No build step. From this folder:

```bash
# Option A — open the file directly
xdg-open index.html   # or double-click index.html

# Option B — local server
python3 -m http.server 8765
# then visit http://localhost:8765/
```

## Interact

- **Hover** a reclaimable row (or its slab on the bar) to highlight the matching segment and see a tooltip.
- **Click a row** to reclaim that slab alone (dropped / summarised).
- **Reclaim** — click the primary button (or press `Enter` / `Space`) to reclaim every remaining slab in sequence.
- **Reset** — click Reset (or press `R`) to restore the initial ~95% full state.

## Files

| File | Role |
|------|------|
| `index.html` | Markup |
| `styles.css` | Dark-elegant light-gray card UI |
| `app.js` | State, bar, hover, reclaim animation, reset |
| `shot-before.png` / `shot-after.png` | Acceptance screenshots |

## Expected numbers

| | Before | After |
|--|--------|-------|
| Full | 95% | 43% |
| Carried | 190,121 / 200,000 | 86,013 / 200,000 |
| Room left | 1,687 | 105,795 |
| Reclaimable | 104,108 | 0 |
