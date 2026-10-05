# reflow — Forced reflow / layout thrashing

```yaml
id: reflow
status: filled
owner: front
pass_bar: No forced reflows longer than ~30ms; avoid write→read thrashing
```

### Ownership

- **Front only.**
- **Server:** N/A.

### Stop here

Stop when your code no longer write→reads layout in one task and remaining reflow is inside **browser or third-party** stacks. Do not rewrite a library’s internals unless you can fork/replace it.

### What to check

- Insight **Forced reflow**; geometry reads after invalidation.
- Loops alternating write/read; measure-in-`onMounted` patterns.

### How to fix

1. Batch writes then reads (or reads then writes).
2. Defer reads to rAF / double-rAF.
3. Prefer `ResizeObserver` `contentRect` over `offsetWidth`.
4. Skip work offscreen / on small breakpoints.

### Hint / example (optional)

- Batch geometry reads for expand/collapse and journey/step UIs; device/breakpoint plugins via double-rAF.
- **Framework runtime:** PSI Forced reflow ~30 ms in a hashed bundle that only re-exports the framework runtime — at pass-bar (~30 ms). **Stop** chasing app patches when source is framework runtime.
- **`[unattributed]`** (large ms): Chrome could not map the layout to a script URL/stack (browser internals, hydration layout of a large DOM, cross-origin analytics, or lost stacks in minified bundles). App geometry batching already applied does **not** make this insight vanish. **Stop** inventing more `offsetWidth` patches without a DevTools Performance stack that points at app source. Re-check only if PSI shows a concrete app/bundle URL above ~30 ms.
- **DevTools stack triage:** Top call may be a **marquee** reading `clientWidth` (often ~1 ms). Entry viewport checks (`getBoundingClientRect` for lazy/viewport hydration) are framework lazy hydration. `getDomDetections @ content.js` = **browser extension** (form fillers, translators, etc.) — re-record in Incognito.
- **Incognito (clean):** Top often = navbar `scrollY` → class toggle, plus framework viewport/lazy hydration. Recalc cost scales with DOM size × sync geometry after hydration dirties styles. Fix: double-rAF before first `scrollY` + skip no-op class writes. Remaining viewport-hydration cost is framework lazy — **stop** unless removing that strategy (tradeoff vs JS weight).

### References

- https://developer.chrome.com/docs/performance/insights/forced-reflow
- https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing
