# Routing: insight → checkpoint

Deterministic lookup from a PageSpeed / Lighthouse insight or audit id to the checkpoint that owns it.

Use this **before** guessing from the insight's display name. Ids are stable and greppable; find the row, open `checkpoints/<checkpoint>.md`, and work that checkpoint only.

- One row per (insight, checkpoint) pair. A report item that needs two checkpoints has **two rows** — do both.
- `checkpoints.json` carries the same mapping, machine-readable and reverse-indexed.
- If an id here is missing, match on the insight display name against `checkpoints/*.md`, then add the row in the same change.

| Insight / audit id | Checkpoint |
|--------------------|------------|
| `layout-shift-culprits` | cwv-cls |
| `cls-culprits-insight` | cwv-cls |
| `largest-contentful-paint-element` | cwv-lcp |
| `lcp-breakdown-insight` | cwv-lcp |
| `lcp-discovery-insight` | lcp-discovery |
| `lcp-discovery-insight` | cwv-lcp |
| `lcp-lazy-loaded` | img-lazy |
| `lcp-lazy-loaded` | cwv-lcp |
| `prioritize-lcp-image` | cwv-lcp |
| `prioritize-lcp-image` | lcp-discovery |
| `preload-lcp-image` | cwv-lcp |
| `preload-lcp-image` | preload |
| `inp-breakdown-insight` | cwv-inp |
| `interaction-to-next-paint` | cwv-inp |
| `estimated-input-latency` | cwv-inp |
| `long-animation-frame` | cwv-inp |
| `long-animation-frame` | main-thread |
| `soft-navigation-insight` | cwv-inp |
| `document-latency-insight` | ttfb |
| `server-response-time` | ttfb |
| `redirects` | ttfb |
| `network-rtt` | ttfb |
| `network-server-latency` | ttfb |
| `uses-text-compression` | ttfb |
| `uses-text-compression` | total-byte-weight |
| `network-dependency-tree-insight` | net-tree |
| `critical-request-chains` | net-tree |
| `critical-request-chains` | preload |
| `uses-rel-preconnect` | net-tree |
| `render-blocking-insight` | css-js-block |
| `render-blocking-resources` | css-js-block |
| `first-contentful-paint` | css-js-block |
| `unused-css-rules` | css-unused |
| `unminified-css` | css-unused |
| `unused-javascript` | js-unused |
| `unminified-javascript` | js-unused |
| `no-document-write` | js-unused |
| `duplicated-javascript-insight` | js-duplicated |
| `legacy-javascript-insight` | legacy-js |
| `legacy-javascript` | legacy-js |
| `mainthread-work-breakdown` | main-thread |
| `long-tasks` | main-thread |
| `bootup-time` | main-thread |
| `total-blocking-time` | main-thread |
| `max-potential-fid` | main-thread |
| `uses-passive-event-listeners` | main-thread |
| `uses-passive-event-listeners` | cwv-inp |
| `dom-size-insight` | dom-size |
| `dom-size` | dom-size |
| `forced-reflow-insight` | reflow |
| `slow-css-selector` | css-selector |
| `image-delivery-insight` | img-delivery |
| `uses-responsive-images` | img-delivery |
| `modern-image-formats` | img-delivery |
| `uses-webp-images` | img-delivery |
| `efficient-animated-content` | img-delivery |
| `uses-optimized-images` | img-encode |
| `offscreen-images` | img-lazy |
| `unsized-images` | img-size |
| `total-byte-weight` | total-byte-weight |
| `network-requests` | total-byte-weight |
| `cache-insight` | cache |
| `uses-long-cache-ttl` | cache |
| `font-display-insight` | fonts |
| `font-display` | fonts |
| `third-parties-insight` | third-party |
| `third-party-summary` | third-party |
| `third-party-facades` | third-party-facades |
| `bf-cache-insight` | bf-cache |
| `bf-cache` | bf-cache |
| `no-unload-listeners` | bf-cache |
| `modern-http-insight` | http |
| `uses-http2` | http |
| `viewport-insight` | viewport-mobile |
| `non-composited-animations` | pattern-motion |

## Not routed (report and stop)

Comes up in reports but is deliberately outside this playbook's scope — say so instead of inventing a checkpoint:

- SEO / best-practice / accessibility audits (`is-on-https`, `meta-description`, `tap-targets`, image `alt`, contrast).
- `errors-in-console` / `valid-source-maps` — debugging aids, not CWV levers.
- Any id already marked **Stop** by its checkpoint (unowned CDN/hosting, required vendor, framework residual).
