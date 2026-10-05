# net-tree — Network dependency tree

```yaml
id: net-tree
status: filled
owner: both
pass_bar: Shorten critical chains; remove unnecessary critical JS/CSS; preconnect ≤4 only when PSI lists candidates
```

### Ownership

- **Front:** blocking CSS/JS chains, discoverability.
- **Server/CDN:** injected scripts (edge email obfuscation), edge headers, preconnect at CDN if used.

### Stop here

Stop adding preconnects when PSI says **no additional candidates**. Stop front work when the remaining chain head is **document TTFB** or a **CDN-injected** script — fix via `ttfb` / CF Scrape Shield, not bundler.

### What to check

- Max critical path latency + chain list.
- CF `/cdn-cgi/.../email-decode.min.js`.
- Component CSS chunks on the critical path.

### How to fix

1. Cut/defer non-critical JS/CSS.
2. Move scoped CSS to global critical bundle.
3. Avoid SSR emails or disable Email Obfuscation; purge cache.
4. Preconnect only PSI candidates (≤ ~4).

### Hint / example (optional)

- Client-side mailto instead of server-obfuscated emails; mid-page scoped CSS → shared critical stylesheet.

### References

- https://developer.chrome.com/docs/performance/insights/network-dependency-tree
- https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
