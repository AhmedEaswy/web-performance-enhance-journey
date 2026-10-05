# cache — Use efficient cache lifetimes

```yaml
id: cache
status: filled
owner: both
pass_bar: Cacheable subresources ≥ 30 days (2592000s); prefer ~1 year for hashed/static assets
```

### Ownership

- **Front:** use hashed URLs and the image optimizer so the browser hits cacheable first-party URLs; don’t bypass the optimizer.
- **Server/CDN/object storage:** `Cache-Control` on objects and routes — **only place that sets TTL for direct bucket URLs**.

### Stop here

Stop **front** work when HTML already points at long-TTL first-party URLs and remaining short-TTL is **third-party** (analytics) or **HTML/API** (must stay short). If the user **owns** origin/CDN/object storage: set `Cache-Control` there (How to fix). You cannot lengthen bucket TTL from markup alone if the browser still requests the raw bucket URL — rewrite to first-party/optimizer URLs (`img-delivery`) **and** set headers on the owned store.

### What to check

- Insight **Use efficient cache lifetimes**.
- Short TTL on object storage; missing long TTL on hashed bundles, image optimizer routes, fonts.
- Short-TTL injected third-party scripts.

### How to fix

1. Framework `routeRules` / CDN: `max-age=31536000, immutable` for hashed assets.
2. Image optimizer: long `maxAge` + ignore upstream Cache-Control when appropriate; allowlist domains.
3. Ops: object storage / CDN Cache-Control if anything still hits the bucket.
4. Never long-cache HTML/auth API.

### References

- https://developer.chrome.com/docs/performance/insights/cache
- https://web.dev/articles/http-cache
