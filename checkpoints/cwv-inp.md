# cwv-inp — Interaction to Next Paint (INP) / INP breakdown

```yaml
id: cwv-inp
status: filled
owner: front
pass_bar: INP ≤ 200ms (good); ≤ 500ms needs improvement; > 500ms poor
```

### Ownership

- **Front:** main-thread JS, handlers, yielding, DOM size, presentation work.
- **Server:** only if interaction waits on a blocking API round-trip before paint — then cache/speed the API; still keep UI optimistic on front.

### Stop here

Stop when the slow phase is **inside a third-party iframe/script you cannot change**, or when field INP is driven by **low-end device + unavoidable heavy editor/canvas** after you already yield and virtualize. Record residual; do not micro-optimize 5ms handler leftovers while a 200ms third-party owns the interaction.

Lab INP needs a recorded interaction — no interaction in the trace ⇒ insight is informational only.

### What to check

- Insight **INP breakdown**: input delay, processing duration, presentation delay.
- High **input delay** → other main-thread work (`main-thread`, `js-unused`).
- High **processing** → heavy event handlers.
- High **presentation** → large DOM / style / layout (`dom-size`, `css-selector`, `reflow`).
- Reproduce with CPU throttle; prefer field/RUM for which interaction.

### How to fix

1. **Input delay:** less JS at load; break long tasks; defer non-critical work.
2. **Processing:** do minimal work for next paint; defer the rest (`rAF` + `setTimeout` / `scheduler.yield`).
3. **Presentation:** smaller DOM, `content-visibility` for offscreen, avoid huge client HTML renders; fix layout thrashing (`reflow`).
4. Avoid sync layout reads after writes in handlers.

### Hint / example (optional)

- Rich input: update text immediately; defer word-count / spellcheck / save to next task.
- Same culprits as unused JS + long tasks on first interaction during load.

### References

- https://developer.chrome.com/docs/performance/insights/inp-breakdown
- https://web.dev/articles/optimize-inp
