# PageSpeed checkpoints

Each checkpoint uses the same shape:

```yaml
id: ...
status: filled | stub
owner: front | server | both | devtools-only
pass_bar: ...
```

Sections in every filled body:

- **Ownership** — what the app repo can change vs server/CDN/ops
- **Stop here** — when further app work will not move the metric; escalate or accept residual
- **What to check / How to fix / Hint / References**

Fill stubs only when the user asks after a real fix. Update **Hint** with **category patterns** (symptom → cause class → fix class → stop). Do **not** name products, routes, component files, brand colors, hashed bundles, or asset filenames. Library / platform names only as category members. Prefer stack-neutral wording; framework or host APIs as optional examples. Keep **front and server** fix guidance equally concrete when both apply — this playbook is for front-end, backend, and full-stack users. Never recommend a fix that changes product logic, UX contracts, security, or business results just to raise a lab score; prefer defer/split/headers/discovery over delete or degrade.

Chrome insights hub: https://developer.chrome.com/docs/performance/insights/

---

## cwv-cls — Cumulative Layout Shift (CLS) / layout shift culprits

```yaml
id: cwv-cls
status: filled
owner: front
pass_bar: CLS ≤ 0.1 (good); > 0.25 is poor
```

### Ownership

- **Front:** images dimensions, skeletons, reserved space, fonts metrics, motion, inject timing.
- **Server:** almost never — unless SSR HTML omits attrs the front cannot control (rare).

### Stop here

Stop when reserved boxes match final content, LCP/fonts are stable, and remaining CLS is from **third-party iframes/ads you do not control**, or shifts with `hadRecentInput` (user-expected). Escalate third-party CLS to the vendor or remove the embed.

### What to check

- Insight **Layout shift culprits** / lab or field CLS ≥ 0.1.
- Listed nodes are often **victims**; find what above them grew or appeared.
- Images missing or mismatched `width`/`height` vs CSS (`w-auto` + fixed `h-*`).
- Skeleton / client-only placeholder height ≠ hydrated content.
- Late-injected blocks with no reserved space.
- `font-display: swap` text reflow without metric overrides.
- Animations on layout props (`top`/`width`/`height`/`margin`) instead of `transform`/`opacity`.

### How to fix

1. Images: HTML `width`/`height` = rendered size, or `aspect-ratio` + explicit width/height.
2. Skeletons match real breakpoint boxes (`pattern-skeleton`).
3. Reserve `min-height` / aspect before data/hydration (`pattern-inject`).
4. Animate only compositor props (`pattern-motion`).
5. Fonts: preload + `size-adjust` / ascent overrides if FOUT remains (`fonts`).

### Hint / example (optional)

- Intrinsic SVG/logo size disagrees with CSS display size → reserve the **display** box (width × height or aspect-ratio).
- Skeleton height taller/shorter than real content → section below shifts (`pattern-skeleton`).
- Media without a locked aspect → wrap in `aspect-ratio` (or width/height attrs).
- **Decorative SVG blur:** CLS lists an inline SVG (or its parent section) even when `min-height` is reserved. Cause: huge `feGaussianBlur` / filter paint on a full-width absolute layer. Fix: drop the SVG; use CSS radial blobs on a **fixed-height** frame with `contain: strict` (or `contain: layout`).
- **Hydrate mid-scroll:** Lab scroll + viewport/lazy hydration hydrates a large mid-page block mid-audit → layout settles in steps. Cards with `height: auto` grow after wrap/font-swap; marquees without a locked row height shove the section below. Fix: eager that block (or lock its height), fixed card heights + line-clamp, locked marquee row height, font metric overrides (`fonts`). Do **not** use viewport/lazy hydration on large mid-page blocks the lab scrolls into (e.g. hydrate-on-visible).
- **Victim section:** Insight still blames a mid-page section while roots sit above it — hero typewriter / animated line with `min-height: fit-content` grows on wrap; lazy slot with no reserved box; parent `min-height` smaller than measured mobile content. Fix: fixed hero line height + `overflow: hidden` (drop fit-content min-height), reserve lazy wrappers only when SSR-known, raise slot `min-height` to measured content, `contain: layout` on section/slot.
- **Under pass bar (CLS ≤ 0.1):** Insight may still list a section as victim — **stop** unless field/lab CLS rises above 0.1 again.

### References

- https://web.dev/articles/optimize-cls
- https://web.dev/articles/cls
- https://developer.chrome.com/docs/performance/insights/layout-shift-culprits

---

## cwv-lcp — Largest Contentful Paint (LCP) / LCP breakdown

```yaml
id: cwv-lcp
status: filled
owner: both
pass_bar: LCP ≤ 2.5s; prefer most time in TTFB + download, not resource load delay / render delay
```

### Ownership

- **Front:** element discovery, preload, `fetchpriority`, no lazy LCP, mobile-first `src`, early DOM placement (`lcp-discovery`, `pattern-hero`).
- **Server:** TTFB, redirects, HTML compression, CDN edge cache for document (`ttfb`).

### Stop here

Stop app tweaks when LCP URL is discoverable + high-priority + correctly sized **and** remaining time is **TTFB / redirect / CDN miss** or pure network RTT. Escalate to hosting/CDN. Do not keep compressing a 5 KiB hero if delay is 1s+ discovery (fix discovery instead).

### What to check

- **LCP breakdown**: TTFB, resource load delay, load duration, element render delay.
- Which element is LCP.
- High **resource load delay** = late discovery/priority (not compression).
- `<picture>` desktop URL on `img src` while mobile LCP is a `<source>`.
- LCP buried late in DOM; missing preload; `loading="lazy"`; gated on JS.

### How to fix

1. Put LCP media early in HTML.
2. Mobile-first: `img src` = mobile file; desktop via `source media="(min-width: …)"`.
3. Preload exact URL with `as="image"`, `fetchpriority="high"`, matching `media`.
4. If `<head>` inlines a huge CSS blob before any preload tag, also send **HTTP `Link: rel=preload`** on the document response so the fetch starts with response headers (before the body is parsed).
5. `fetchpriority="high"` on img; never lazy LCP.
6. If **load duration** high → `img-delivery` / `img-encode`. If **TTFB** high → `ttfb`.

### Hint / example (optional)

- TTFB low, **load delay high** on a **tiny** hero → discovery, not compression. Large inlined CSS before the HTML preload delays discovery.
- Fix: HTTP `Link` header preloads the mobile/desktop LCP URL **in addition to** any framework head `<link rel=preload>`.
- **Preload buried after CSS:** Hundreds of KiB of `<style>` before the head preload; a single mega `Link` line (LCP + unrelated catalogs) still fails to cut lab delay. Fix: (1) dedicated short `Link` for LCP only (other rels in a second `Link`); (2) server render hook injects `<link rel=preload>` **immediately after `<head>`** before the inline CSS blob. Stop app tweaks when delay drops and remaining is TTFB/network.
- **fetchpriority on the wrong request:** Insight can still fail `fetchpriority=high should be applied to the image preload request` while the `<img>` is already `fetchpriority="high"`. Cause: HTTP `Link` preload (the request that actually starts) omitted `fetchpriority`. Put `fetchpriority=high` on the `Link` header as well as the HTML `<link>`.

### References

- https://web.dev/articles/optimize-lcp
- https://developer.chrome.com/docs/performance/insights/lcp-breakdown

---

## lcp-discovery — LCP request discovery

```yaml
id: lcp-discovery
status: filled
owner: front
pass_bar: LCP image discoverable from HTML (or preload); fetchpriority=high; not lazy-loaded
```

### Ownership

- **Front only:** markup, preload tags, lazy attributes.
- **Server:** only if HTML is assembled server-side without the image tag (SSR bug) — still fix in templates.

### Stop here

Stop when HTML/preload already expose the LCP URL with high priority and no lazy. Remaining delay is TTFB/network (`ttfb`) or third-party host latency (`third-party` / same-origin image optimizer).

### What to check

- Chrome insight **LCP request discovery**.
- Image not in initial HTML and not preloaded.
- Missing `fetchpriority=high` on img **and** the **preload that starts the fetch** (HTML `<link>` and/or HTTP `Link`). PSI can pass the `<img>` and still fail if the earlier `Link` header omitted it.
- `loading=lazy` on LCP.

### How to fix

1. Put LCP `<img>` in SSR HTML or preload it.
2. `fetchpriority="high"` on img **and** every LCP preload (HTML + HTTP `Link`). The request that starts first is the one the insight scores.
3. Remove `loading="lazy"` from LCP.
4. Prefer same-origin optimized URL (IPX, next/image CDN, or equivalent) over late-discovered cross-origin.

### References

- https://developer.chrome.com/docs/performance/insights/lcp-discovery

---

## cwv-inp — Interaction to Next Paint (INP) / INP breakdown

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

---

## img-size — Unsized images / width & height / aspect-ratio

```yaml
id: img-size
status: filled
owner: front
pass_bar: All content images reserve space (attrs or CSS aspect-ratio); CLS contribution from images ≈ 0
```

### Ownership

- **Front:** every `<img>` / framework image component / video poster dimensions.
- **Server:** image CDN that strips dimensions from HTML — fix template, not CDN.

### Stop here

Stop when all above-fold and layout-affecting images have stable boxes. Do not chase decorative CSS `background-image` (no width/height attrs) if the box is already sized by CSS. Overlaps `cwv-cls`; if CLS is good, this audit is done.

### What to check

- Missing `width`/`height` or conflicting utility classes.
- Lazy galleries with 0×0 intrinsic → browser thinks all fit in viewport and loads everything.

### How to fix

1. Set width/height matching display aspect (or `aspect-ratio` + one axis).
2. Keep lazy + dimensions together (`img-lazy`).
3. Prefer framework image components (`NuxtImg`, `next/image`, etc.) that emit width/height.

### References

- https://web.dev/articles/optimize-cls#images-without-dimensions
- Overlaps: `cwv-cls`, `img-lazy`

---

## img-delivery — Improve image delivery

```yaml
id: img-delivery
status: filled
owner: both
pass_bar: Serve display-sized (or 1–2× DPR) images in modern formats; ignore findings with < ~4 KiB estimated savings
```

### Ownership

- **Front:** `srcset`/`sizes`, WebP/AVIF, quality, variants, framework image component / optimizer.
- **Server/CDN:** image CDN transforms, origin storage formats, allowlist domains for the optimizer.

### Stop here

Stop when images are already modern format + roughly display-sized and remaining PSI savings are **&lt; 4 KiB** (Chrome ignores those) or quality cannot drop without product sign-off. Hero LCP delay that is discovery — switch to `cwv-lcp`, not more compression.

### What to check

- Insight **Improve image delivery** (URL, size, est. savings).
- Intrinsic ≫ CSS display size.
- PNG/JPEG where WebP/AVIF fits; animated GIF vs video.
- Raw object-storage URLs bypassing the site’s image optimizer.

### How to fix

1. Export ~1×–2× display size; separate mobile/desktop files.
2. Prefer AVIF/WebP; GIF → video for animation.
3. Tunable quality (~55–70 for cards; drop when PSI “increase compression” is only a few KiB over the ignore floor).
4. Allowlist hosts + serve via optimizer (`cache`, `third-party`).

### Hint / example (optional)

- Multi-megabyte PNG/JPEG backgrounds → WebP/AVIF `<picture>` with small + full variants; decorative characters/favicons at ~display width; card images via optimizer with quality/sizes.
- **Soft glows + thin geometry (SVG):** lossy WebP bands look “broken.” Serve the source SVG (e.g. CSS `background-image`). Accept transfer size over ugly encode; PSI image-delivery residual OK.
- **Alpha-expensive glow rasters:** ~100 KiB WebP with PSI “increase compression” often means a fully semi-transparent soft glow. Flatten onto the **real page background color**, then opaque WebP (often ~few KiB). Do not chase further quality knobs on the alpha masters.
- **Already optimized cards:** display-sized WebP via optimizer + 2× still may show ~5 KiB “increase compression” at q≈70. Drop quality (~55). **Stop** when residual &lt; ~4 KiB.

### References

- https://developer.chrome.com/docs/performance/insights/image-delivery
- https://web.dev/articles/use-images-webp

---

## img-encode — Efficiently encode / compress images

```yaml
id: img-encode
status: filled
owner: both
pass_bar: Same as img-delivery for compression factor; no oversized lossless where lossy is acceptable
```

### Ownership

- **Front:** build scripts (Squoosh/ImageMagick), framework image optimizer `quality`/`format`.
- **Server:** CDN compression policies, master asset pipeline in CMS/storage.

### Stop here

Stop when further quality reduction is a **design/brand decision**, or assets are already AVIF/WebP at sensible quality. Encoding alone will not fix LCP **resource load delay**.

### What to check

- Overlap with **Improve image delivery** “increase compression factor.”
- Huge PNG icons; unoptimized uploads from CMS.

### How to fix

1. Re-encode with ImageOptim / Squoosh / imagemin / optimizer quality.
2. Set default optimizer quality in framework config.
3. Enforce CMS upload max dimensions server-side if editors upload 4K heroes.

### Hint / example (optional)

- Overlaps `img-delivery`. When quality knobs barely move size, check for **expensive alpha** (soft glows) and flatten onto the real page background first — often ~100 KiB → ~few KiB.

### References

- https://developer.chrome.com/docs/performance/insights/image-delivery
- https://web.dev/articles/compress-images

---

## img-lazy — Lazy-load offscreen images (never lazy LCP)

```yaml
id: img-lazy
status: filled
owner: front
pass_bar: Offscreen images use loading=lazy (or equivalent); in-viewport / LCP images are eager + high priority
```

### Ownership

- **Front only.**
- **Server:** N/A.

### Stop here

Stop when first viewport + LCP are eager and below-fold is lazy. Do not lazy-load CSS background images via `loading` (unsupported). Do not fight Chromium distance thresholds — they are not configurable.

### What to check

- Lighthouse “Defer offscreen images” / wasted bytes above the fold from eager below-fold images.
- LCP or above-fold imgs with `loading="lazy"` (anti-pattern).
- Zero-dimension lazy galleries loading everything.

### How to fix

1. `loading="lazy"` only for offscreen; LCP/above-fold omit lazy (or `eager`).
2. Always pair with width/height (`img-size`).
3. Prefer native lazy over JS libraries unless you need a polyfill.
4. `loading` goes on the fallback `<img>` inside `<picture>`.

### References

- https://web.dev/articles/browser-level-image-lazy-loading
- https://developer.chrome.com/docs/performance/insights/lcp-discovery

---

## css-js-block — Render-blocking requests

```yaml
id: css-js-block
status: filled
owner: front
pass_bar: No unnecessary render-blocking CSS/JS on the critical path; defer, async, or fold into already-loaded/inlined CSS
```

### Ownership

- **Front:** component CSS strategy, script `defer`/`async`, dynamic import, critical CSS.
- **Server:** only if a reverse proxy injects blocking scripts (e.g. email-decode) — see `net-tree`.

### Stop here

Stop when the only blockers left are **required** critical CSS/JS for first paint and size is already small. Do not remove the main design stylesheet. CDN-injected blockers need ops/CDN settings, not more bundler churn.

### What to check

- Insight **Render-blocking requests**.
- Extra hashed component CSS chunks from scoped styles on SSR pages.
- Sync third-party scripts.

### How to fix

1. Move mid-page scoped CSS into global CSS already on the path.
2. Keep framework critical CSS inlining on.
3. Defer non-critical JS.
4. Confirm old hashed CSS 404s after deploy.

### Hint / example (optional)

- Mid-page scoped CSS → shared critical stylesheet already on the path; live needs redeploy + CDN purge.

### References

- https://developer.chrome.com/docs/performance/insights/render-blocking
- https://web.dev/articles/defer-non-critical-css

---

## css-unused — Unused CSS

```yaml
id: css-unused
status: filled
owner: front
pass_bar: Drop stylesheets with ≥ ~2 KiB unused where practical; critical CSS inlined / non-critical deferred
```

### Ownership

- **Front:** split CSS per route/component, remove dead utilities, Coverage-driven cleanup.
- **Server:** HTML that links global CSS on every route — still fix in app templates/build.

### Stop here

Stop when remaining “unused” is **responsive/state CSS** unused in that lab viewport (hover, other breakpoints, auth states) or a shared design system where per-route splitting costs more than it saves. Lab Coverage ≠ all real users.

### What to check

- Lighthouse **Remove unused CSS** (≥ ~2 KiB savings).
- DevTools **Coverage** tab for red (unused) rules.
- Huge monolithic `main.css` on simple pages.

### How to fix

1. Attach CSS only to routes/components that need it.
2. Inline above-the-fold critical CSS; `preload` + async the rest.
3. Purge unused utilities carefully (don’t break variants).
4. Remove dead theme/plugin CSS (CMS stacks).

### References

- https://developer.chrome.com/docs/lighthouse/performance/unused-css-rules
- https://developer.chrome.com/docs/devtools/coverage

---

## css-selector — CSS selector costs (recalculate style)

```yaml
id: css-selector
status: filled
owner: front
devtools-only: true
pass_bar: Informational — insight always “passes”; reduce high elapsed-time + high slow-path selectors when Recalculate Style is hot
```

### Ownership

- **Front:** simpler selectors, fewer rules, smaller/shallower DOM.
- **Server:** N/A.
- **Not in PageSpeed Insights** — DevTools Performance only, with **Enable CSS selector stats (slow)** on.

### Stop here

Stop when Recalculate Style is no longer a top long-task contributor, or when hottest selectors are unavoidable design-system primitives and **DOM size** is the real lever (`dom-size`). Measuring with selector stats **on** adds overhead — turn the setting off after diagnosis. Do not chase this from PSI alone (it will not appear).

### What to check

- DevTools Performance → Insights → **CSS selector costs**.
- Selectors with **high elapsed time** and **high slow-path %**.
- Deep selectors (`ul li a span`), universal/expensive combinators, huge rule counts on large DOMs.

### How to fix

1. Prefer class-based, shallow selectors over deep descendant chains.
2. Fewer rules; avoid broad selectors that match huge subtrees.
3. Shrink/flatten DOM (`dom-size`); `content-visibility` for offscreen.
4. After INP/style issues, re-profile with selector stats enabled briefly.

### Hint / example (optional)

- If style recalc dominates INP presentation delay, profile selectors before rewriting feature JS.
- Source insight: always passes; informational only.

### References

- https://developer.chrome.com/docs/performance/insights/slow-css-selector
- https://developer.chrome.com/docs/devtools/performance/selector-stats
- https://web.dev/articles/reduce-the-scope-and-complexity-of-style-calculations

---

## js-unused — Unused JavaScript

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

---

## js-duplicated — Duplicated JavaScript

```yaml
id: js-duplicated
status: filled
owner: front
pass_bar: No large duplicate modules across bundles; one copy of heavy deps via shared chunk
```

### Ownership

- **Front / bundler only.**
- **Server:** N/A.

### Stop here

Stop when Treemap shows only tiny duplicates (&lt; few KiB) or duplicates inside **third-party scripts** you cannot bundle. Multiple copies of the same lib from different major versions may need a product decision to align versions — not endless alias hacks.

### What to check

- Insight **Duplicated JavaScript**; use **View Treemap**.
- Same package in multiple async chunks without a shared vendor chunk.
- Two versions of lodash/moment/etc. from mismatched deps.

### How to fix

1. Enable bundler splitChunks / shared / vendor chunk for large common deps (webpack, rollup, esbuild, Parcel, Vite).
2. Dedupe versions (`pnpm`/`npm` overrides) so only one major lands.
3. Avoid bundling a library already provided by a global/CDN script (pick one).

### References

- https://developer.chrome.com/docs/performance/insights/duplicated-javascript

---

## preload — Preloads / critical request chain

```yaml
id: preload
status: filled
owner: front
pass_bar: Only critical late-discovered assets preloaded; unused preloads ≈ 0; fonts use crossorigin
```

### Ownership

- **Front:** `<link rel="preload">` / HTTP Link on app responses you control.
- **Server:** optional `Link` response headers at CDN; must stay in sync with HTML.

### Stop here

Stop when LCP/font critical path is covered and Console shows no unused preload warnings. **Do not preload everything** — excess preloads fight for bandwidth and hurt LCP/INP. If the chain’s first delay is document TTFB, fix `ttfb` first.

### What to check

- Late-discovered fonts/images (3rd level of critical chain).
- Preload without `as`, or fonts missing `crossorigin` (double-fetch).
- Unused preloads (~3s after load warning).

### How to fix

1. Preload sparingly: LCP image, one critical font, critical JS chunk.
2. Fonts: `as="font"` + `type` + `crossorigin`.
3. Match `media` / `imagesrcset` for responsive LCP.
4. Prefer HTTP `Link` only if it matches real critical assets.

### References

- https://web.dev/articles/preload-critical-assets
- Overlaps: `cwv-lcp`, `net-tree`, `fonts`

---

## ttfb — Document request latency / TTFB

```yaml
id: ttfb
status: filled
owner: server
pass_bar: Insight — avoid redirects; server response ≤ 600ms; document compressed. CWV TTFB good ≤ 800ms (includes DNS + redirects)
```

### Ownership

- **Server / CDN / hosting (primary):** redirects, app SSR time, DB, cache, compression (`Content-Encoding`), edge cache.
- **Front:** only reduce SSR work (smaller queries, streamed HTML, avoid giant sync renders) when you own the app server / Node (or equivalent) code.

### Stop here

**Front-only CSS/JS will not fix pure TTFB.** Stop front work when the lever is origin/CDN. If the user **owns** the server/CDN: apply How to fix below (redirects, compression, SSR/DB, edge cache). Stop entirely when latency is **geo DNS / cold edge / hosting tier you cannot change**, or origin already compresses, has no app-controlled redirects, and remaining delay is upstream you do not control. Note: insight’s **600ms** server time ≠ CWV **800ms** TTFB (TTFB includes DNS + redirects).

### What to check

- Insight **Document request latency**: redirects, &gt;600ms server response, uncompressed document.
- Cross-host www/apex redirects; http→https chains.
- Missing `Content-Encoding: br|gzip|zstd` on HTML.
- Blocking DB / upstream awaits on the document path before first byte.

### How to fix

1. Eliminate redirects; link to final URLs; responsive site instead of m-dot redirects.
2. Speed SSR: cache full page at CDN when personalized HTML allows; optimize DB; stream HTML (`renderToNodeStream` / framework streaming).
3. Enable compression on the server/CDN.
4. CDN closer to users for cacheable HTML.
5. Trim or parallelize queries and upstream calls that gate the HTML response; avoid sync fan-out before first byte.

### References

- https://developer.chrome.com/docs/performance/insights/document-latency
- https://web.dev/articles/ttfb

---

## net-tree — Network dependency tree

```yaml
id: net-tree
status: filled
owner: both
pass_bar: Shorten critical chains; remove unnecessary critical JS/CSS; preconnect ≤4 only when PSI lists candidates
```

### Ownership

- **Front:** blocking CSS/JS chains, discoverability.
- **Server/CDN:** injected scripts (edge email obfuscation), edge headers, preconnect at CDN if used.

### Stop here

Stop adding preconnects when PSI says **no additional candidates**. Stop front work when the remaining chain head is **document TTFB** or a **CDN-injected** script — fix via `ttfb` / CF Scrape Shield, not bundler.

### What to check

- Max critical path latency + chain list.
- CF `/cdn-cgi/.../email-decode.min.js`.
- Component CSS chunks on the critical path.

### How to fix

1. Cut/defer non-critical JS/CSS.
2. Move scoped CSS to global critical bundle.
3. Avoid SSR emails or disable Email Obfuscation; purge cache.
4. Preconnect only PSI candidates (≤ ~4).

### Hint / example (optional)

- Client-side mailto instead of server-obfuscated emails; mid-page scoped CSS → shared critical stylesheet.

### References

- https://developer.chrome.com/docs/performance/insights/network-dependency-tree
- https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/

---

## fonts — Web fonts (display, metrics, preload)

```yaml
id: fonts
status: filled
owner: front
pass_bar: font-display swap or optional; critical fonts preloaded with crossorigin; CLS from fonts mitigated
```

### Ownership

- **Front:** `@font-face`, `font-display`, preload, fallback metrics (`size-adjust`, ascent/descent overrides), subsetting.
- **Server/CDN:** cache headers for `/fonts/*` (`cache`); host fonts same-origin when possible.

### Stop here

Stop when display is `swap`/`optional`, critical face is preloaded (or intentionally `optional` without preload), and fallback metrics keep CLS acceptable. Further gains need **licensed subset files** from design — do not self-host illegally or invent metric overrides that break the brand without design QA.

### What to check

- Insight **Font display** — fails if not `swap` or `optional`.
- FOIT/FOUT; font-related CLS.
- Double-fetched fonts (preload missing `crossorigin`).
- Huge family files unused weights.

### How to fix

1. Set `font-display: swap` or `optional` (required to pass insight).
2. Preload one critical WOFF2 with `crossorigin`.
3. Mitigate swap CLS with metric overrides / matched fallbacks.
4. Subset weights/glyphs; self-host to control cache.

### References

- https://developer.chrome.com/docs/performance/insights/font-display
- https://web.dev/articles/font-best-practices
- https://developer.chrome.com/blog/font-fallbacks

---

## third-party — Third-party code / origins

```yaml
id: third-party
status: filled
owner: both
pass_bar: Minimize third-party transfer + main-thread time; prefer same-origin for first-party media; defer non-critical third-party JS
```

### Ownership

- **Front:** don’t hotlink media; defer tags; consent-gate tags.
- **Server/ops:** CSP, tag manager container, CDN/custom domain for media.

### Stop here

Stop when first-party media is on the image optimizer (or same host) and remaining third parties are **required** analytics/payments/chat with no lighter alternative approved by product. You cannot “fix” a vendor’s main-thread cost in app CSS. If the user **owns** tag-manager / consent / proxy config, defer or consent-gate there before accepting residual.

### What to check

- PSI **3rd parties**: JS cost vs media bandwidth (0 ms main thread ⇒ mostly bytes/connection).
- Raw object-storage hosts in `src`/`srcset`.

### How to fix

1. Allowlist image hosts + framework image component → same-origin optimizer (`cache`).
2. Defer/consent third-party JS.
3. Optional: CDN on the site hostname.

### Hint / example (optional)

- Shared image-domain allowlist from config defaults + env + API URL hosts.

### References

- https://developer.chrome.com/docs/performance/insights/third-parties
- https://web.dev/articles/tag-best-practices

---

## cache — Use efficient cache lifetimes

```yaml
id: cache
status: filled
owner: both
pass_bar: Cacheable subresources ≥ 30 days (2592000s); prefer ~1 year for hashed/static assets
```

### Ownership

- **Front:** use hashed URLs and the image optimizer so the browser hits cacheable first-party URLs; don’t bypass the optimizer.
- **Server/CDN/object storage:** `Cache-Control` on objects and routes — **only place that sets TTL for direct bucket URLs**.

### Stop here

Stop **front** work when HTML already points at long-TTL first-party URLs and remaining short-TTL is **third-party** (analytics) or **HTML/API** (must stay short). If the user **owns** origin/CDN/object storage: set `Cache-Control` there (How to fix). You cannot lengthen bucket TTL from markup alone if the browser still requests the raw bucket URL — rewrite to first-party/optimizer URLs (`img-delivery`) **and** set headers on the owned store.

### What to check

- Insight **Use efficient cache lifetimes**.
- Short TTL on object storage; missing long TTL on hashed bundles, image optimizer routes, fonts.
- Short-TTL injected third-party scripts.

### How to fix

1. Framework `routeRules` / CDN: `max-age=31536000, immutable` for hashed assets.
2. Image optimizer: long `maxAge` + ignore upstream Cache-Control when appropriate; allowlist domains.
3. Ops: object storage / CDN Cache-Control if anything still hits the bucket.
4. Never long-cache HTML/auth API.

### References

- https://developer.chrome.com/docs/performance/insights/cache
- https://web.dev/articles/http-cache

---

## main-thread — Minimize main-thread work / long tasks

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

---

## dom-size — Avoid large DOM size

```yaml
id: dom-size
status: filled
owner: front
pass_bar: Warn ~&gt;800 body nodes; error ~&gt;1,400; prefer virtualize / defer offscreen nodes
```

### Ownership

- **Front:** render less, virtualize lists, defer below-fold DOM, flatten wrappers.
- **Server:** SSR should not emit entire infinite scroll HTML at once — paginate/stream.

### Stop here

Stop when the page **genuinely needs** a large interactive tree (spreadsheet, long editor) and you’ve already windowed offscreen rows + simplified selectors. Further node-shaving that breaks a11y/SEO lists is not worth a lab warning.

### What to check

- Lighthouse **Avoid an excessive DOM size** (nodes, depth, max children).
- Hidden tabs/accordions still fully in DOM.
- Large marketing pages with nested wrappers.

### How to fix

1. Create nodes on demand; destroy when unused.
2. Virtual scrolling for long lists (`react-window`, etc.).
3. Don’t SSR thousands of cards — paginate or infinite-load.
4. Simplify CSS selectors if DOM must stay large (`css-selector`).
5. `content-visibility: auto` for offscreen sections (INP/render).

### References

- https://developer.chrome.com/docs/lighthouse/performance/dom-size
- https://web.dev/articles/dom-size-and-interactivity

---

## reflow — Forced reflow / layout thrashing

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

---

## legacy-js — Legacy JavaScript / polyfills

```yaml
id: legacy-js
status: filled
owner: front
pass_bar: ≤ 5 KiB polyfills/transforms for Baseline widely available features (insight fails above that)
```

### Ownership

- **Front / build toolchain:** Babel/Browserslist/preset-env, bundler target.
- **Server:** N/A (except not shipping a separate legacy bundle by default).

### Stop here

Stop when build targets **Baseline Widely available** (or your real analytics browser set) and remaining polyfills are for **intentionally supported** old browsers. If product requires IE/ancient WebViews, accept the audit fail — that is a business constraint, not a bug.

### What to check

- Insight **Legacy JavaScript** (&gt;5 KiB polyfills for widely supported features).
- Over-transpiling ES6+; shipping core-js everything.

### How to fix

1. Browserslist: `baseline widely available` (or year query).
2. Stop transpiling Baseline features; trim `core-js` usage.
3. Verify real audience with analytics / Baseline checker before dropping targets.

### References

- https://developer.chrome.com/docs/performance/insights/legacy-javascript
- https://web.dev/articles/baseline-and-polyfills

---

## http — Modern HTTP (HTTP/2 / HTTP/3)

```yaml
id: http
status: filled
owner: server
devtools-only: true
pass_bar: Origins that serve ≥6 static assets use HTTP/2 or HTTP/3 (not HTTP/1.1). Not shown in PageSpeed Insights
```

### Ownership

- **Server / CDN / load balancer only.**
- **Front:** no code change fixes HTTP/1.1 on the origin.

### Stop here

**Not fixable from front-end app code alone.** If the user **owns** hosting/CDN/load balancer: enable h2/h3 (How to fix). If they do not own the terminator, escalate once and stop. Ignore on localhost/CI (insight excludes localhost). If PSI never shows it, don’t invent work from this insight alone — confirm in DevTools.

### What to check

- DevTools insight **Modern HTTP**: HTTP/1.1 resources from busy static origins (≥6 assets).
- Multiplexing benefits matter when many assets share a host.

### How to fix

1. Enable HTTP/2 and preferably HTTP/3 (QUIC) on CDN/origin TLS terminator.
2. Serve static assets through that CDN.
3. Confirm in DevTools Network Protocol column.

### References

- https://developer.chrome.com/docs/performance/insights/modern-http
- https://web.dev/articles/introduction-to-http2

---

## viewport-mobile — Optimize viewport for mobile

```yaml
id: viewport-mobile
status: filled
owner: front
pass_bar: meta viewport present at first paint with width set (usually device-width) and initial-scale ≥ 1
```

### Ownership

- **Front / app HTML head** (framework head config, layout, or static HTML).
- **Server:** only if a proxy strips `<head>` (rare).

### Stop here

Stop once the meta tag is correct. Extra zoom/`maximum-scale` debates are a11y/product, not this insight. Missing viewport causes up to ~300ms tap delay — fix is one tag, not JS.

### What to check

- Insight **Optimize viewport for mobile**.
- Missing or incomplete `<meta name="viewport" …>`.

### How to fix

1. Ensure e.g. `<meta name="viewport" content="width=device-width, initial-scale=1">` in initial HTML.
2. `width` set; `initial-scale` ≥ 1.

### References

- https://developer.chrome.com/docs/performance/insights/viewport

---

## pattern-skeleton — Skeleton ↔ real content height parity

```yaml
id: pattern-skeleton
status: filled
owner: front
pass_bar: Skeleton and real content share the same reserved box per breakpoint (supports CLS ≤ 0.1)
```

### Ownership

- **Front.**
- **Server:** N/A.

### Stop here

Stop when skeleton and content boxes match across breakpoints you ship. Do not pixel-match every font glyph — use shared aspect/`min-height` tokens. Overlaps `cwv-cls`.

### What to check

- Skeleton height/width ≠ final card/hero/list row.
- Client-only fallback empty then large.

### How to fix

1. Shared CSS size tokens for skeleton + content.
2. Prefer `aspect-ratio` wrappers.
3. Measure both states in DevTools device modes.

### References

- Overlaps: `cwv-cls`

---

## pattern-inject — Dynamically injected content

```yaml
id: pattern-inject
status: filled
owner: front
pass_bar: Late UI (banners, hydrate islands, consent, sticky bars) reserves space or overlays without pushing content unexpectedly
```

### Ownership

- **Front.**
- **Server:** edge-injected banners (A/B, affiliate) — ops must reserve space or inject in overlay mode.

### Stop here

Stop when your app injects reserve space. Remaining CLS from **tag-manager HTML injects** you don’t control → remove/relocate tag or accept residual (`third-party`).

### What to check

- Banners/marquees/modals inserting into document flow after paint.
- Viewport/lazy hydration swapping 0-height placeholders.

### How to fix

1. Reserve `min-height` before fetch/hydrate.
2. Prefer overlays/`position: fixed` for ephemeral UI when design allows.
3. Show loaders in the reserved box (user-expected within 500ms of input is OK for CLS).

### References

- Overlaps: `cwv-cls`, https://web.dev/articles/cls

---

## pattern-motion — Animation CLS-safety

```yaml
id: pattern-motion
status: filled
owner: front
pass_bar: Motion uses transform/opacity (or equivalent compositor props); no layout-property animation on visible content
```

### Ownership

- **Front.**
- **Server:** N/A.

### Stop here

Stop when animations are compositor-only and `prefers-reduced-motion` is respected. Design requests that require animating `height` must use reserved max space or accept CLS — escalate to design.

### What to check

- Animating `top`/`left`/`width`/`height`/`margin` on visible nodes.
- Enter/leave transitions that collapse height without reservation.

### How to fix

1. Use `transform: translate/scale` and `opacity`.
2. Honor `prefers-reduced-motion`.
3. If height must change, reserve space or animate within a fixed box.

### References

- https://web.dev/articles/cls#animations-and-transitions
- Overlaps: `cwv-cls`

---

## pattern-hero — Above-the-fold / hero media priority

```yaml
id: pattern-hero
status: filled
owner: front
pass_bar: Hero/LCP media early in HTML, eager, high fetchpriority, responsive src correct, optional matching preload
```

### Ownership

- **Front.**
- **Server:** fast first HTML byte (`ttfb`) so the hero tag arrives early.

### Stop here

Stop when hero follows `lcp-discovery` + `cwv-lcp` and bytes are reasonable (`img-delivery`). Further work is server TTFB or CDN, not more hero markup.

### What to check

- Hero after large widgets in DOM.
- Desktop src used as mobile LCP.
- Lazy/low priority hero.

### How to fix

1. Hero media first in the hero section.
2. Mobile-first `src`; desktop `source media`.
3. Preload + `fetchpriority="high"`; never lazy.
4. Stable aspect box (`img-size` / `cwv-cls`).

### References

- Overlaps: `cwv-lcp`, `lcp-discovery`, `preload`

---

## Quick triage: front vs server

| Mostly **front** | Mostly **server / CDN / ops** | **DevTools-only** (not in PSI) |
|------------------|-------------------------------|--------------------------------|
| CLS, INP, reflow, DOM, fonts display, unused/dupe JS, legacy JS, viewport, lazy images, selector costs | TTFB/document latency, HTTP/2\|3, origin compression, object-storage / CDN Cache-Control, edge email-obfuscation inject | `css-selector`, `http` (modern HTTP) |

**Full-stack / owns hosting:** treat the server column as **Now** when those insights fail — apply each checkpoint’s How to fix in-repo or in owned CDN config. **Front-only:** report server column as **Stop** (one sentence). **Backend-only:** treat server column as **Now**; put pure front CLS/JS on Next/Stop with a handoff note.

When stop criteria match **and** no owned lever remains: **report the checkpoint id + stop reason; do not invent patches on the wrong layer.** For owner `both`: do the owned half first (see skill Now order).
