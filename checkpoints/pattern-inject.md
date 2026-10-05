# pattern-inject — Dynamically injected content

```yaml
id: pattern-inject
status: filled
owner: front
pass_bar: Late UI (banners, hydrate islands, consent, sticky bars) reserves space or overlays without pushing content unexpectedly
```

### Ownership

- **Front.**
- **Server:** edge-injected banners (A/B, affiliate) — ops must reserve space or inject in overlay mode.

### Stop here

Stop when your app injects reserve space. Remaining CLS from **tag-manager HTML injects** you don’t control → remove/relocate tag or accept residual (`third-party`).

### What to check

- Banners/marquees/modals inserting into document flow after paint.
- Viewport/lazy hydration swapping 0-height placeholders.

### How to fix

1. Reserve `min-height` before fetch/hydrate.
2. Prefer overlays/`position: fixed` for ephemeral UI when design allows.
3. Show loaders in the reserved box (user-expected within 500ms of input is OK for CLS).

### References

- Overlaps: `cwv-cls`, https://web.dev/articles/cls
