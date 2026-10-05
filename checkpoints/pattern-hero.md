# pattern-hero — Above-the-fold / hero media priority

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
