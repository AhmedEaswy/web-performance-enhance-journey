# legacy-js — Legacy JavaScript / polyfills

```yaml
id: legacy-js
status: filled
owner: front
pass_bar: ≤ 5 KiB polyfills/transforms for Baseline widely available features (insight fails above that)
```

### Ownership

- **Front / build toolchain:** Babel/Browserslist/preset-env, bundler target.
- **Server:** N/A (except not shipping a separate legacy bundle by default).

### Stop here

Stop when build targets **Baseline Widely available** (or your real analytics browser set) and remaining polyfills are for **intentionally supported** old browsers. If product requires IE/ancient WebViews, accept the audit fail — that is a business constraint, not a bug.

### What to check

- Insight **Legacy JavaScript** (&gt;5 KiB polyfills for widely supported features).
- Over-transpiling ES6+; shipping core-js everything.

### How to fix

1. Browserslist: `baseline widely available` (or year query).
2. Stop transpiling Baseline features; trim `core-js` usage.
3. Verify real audience with analytics / Baseline checker before dropping targets.

### References

- https://developer.chrome.com/docs/performance/insights/legacy-javascript
- https://web.dev/articles/baseline-and-polyfills
