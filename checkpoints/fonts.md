# fonts — Web fonts (display, metrics, preload)

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
