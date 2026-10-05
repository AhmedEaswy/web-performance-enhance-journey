# main-thread — Minimize main-thread work / long tasks

```yaml
id: main-thread
status: filled
owner: front
pass_bar: Avoid long tasks (>50ms) during load; break up or defer parse/eval of large JS
```

### Ownership

- **Front.**
- **Server:** smaller HTML helps parse a bit; not the main lever.

### Stop here

Stop when long tasks left are **browser unattributable** work after you’ve cut your JS, or third-party scripts. Overlaps `js-unused` / `cwv-inp` — don’t duplicate effort.

### What to check

- **Avoid long main-thread tasks**; fat hashed bundles right after download.

### How to fix

1. Same as `js-unused`: dynamic import, idle deferral, conditional mount gates.
2. Yield between heavy chunks.
3. Lighter hydration above the fold.
4. If **Style & Layout** is high: shrink DOM (`dom-size`), simplify selectors (`css-selector`), and reduce inlined CSS head bloat (`css-js-block` / inlined critical CSS).

### Hint / example (optional)

- PSI: high Script Evaluation + Unattributable on a fat entry (agent/widget + carousel + icon-barrel strings). Defer agent tooling; avoid **global** carousel/slider; keep newsletter / form validation off the home graph.
- “Other” / Style & Layout often tracks huge inlined CSS + large DOM, not just JS.
- **Desktop worse than mobile:** wide viewport + cascading `modulepreload` runs carousel/slider eval and lazy islands early; hero typewriter / timer churn on mount. Fix: clear unnecessary page async deps + disable aggressive prefetch; typewriter start deferred until idle; marquees behind in-view once; footer/contact form behind **interaction** gate (not viewport/lazy hydration). Residual Style & Layout from large inlined CSS — see `css-unused` / critical-CSS strategy.
- **Modulepreload + scroll-armed widgets:** Lab still shows high Script Evaluation with carousel + entry eval while live HTML lists carousel/marquee in `modulepreload`; widgets armed on **scroll** fire during PSI scroll. Fix: remove scroll/touchstart arms (idle + pointer/keydown only); extract marquee into its own lazy island; bundler modulepreload resolve → CSS-only when possible; disable link visibility prefetch; defer toast libraries. Accept residual framework parse/eval on entry (`js-unused` stop).
- **Under fail bar:** Script Evaluation + Other + Style & Layout with entry unused = framework — **stop**. Re-cut scroll-armed boots, cascading modulepreload, toast sync import (see `js-unused`). Do not chase Style & Layout without shrinking inlined CSS / DOM.
- **Localhost inflated:** Lighthouse [main-thread](https://developer.chrome.com/docs/lighthouse/performance/mainthread-work-breakdown/) warns >4s / [bootup-time](https://developer.chrome.com/docs/lighthouse/performance/bootup-time/) fails >3.5s. Local preview often inflates Other + Style (hydration × large DOM / inlined CSS). Do not treat `localhost` as prod. Remaining app-side: marquee + typewriter (`js-unused`). Residual entry eval + Unattributable — **stop**.

### References

- https://web.dev/articles/optimize-long-tasks
- https://developer.chrome.com/docs/lighthouse/performance/long-tasks
