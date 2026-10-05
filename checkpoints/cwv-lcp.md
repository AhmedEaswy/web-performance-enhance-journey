# cwv-lcp — Largest Contentful Paint (LCP) / LCP breakdown

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
