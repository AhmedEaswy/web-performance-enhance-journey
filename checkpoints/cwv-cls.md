# cwv-cls — Cumulative Layout Shift (CLS) / layout shift culprits

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
