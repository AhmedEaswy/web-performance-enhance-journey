# img-delivery — Improve image delivery

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
