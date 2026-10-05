# pattern-skeleton — Skeleton ↔ real content height parity

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
