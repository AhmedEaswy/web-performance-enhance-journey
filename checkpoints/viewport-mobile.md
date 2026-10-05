# viewport-mobile — Optimize viewport for mobile

```yaml
id: viewport-mobile
status: filled
owner: front
pass_bar: meta viewport present at first paint with width set (usually device-width) and initial-scale ≥ 1
```

### Ownership

- **Front / app HTML head** (framework head config, layout, or static HTML).
- **Server:** only if a proxy strips `<head>` (rare).

### Stop here

Stop once the meta tag is correct. Extra zoom/`maximum-scale` debates are a11y/product, not this insight. Missing viewport causes up to ~300ms tap delay — fix is one tag, not JS.

### What to check

- Insight **Optimize viewport for mobile**.
- Missing or incomplete `<meta name="viewport" …>`.

### How to fix

1. Ensure e.g. `<meta name="viewport" content="width=device-width, initial-scale=1">` in initial HTML.
2. `width` set; `initial-scale` ≥ 1.

### References

- https://developer.chrome.com/docs/performance/insights/viewport
