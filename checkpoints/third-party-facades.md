# third-party-facades — Lazy-load third-party resources with facades

```yaml
id: third-party-facades
status: filled
owner: front
pass_bar: Heavy third-party embeds render a facade first and load the real vendor only when the user interacts
```

### Ownership

- **Front:** embed markup, the click/in-view trigger, the placeholder's reserved box.
- **Server/CDN:** only if the embed snippet is injected at the edge — then ops must remove or defer the inject.

### Stop here

Stop when the third party **must** be live at first paint for product or compliance reasons (primary payment flow, consent that must run immediately, analytics the business requires on load). Do not facade a required script into failing its purpose — record the tradeoff and stop.

### What to check

- Lighthouse **Lazy load third-party resources with facades**.
- Heavy embeds rendered on first load: video players, maps, chat, review/social feeds, comment systems.
- The same origins also appearing in `third-party` main-thread cost or in the critical chain (`net-tree`).
- Whether the placeholder reserves the same box as the loaded embed.

### How to fix

1. Render a **static facade** — poster image, thumbnail, or a button — with dimensions reserved up front (`img-size`, `cwv-cls`).
2. Load the vendor's script/iframe on explicit interaction or in-view-near, not at boot; swap in place so the box does not move.
3. Keep a no-JS fallback link to the real destination so the feature degrades instead of disappearing.
4. Pair with `third-party` (defer / consent-gate) and `js-unused` (keep the vendor off the entry graph).
5. Verify the swap does not shift layout or steal focus from where the user clicked.

### Hint / example (optional)

- Video embeds are the classic case: thumbnail plus play control, real player only after a click.
- Maps, review widgets, and social feeds behave the same way — a static preview is usually enough for the first paint.
- A facade that loads the vendor on **scroll** or **hover** still runs during a lab scroll; prefer explicit click or a deliberate in-view trigger.

### References

- https://developer.chrome.com/docs/lighthouse/performance/third-party-facades
- https://web.dev/articles/third-party-facades
- Overlaps: `third-party`, `js-unused`, `net-tree`, `cwv-cls`
