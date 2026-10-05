# third-party — Third-party code / origins

```yaml
id: third-party
status: filled
owner: both
pass_bar: Minimize third-party transfer + main-thread time; prefer same-origin for first-party media; defer non-critical third-party JS
```

### Ownership

- **Front:** don’t hotlink media; defer tags; consent-gate tags.
- **Server/ops:** CSP, tag manager container, CDN/custom domain for media.

### Stop here

Stop when first-party media is on the image optimizer (or same host) and remaining third parties are **required** analytics/payments/chat with no lighter alternative approved by product. You cannot “fix” a vendor’s main-thread cost in app CSS. If the user **owns** tag-manager / consent / proxy config, defer or consent-gate there before accepting residual.

### What to check

- PSI **3rd parties**: JS cost vs media bandwidth (0 ms main thread ⇒ mostly bytes/connection).
- Raw object-storage hosts in `src`/`srcset`.

### How to fix

1. Allowlist image hosts + framework image component → same-origin optimizer (`cache`).
2. Defer/consent third-party JS.
3. Optional: CDN on the site hostname.

### Hint / example (optional)

- Shared image-domain allowlist from config defaults + env + API URL hosts.

### References

- https://developer.chrome.com/docs/performance/insights/third-parties
- https://web.dev/articles/tag-best-practices
