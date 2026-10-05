# img-lazy — Lazy-load offscreen images (never lazy LCP)

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
