# preload — Preloads / critical request chain

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
