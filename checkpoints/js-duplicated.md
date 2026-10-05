# js-duplicated — Duplicated JavaScript

```yaml
id: js-duplicated
status: filled
owner: front
pass_bar: No large duplicate modules across bundles; one copy of heavy deps via shared chunk
```

### Ownership

- **Front / bundler only.**
- **Server:** N/A.

### Stop here

Stop when Treemap shows only tiny duplicates (&lt; few KiB) or duplicates inside **third-party scripts** you cannot bundle. Multiple copies of the same lib from different major versions may need a product decision to align versions — not endless alias hacks.

### What to check

- Insight **Duplicated JavaScript**; use **View Treemap**.
- Same package in multiple async chunks without a shared vendor chunk.
- Two versions of lodash/moment/etc. from mismatched deps.

### How to fix

1. Enable bundler splitChunks / shared / vendor chunk for large common deps (webpack, rollup, esbuild, Parcel, Vite).
2. Dedupe versions (`pnpm`/`npm` overrides) so only one major lands.
3. Avoid bundling a library already provided by a global/CDN script (pick one).

### References

- https://developer.chrome.com/docs/performance/insights/duplicated-javascript
