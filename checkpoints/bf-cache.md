# bf-cache — Back/forward cache eligibility

```yaml
id: bf-cache
status: filled
owner: both
pass_bar: Page is eligible for back/forward cache; no unload handlers, no no-store, no open connection blocking it
```

### Ownership

- **Front:** lifecycle handlers (`unload` / `beforeunload`), connection and timer teardown, client-side code that must re-sync on restore.
- **Server:** `Cache-Control` on the document **and** on subresources (`no-store` / `no-cache` blocks it), main-resource status codes.

### Stop here

Stop when the remaining blocker is a **required third party** holding the page (payment / auth / chat SDK with an open connection) and product will not swap it, or when the page **deliberately** opts out (checkout, banking-style flows where storing the page is a security decision). A deliberate opt-out is a **product decision, not a bug** — record it and stop.

### What to check

- Lighthouse **Page prevented back/forward cache restoration**, with the listed blocking reasons.
- DevTools → Application → **Back/forward cache** → Test, then navigate away and back.
- Console messages on restore failing to reuse the page.
- Framework **dev servers commonly send `no-store`** — confirm on a production build before fixing anything.

### How to fix

1. Replace `unload` / `beforeunload` listeners with `pagehide` / `visibilitychange`.
2. Do not set `no-store` / `no-cache` on the document or its subresources for cacheable routes; return a cacheable status for the main resource.
3. Close or pause open connections (WebSocket, WebRTC, long-poll) on `pagehide`, and reconnect lazily on `pageshow`.
4. Make state restore safe: re-sync clocks/timers on `pageshow` (restored pages resume with stale timers), and avoid a single-use init path that only runs on first load.
5. Audit embedded widgets for background connections — they can block the whole page even when your own code is clean.

### Hint / example (optional)

- Dev-only `no-store` is the most common false lead: the insight disappears once measured on a production build.
- A restored page is a **resume**, not a reload: effects that assumed "runs once per document" must still be correct after restore.
- Third-party embeds that keep a socket open block bf-cache for the host page; that is `third-party` work, not a front lifecycle bug.

### References

- https://web.dev/articles/bfcache
- https://developer.chrome.com/docs/lighthouse/performance/bf-cache
- Overlaps: `cache`, `third-party`
