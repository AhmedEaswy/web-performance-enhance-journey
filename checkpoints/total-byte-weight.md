# total-byte-weight — Total page weight / payload budget

```yaml
id: total-byte-weight
status: filled
owner: both
pass_bar: Total transferred bytes stay inside an explicit per-route budget; no single resource dominates the page
```

### Ownership

- **Front:** which assets a route requests, encoding and dimensions, splitting.
- **Server/CDN:** compression on text, cache headers so repeat views transfer ~0, and any injected bytes.

### Stop here

Stop when the remaining weight is **required product content** (real media the page exists to show, approved third parties) and the route has an agreed budget. Do not delete content, features, or required media to move a byte number — route the biggest contributors to the specific checkpoint instead.

### What to check

- Lighthouse **Avoid enormous network payloads**: total size and the transfer breakdown by resource type.
- The top few resources — usually a small set dominating everything else.
- Which portion is **unused JS / unused CSS** versus genuinely needed assets.
- Whether compression is actually applied to text (an uncompressed document or bundle inflates the total without changing source).
- Duplicate or double-served assets (same bytes from two hosts, or a preload plus a second fetch).

### How to fix

1. Attribute the top contributors, then fix them at the right layer: media → `img-delivery` / `img-encode`, JS → `js-unused` / `js-duplicated`, CSS → `css-unused`, fonts → `fonts`, embeds → `third-party-facades`.
2. Enable `br` / `gzip` / `zstd` for text responses; note compression does nothing for already-encoded media.
3. Confirm long-TTL caching so repeat views stop re-transferring the same bytes (`cache`).
4. Write the budget down and enforce it (CI budget or a performance contract) so weight does not creep back after release.
5. Prefer loading non-critical weight later (lazy, interaction, route split) over removing it.

### Hint / example (optional)

- On most marketing/landing routes **images dominate**, then JS, then fonts — check in that order.
- A huge total is usually a **symptom report**, not a root cause: it points at which other checkpoint deserves the work.
- Watch for the same asset served twice from two hosts after a migration — it doubles bytes and can hide behind good per-resource numbers.

### References

- https://developer.chrome.com/docs/lighthouse/performance/total-byte-weight
- https://web.dev/articles/total-byte-weight
- Overlaps: `img-delivery`, `js-unused`, `cache`, `third-party`
