# css-js-block — Render-blocking requests

```yaml
id: css-js-block
status: filled
owner: front
pass_bar: No unnecessary render-blocking CSS/JS on the critical path; defer, async, or fold into already-loaded/inlined CSS
```

### Ownership

- **Front:** component CSS strategy, script `defer`/`async`, dynamic import, critical CSS.
- **Server:** only if a reverse proxy injects blocking scripts (e.g. email-decode) — see `net-tree`.

### Stop here

Stop when the only blockers left are **required** critical CSS/JS for first paint and size is already small. Do not remove the main design stylesheet. CDN-injected blockers need ops/CDN settings, not more bundler churn.

### What to check

- Insight **Render-blocking requests**.
- Extra hashed component CSS chunks from scoped styles on SSR pages.
- Sync third-party scripts.

### How to fix

1. Move mid-page scoped CSS into global CSS already on the path.
2. Keep framework critical CSS inlining on.
3. Defer non-critical JS.
4. Confirm old hashed CSS 404s after deploy.

### Hint / example (optional)

- Mid-page scoped CSS → shared critical stylesheet already on the path; live needs redeploy + CDN purge.

### References

- https://developer.chrome.com/docs/performance/insights/render-blocking
- https://web.dev/articles/defer-non-critical-css
