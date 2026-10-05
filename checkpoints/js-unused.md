# js-unused — Unused JavaScript

```yaml
id: js-unused
status: filled
owner: front
pass_bar: Shrink transferred JS that never executes on the audited route; defer non-critical modules until idle/interaction/viewport
```

### Ownership

- **Front only** (bundler, dynamic import, route splits).
- **Server:** HTTP cache helps repeat views (`cache`) but does not fix unused bytes on first load.

### Stop here

Stop when remaining unused % is **framework/runtime shared chunks** required for hydration, or code used only on other breakpoints/states the lab run did not hit. Do not delete Vue/React runtime to chase the audit.

### What to check

- **Reduce unused JavaScript**; map hashes → source via strings/treemap.
- Eager plugins; Lazy components still prefetched; always-mounted modals.

### How to fix

1. Thin plugins + dynamic `import()` after idle/interaction.
2. Mount heavy UI only with conditional render / dynamic import (e.g. `v-if`, lazy route component).
3. Route-level code splitting; avoid sync icon barrels / form validators in layout entry.

### Hint / example (optional)

- **Chat / agent / analytics widgets** off the entry; newsletter / contact forms via a **two-level** lazy gate + conditional mount (keeps validators like vee-validate / Zod / Yup / Valibot / react-hook-form off pages that do not need them); heavy modals only when opened.
- **Entry unused + heavy chunk:** PSI unused JS often lists the entry (~framework / i18n / client-store residual — **stop**, don’t delete runtime) plus a smaller chunk that is a **form validator** pulled by sync imports in a footer/layout. Fix: extract the form into its own island + **interaction** gate (not viewport/lazy hydration — desktop lab scroll still loads it). Drop cascading `modulepreload` so **carousel / slider** JS (Splide, Swiper, Embla, Keen, Glide, Slick, …) is fetched only when that island needs it.
- **Cascading modulepreload / prefetch:** Live HTML with dozens of `modulepreload`s (carousel + marquee + UI kit) and leftover validator chunks. Common causes: (1) async component declared on the **page** keeps the library on the page async-dep list → SSR modulepreload; (2) link **visibility prefetch** pulls auth/form routes; (3) widgets armed on **`scroll` / `touchstart`** so lab scroll downloads agent/widget JS mid-audit; (4) toast library sync-imported into the app entry. Fix: true lazy island for marquees, disable link visibility prefetch, idle/pointer-only boots, dynamic toaster, carousel CSS co-located with the island + lazy (not global CSS). Residual entry unused % = framework — **stop**.
- **Prod residual:** After deploy, unused JS that is **only** the entry (framework + i18n + store strings) — **stop**. Main-thread under Lighthouse’s ~4s fail bar is acceptable; Style & Layout that tracks inlined CSS / DOM belongs to `css-unused` / `dom-size`, not more JS deletion.

### References

- https://web.dev/articles/reduce-unused-javascript
- https://developer.chrome.com/docs/lighthouse/performance/unused-javascript
