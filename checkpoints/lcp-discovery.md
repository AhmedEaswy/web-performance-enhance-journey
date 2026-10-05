# lcp-discovery — LCP request discovery

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
