---
name: performance-enhance-journey
description: >-
  Fixes Google PageSpeed / Lighthouse insights for front, backend, and full-stack
  work using a reusable checkpoint playbook (CLS, LCP, INP, TTFB, cache, HTTP,
  images, fonts, JS/CSS, and more). Prefer smallest safe fixes that do not change
  product logic, UX contracts, or business results. Use when the user pastes
  PageSpeed/Lighthouse reports, asks to improve Core Web Vitals, or says to apply
  the performance-enhance-journey / pagespeed playbook on any stack (Nuxt, React,
  Blade, Node, Laravel, etc.). Census owned surfaces, rank Now / Next / Stop,
  then fix one item at a time.
disable-model-invocation: false
---

# Performance enhance journey

Cross-stack checklist for diagnosing and fixing Google PageSpeed Insights /
Lighthouse / DevTools Performance insights. For **front-end**, **backend**, and
**full-stack** developers. Framework-agnostic: adapt to Nuxt, React, Vue, Blade,
Node, Laravel, plain HTML, CDN/edge configs, etc.

Public install, expectations, and license: [README.md](README.md).

## When to use

1. User pastes PageSpeed / Lighthouse insights or scores.
2. User asks to improve CLS, LCP, INP, TTFB, cache, HTTP, or general PageSpeed.
3. User says to follow / update the performance-enhance-journey skill (or pagespeed playbook).
4. User applies the skill on a **new project** (with or without a pasted report).

## Start on a new project

Run this **before editing**. A pasted PageSpeed / Lighthouse report adds evidence; it does not skip the census.

1. **Intake.** Note the audited URL or page, mobile vs desktop, lab paste (yes/no), and **who owns the server**. Infer from the repo when possible (SSR app, `nginx`/`vercel.json`/`routeRules`/Docker in-repo → likely owns origin). If unclear, ask once: front-only, backend-only, or full-stack (owns app + hosting/CDN config). With no lab data, still census and label findings as **code risk**, not scores. If code risk is large and no URL/report exists, ask once for a PSI URL — still show the ranked list from the census.
2. **Census (read-only).** Follow the **front** and **backend** checklists below. Bucket heavy libraries and server surfaces. Record **only** what this repo (and owned hosting config) actually has.
3. **Map.** For each finding and each pasted insight, attach a checkpoint id from [checkpoints.md](checkpoints.md), owner (`front` / `server` / `both` / `devtools-only`), evidence, the fix class, and the stop line.
4. **Rank, then show the list before coding** (use the template below).
   - **Now:** fails or threatens LCP, CLS, INP, or document TTFB on the audited page; cause is in a surface the user **owns** (`front`, `server`, or the owned half of `both`).
   - **Next:** same class of fix, lower impact, or safe follow-ups on an owned surface.
   - **Stop:** surfaces the user does **not** own (managed CDN they cannot configure, required third-party vendor, framework / i18n / store residual). One sentence each. Do not code these.
5. **Fix loop.** One ranked **Now** (then **Next**) item at a time. Smallest change that matches that checkpoint’s “How to fix.” Re-check ownership, **product safety**, and the stop line before the next item.
6. **Report.** Checkpoint id, front vs server, what changed or why stopped, pass bar. Call out any deferred item that would risk behavior.

### Product safety (do not hurt logic or results)

Performance work must **preserve** product logic, UX contracts, SEO meaning, and business results. Lab score is never worth a broken flow.

**Hard rules**

1. **Behavior first.** Do not remove, skip, or reorder features, validation, auth, payments, consent, analytics required by product, checkout, or data writes to chase a score.
2. **Defer ≠ delete.** Prefer lazy / interaction / idle load that still runs the same code path when the user needs it. Do not delete runtime, i18n, stores, or required widgets.
3. **Same outcomes.** After a fix, the same user actions must produce the same visible results, API effects, and error handling (forms still validate; carousels still work; SSR data still matches).
4. **Cache without lying.** Never long-cache HTML, auth, personalized, or permissioned responses. Hashed static assets only for long TTL. Wrong cache that serves stale private or checkout data is a **Stop** / reject, not a fix.
5. **Images / quality.** Do not crush brand-critical art, soft-glow SVGs into banded WebP, or drop quality below an agreed floor without asking. Prefer format/size/discovery fixes over visible degradation.
6. **Layout locks.** Fixed heights / line-clamp / `overflow: hidden` must not clip real content users need (legal text, prices, CTAs, form errors). If content length varies by locale, reserve space without hiding it.
7. **Lazy hydration / islands.** Do not break above-the-fold interactivity the product requires on first paint (primary CTA, nav, critical form). Interaction gates are for below-fold or secondary UI.
8. **Redirects / URLs.** Collapsing redirect chains must keep the **final** canonical URL and bookmarks/SEO intact — no accidental host or path changes.
9. **Third parties.** Defer or consent-gate only when product/legal allows. Do not remove payment, auth, or required analytics SDKs.
10. **Ask when unsure.** If a fix might change UX copy, visual design, SEO, or a conversion path, put it on **Next** or **Stop**, explain the tradeoff in one sentence, and wait for confirmation.

**When ranking**

- Prefer **Now** items that are load-order, headers, compression, dimensions, discovery, or code-splitting with identical runtime.
- Push to **Next** / ask: quality drops, removing animations, changing hydrate strategy on critical UI, caching personalized HTML, trimming DB fields used by the UI.
- **Stop:** anything that would alter business rules, security, or compliance to please Lighthouse.

**Smoke after each fix (owned surfaces)**

Before the next item: load the audited page; hit primary CTA / main nav; submit or open any form touched by the change; if backend/cache/redirects changed, spot-check headers and one authenticated or personalized path if the product has one. If smoke fails, revert that fix and report — do not continue the loop.

### Who owns what

| Role | Treat as owned | Stop (do not invent patches) |
|------|----------------|------------------------------|
| Front-only | Markup, CSS, JS, bundler, image pipeline in the app repo | Origin TTFB, CDN Cache-Control, HTTP/2\|3, DNS, hosting tier |
| Backend-only | API/SSR handlers, DB queries on document path, redirects, compression, cache headers, reverse-proxy / CDN config in repo | Pure layout CLS, unsized images, client-only JS weight (report as front Now for a front teammate) |
| Full-stack | Both columns above | Only true externals: vendor tags, geo DNS, hosting limits they cannot change |

Checkpoint **Stop here** means: stop on surfaces you do **not** own, or accept a residual that no owned change can move. If the user owns the server, `ttfb` / `http` / `cache` **How to fix** are actionable — do not park them on Stop by default.

### Census checklist — front

Read only what exists; skip missing paths.

| Look at | Detect |
|---------|--------|
| Manifest / lockfile (`package.json`, `composer.json`, etc.) | Framework, image optimizer, heavy deps → category buckets |
| App entry + root layout | Sync imports of validators, toasts, icons, carousels, widgets |
| Page / route for the audited URL | Above-fold media, lazy islands, marquees, typewriters |
| Global CSS / design tokens / head config | Fonts, inlined critical CSS size, global carousel CSS |
| Built or SSR HTML sample (if available) | Cascading `modulepreload`, visibility prefetch, LCP preload order |
| Public / static assets (spot-check large files) | Soft-glow rasters, decorative SVG filters, unsized heroes |
| Third-party tags / consent / analytics boot | Scroll- or touch-armed widgets |

**Front non-library risks:**

- Soft-glow / alpha-expensive rasters → `img-delivery` / `img-encode`
- Decorative SVG with heavy blur filters → `cwv-cls`
- Unsized images / mismatched aspect → `img-size` / `cwv-cls`
- Huge inlined CSS before LCP preload → `cwv-lcp` / `css-js-block` / `css-unused`
- Scroll- or touch-armed widget boots → `js-unused` / `main-thread` / `third-party`

### Census checklist — backend / server

Run whenever role is backend or full-stack, or the repo clearly contains server/CDN config.

| Look at | Detect |
|---------|--------|
| Server / SSR entry (API routes, `server/`, controllers, edge functions) | Slow document path, sync fan-out, uncached SSR |
| Redirect / canonical rules (app + proxy) | www/apex, http→https chains, m-dot → `ttfb` / `net-tree` |
| Compression config (proxy, host, framework) | Missing `br`/`gzip`/`zstd` on HTML → `ttfb` |
| Cache headers / `routeRules` / CDN / object-storage policy | Short TTL on hashed assets; HTML/API wrongly long-cached → `cache` |
| Image optimizer / media CDN / allowlists | Bypass of first-party optimizer; hotlink to bucket → `img-delivery` / `third-party` / `cache` |
| Reverse proxy / platform config (`nginx`, Caddy, `vercel.json`, Netlify, Cloudflare, Docker compose) | HTTP/1.1 only, missing h2/h3, edge injects → `http` / `net-tree` |
| DB / upstream calls on the **document** request | N+1, cold cache, blocking awaits before first byte → `ttfb` |
| HTML `Link` / early hints from the server | LCP preload buried or missing `fetchpriority` → `cwv-lcp` / `lcp-discovery` / `preload` |

**Backend risks** (same ranking rules):

- Redirect chains or uncompressed HTML → `ttfb`
- SSR/TTFB dominated by DB or upstream API → `ttfb` (cache, stream, trim queries)
- Hashed static assets with short `Cache-Control` → `cache`
- Origin still on HTTP/1.1 for many static assets → `http` (DevTools; not always in PSI)
- Edge/email-obfuscation or tag injects on the critical path → `net-tree` / `third-party`
- Object storage URLs in HTML bypassing the site optimizer → `img-delivery` / `cache` / `third-party`

### Ranked list template

Show this **before** any code change:

```text
## PageSpeed plan
- Page / URL: …
- Device: mobile | desktop
- Lab: pasted | none (code risk only)
- Role: front-only | backend-only | full-stack
- Owns server/CDN config: yes | no | partial (… )

### Now
1. [checkpoint-id] owner=front|server|both — evidence … — fix class … — pass bar …
2. …

### Next
1. …

### Stop
1. [checkpoint-id] owner=… — reason … (do not code; surface not owned or residual)
```

### Default Now order

When several items qualify as **Now**, sort by:

1. `ttfb` — if document latency / redirects / compression fail **and** the user owns the server (blocks LCP)
2. `cwv-lcp` / `lcp-discovery` / `pattern-hero`
3. `cwv-cls` / `img-size` / `pattern-skeleton` / `pattern-inject` / `fonts`
4. `cwv-inp` / `main-thread` / `reflow`
5. `img-delivery` / `img-encode` / `img-lazy` / `cache` (owned half)
6. `js-unused` / `css-js-block` / `preload` / `css-unused`
7. `http` / `net-tree` / `third-party` (owned half)
8. Everything else (`dom-size`, …)

Backend-only role: prefer steps 1, 5, 7 first; put pure front CLS/JS items on **Next** or **Stop** with a one-line handoff note.

### Owner `both`

1. Prefer the half the user’s role owns first (full-stack: front discovery/markup and server headers/TTFB can be sequenced by the Now order above).
2. Put the unowned half on **Stop** with one sentence.
3. Never invent front CSS/JS patches for pure TTFB, HTTP version, or origin Cache-Control — fix those on the server when owned.

### No-lab depth

Without a PSI / Lighthouse paste: finish census + ranked list, fix clear **Now** risks on owned surfaces (global heavy import, unsized LCP candidate, scroll-armed widget, missing compression, redirect chain, short cache on hashed assets). Do not chase micro-residuals or invent lab numbers. Prefer asking for a report after the first meaningful fix batch.

### Heavy-library categories (front)

Bucket by **role**, not by one product name. Same rules apply to any sibling found in the target repo. Library names may appear only as members of a category.

| Category | Examples (non-exhaustive) | Typical checkpoints |
|----------|---------------------------|---------------------|
| Carousels / sliders | Splide, Swiper, Embla, Keen, Glide, Slick | `js-unused`, `main-thread`, `preload`, `css-js-block` |
| Marquees / auto-scroll strips | vue3-marquee, CSS marquees, infinite logo rows | `cwv-cls`, `js-unused`, `main-thread`, `reflow` |
| Form validators | vee-validate, Zod, Yup, Valibot, react-hook-form | `js-unused`, `main-thread` |
| Toasts | sonner, react-hot-toast, and equivalents | `js-unused`, `main-thread` |
| Icon barrels on entry | lucide, icon packs imported wholesale | `js-unused`, `main-thread` |
| i18n / client stores | vue-i18n, next-intl, Pinia, Redux, Zustand — usually stay on entry | `js-unused` (**stop** when residual is runtime) |
| Chat / agent / analytics widgets | assistants, chat SDKs, tag managers | `third-party`, `js-unused`, `main-thread` |
| Layout-reading animation | typewriters, scroll-class navbars, `clientWidth` marquees | `main-thread`, `reflow`, `cwv-cls` |
| Media players / embeds | video.js, Plyr, YouTube/Vimeo embeds | `js-unused`, `third-party`, `cwv-cls`, `main-thread` |
| Charts / maps | Chart.js, ECharts, Mapbox, Google Maps | `js-unused`, `main-thread`, `third-party` |
| Editors / datepickers | TipTap, Quill, CodeMirror, flatpickr, react-day-picker | `js-unused`, `main-thread` |
| Animation libs | GSAP, Lottie, Framer Motion (heavy paths) | `main-thread`, `cwv-cls`, `js-unused` |
| Heavy UI kits on entry | large component libraries pulled into the root layout | `js-unused`, `css-unused`, `main-thread` |

### Server / platform surfaces (backend)

Bucket by **surface**, not by one host. Same rules for any sibling stack.

| Surface | Examples (non-exhaustive) | Typical checkpoints |
|---------|---------------------------|---------------------|
| Document / SSR path | Node/Nitro/Next server, Laravel/Blade, Rails, edge SSR | `ttfb`, `cwv-lcp`, `dom-size` |
| Redirects / canonical host | App redirects, proxy 301 chains, apex/www | `ttfb` |
| Compression | gzip/br/zstd on origin or CDN | `ttfb` |
| Cache policy | `Cache-Control`, CDN, object storage, framework route rules | `cache`, `img-delivery` |
| Transport | HTTP/2, HTTP/3 on TLS terminator / CDN | `http` |
| Edge injects | Email obfuscation, bot scripts, tag proxies | `net-tree`, `third-party` |
| Media origin | Image optimizer, allowlists, bucket vs first-party host | `img-delivery`, `third-party`, `cache` |
| Early hints / `Link` | Server `Link` preload for LCP/font | `lcp-discovery`, `preload`, `cwv-lcp` |

### Category fix patterns — front

Use stack-neutral verbs. Framework-specific APIs (e.g. `hydrate-on-visible`, `v-if`, `dynamicImports`) are **examples**, not the only path.

- **Carousels / marquees / validators / toasts / icons / players / charts / editors / UI kits:** do not sync-import into the entry or layout. Split into an island; load on interaction or when that island is actually needed. Keep CSS out of global stylesheets unless the island is above the fold.
- **Modulepreload / link prefetch:** cascading `modulepreload` and visibility prefetch of heavy routes pull category JS during lab scroll. Prefer CSS-only modulepreload resolve when the bundler allows it, clear unnecessary async deps from the page graph, and turn off link visibility prefetch when it loads auth/forms early.
- **Widgets:** do not arm on `scroll` / `touchstart` (lab scroll downloads them). Prefer idle + pointer / keydown.
- **i18n / stores / framework residual:** report and **stop** — do not delete runtime.
- **Layout-reading / animation libs:** defer start until idle or in-view; avoid sync geometry on mount; lock heights for marquees and cards that grow after font/wrap; prefer compositor-only motion (`pattern-motion`).

### Category fix patterns — backend

- **TTFB / document latency:** collapse redirect chains to the final URL; enable HTML compression; cache or stream SSR; cut blocking DB/upstream work before first byte; move personalized bits after shell when possible (`ttfb`).
- **Cache:** long TTL (`immutable`) for hashed bundles, fonts, optimizer URLs; keep HTML and auth API short-TTL; set headers at origin/CDN/object storage — front hashed URLs alone are not enough (`cache`).
- **HTTP/2|3:** enable on the CDN or TLS terminator serving static assets; app JS cannot fix HTTP/1.1 (`http`).
- **Media / third-party:** allowlist and rewrite hotlinks through the first-party optimizer or CDN hostname; defer or consent-gate tags (`img-delivery`, `third-party`).
- **Critical chain / injects:** remove or defer edge-injected blocking scripts; keep LCP `Link` preload early and dedicated (not one mega header) (`net-tree`, `cwv-lcp`, `preload`).
- **Stop when owned work is done:** geo DNS, cold regional edges, or hosting tier limits you cannot change — report once; do not invent fake app patches.

## Per-item rules

After the ranked list exists, apply each fix with these rules:

1. **Map insights → checkpoints** in [checkpoints.md](checkpoints.md). Match by insight name or symptom.
2. **Prefer filled checkpoints.** Status `filled` = follow check / fix / ownership / stop. Status `stub` should not appear; if one does, use general web.dev knowledge and offer to fill after a real fix.
3. **Read ownership + role first.** Work only on surfaces the user owns (see Who owns what). For **`both`**, sequence by Default Now order.
4. **Honor “Stop here” for unowned or true residuals.** When the checkpoint’s stop criteria match **and** no owned lever remains, say so in one sentence — do not invent fake patches on the wrong layer.
5. **Find root cause, not only victims.** Lighthouse often lists shifted/slow nodes that are symptoms (e.g. LCP load delay that is really TTFB or discovery).
6. **Fix with the smallest change** that matches “How to fix.” Prefer stack-neutral patterns; adapt to the repo’s framework and server stack. Obey **Product safety** — identical behavior beats a better lab score.
7. **Report briefly:** checkpoint id(s), front vs server, what changed (or why stopped), pass bar, and any deferred tradeoff that needs product sign-off.

## Ownership legend

| Owner | Meaning |
|-------|---------|
| `front` | App markup, CSS, JS, bundler, image pipeline in repo |
| `server` | Origin TTFB, redirects, compression, HTTP/2\|3, CDN, DNS, hosting, cache headers |
| `both` | Needs front and server levers; do the owned half (full-stack: both, in Now order) |
| `devtools-only` | Insight not in PageSpeed Insights; measure in DevTools Performance |

## Updating this playbook

When the user asks to update after a real fix:

1. Open [checkpoints.md](checkpoints.md).
2. Fill/revise **What to check**, **How to fix**, **Ownership**, **Stop here**, **Hint**, **Pass bar**.
3. Set `status: filled`.
4. Write hints as **symptom → cause class → fix class → stop**. Use **category patterns** (carousel, validator, marquee, glow raster, redirect chain, cache TTL, etc.). Do **not** name products, routes, component files, brand colors, hashed bundles, or asset filenames.
5. Library / platform names may appear only as members of a category, never as the only tool the skill knows. Prefer stack-neutral wording; framework or host APIs only as optional examples.
6. Keep front and server fix guidance equally concrete when both apply.
7. Do not rewrite unrelated checkpoints.

## Checkpoint index

| ID | Checkpoint | Owner | Status |
|----|------------|-------|--------|
| cwv-cls | Cumulative Layout Shift / layout shift culprits | front | filled |
| cwv-lcp | Largest Contentful Paint / LCP breakdown | both | filled |
| lcp-discovery | LCP request discovery | front | filled |
| cwv-inp | Interaction to Next Paint / INP breakdown | front | filled |
| img-size | Unsized images / width & height / aspect-ratio | front | filled |
| img-delivery | Improve image delivery (format, size, srcset) | both | filled |
| img-encode | Efficiently encode / compress images | both | filled |
| img-lazy | Lazy-load offscreen images (never lazy LCP) | front | filled |
| css-js-block | Render-blocking requests | front | filled |
| css-unused | Unused CSS | front | filled |
| css-selector | CSS selector costs (recalculate style) | front | filled |
| js-unused | Unused JavaScript | front | filled |
| js-duplicated | Duplicated JavaScript | front | filled |
| preload | Preloads / critical request chain | front | filled |
| ttfb | Document request latency / TTFB | server | filled |
| net-tree | Network dependency tree | both | filled |
| fonts | Web fonts (display, metrics, preload) | front | filled |
| third-party | Third-party code / origins | both | filled |
| cache | Cache lifetimes / static assets | both | filled |
| main-thread | Minimize main-thread work / long tasks | front | filled |
| dom-size | Avoid large DOM size | front | filled |
| reflow | Forced reflow / layout thrashing | front | filled |
| legacy-js | Legacy JavaScript / polyfills | front | filled |
| http | Modern HTTP (HTTP/2 / HTTP/3) | server | filled |
| viewport-mobile | Optimize viewport for mobile | front | filled |
| pattern-skeleton | Skeleton ↔ real content height parity | front | filled |
| pattern-inject | Dynamically injected content | front | filled |
| pattern-motion | Animation CLS-safety | front | filled |
| pattern-hero | Above-the-fold / hero media priority | front | filled |

Full bodies: [checkpoints.md](checkpoints.md).

[checkpoints.md](checkpoints.md) also ends with **Quick triage: front vs server** — a one-table split of which insights are front, server/CDN/ops, or DevTools-only, plus how each role should treat the server column.

Chrome insight index: https://developer.chrome.com/docs/performance/insights/
