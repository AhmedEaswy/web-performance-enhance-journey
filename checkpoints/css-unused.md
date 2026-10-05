# css-unused — Unused CSS

```yaml
id: css-unused
status: filled
owner: front
pass_bar: Drop stylesheets with ≥ ~2 KiB unused where practical; critical CSS inlined / non-critical deferred
```

### Ownership

- **Front:** split CSS per route/component, remove dead utilities, Coverage-driven cleanup.
- **Server:** HTML that links global CSS on every route — still fix in app templates/build.

### Stop here

Stop when remaining “unused” is **responsive/state CSS** unused in that lab viewport (hover, other breakpoints, auth states) or a shared design system where per-route splitting costs more than it saves. Lab Coverage ≠ all real users.

### What to check

- Lighthouse **Remove unused CSS** (≥ ~2 KiB savings).
- DevTools **Coverage** tab for red (unused) rules.
- Huge monolithic `main.css` on simple pages.

### How to fix

1. Attach CSS only to routes/components that need it.
2. Inline above-the-fold critical CSS; `preload` + async the rest.
3. Purge unused utilities carefully (don’t break variants).
4. Remove dead theme/plugin CSS (CMS stacks).

### References

- https://developer.chrome.com/docs/lighthouse/performance/unused-css-rules
- https://developer.chrome.com/docs/devtools/coverage
