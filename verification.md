# Verification: measuring and proving a change

Every checkpoint has a `pass_bar`. This file is how you show a pass bar was actually met — without it, "improved" is an opinion.

## Absolute rules

1. **Measure the URL you own, on the environment you ship.** Lab runs on `localhost` are for diagnosis only; they inflate or deflate main-thread and style costs and are not evidence.
2. **Same URL, same device, before and after.** Mobile and desktop are separate results; never compare one to the other.
3. **Median of ≥ 3 runs, not the best run.** Cold cache, clean profile (no extensions). A single run is a coin flip.
4. **State the noise floor.** If the change is inside run-to-run variance, report **no measurable change** rather than a win. Lab scores commonly wander several points with no code change.
5. **Diagnose with lab, decide with field.** CrUX p75 is what users get; lab tells you why. Lab usually moves first and field lags over a rolling window — do not promise same-day field movement.
6. **One evidence node per finding.** Name the URL, element, or phase that proves it (the LCP element, the offending node, the slow phase). If you cannot point at it, you do not have a finding.

## Choose the measurement for the checkpoint

| Situation | Use |
|-----------|-----|
| Full report / audit ids / field + lab | PageSpeed Insights (web UI or the PSI API) |
| Repeatable, scriptable, compare two revisions | Lighthouse CLI or Lighthouse CI (`lhci`) |
| CPU/layout work, DevTools-only checkpoints (`css-selector`, `http`, forced-reflow stacks) | DevTools Performance, then the checkpoint's own method |
| Which interaction is actually slow (INP) | Field / RUM data; lab INP needs a recorded interaction |
| Cache, compression, protocol, redirects | Response headers and the Network panel / `curl -I` |

## Command recipes

PageSpeed Insights API (repeat a few times, take the median):

```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=URL&strategy=mobile" \
  | jq '.lighthouseResult.audits | {lcp: .["largest-contentful-paint"].numericValue,
                                   cls: .["cumulative-layout-shift"].numericValue,
                                   tbt: .["total-blocking-time"].numericValue}'
```

Lighthouse CLI, cold, mobile, three runs:

```bash
npx lighthouse URL --only-categories=performance \
  --chrome-flags="--headless --incognito" --output=json --output-path=./lh-run.json

# desktop instead of the default mobile preset
npx lighthouse URL --preset=desktop --only-categories=performance \
  --chrome-flags="--headless --incognito" --output=json --output-path=./lh-desktop.json
```

Lighthouse CI with budgets — this is how a pass bar stops regressing:

```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: { url: ['https://example.com/'], numberOfRuns: 3 },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

Headers (TTFB, compression, cache, protocol):

```bash
curl -sI https://example.com/ | grep -iE 'HTTP/|content-encoding|cache-control'
```

## Protocol per fix

1. Record the **baseline**: URL, device, date, median of the pass-bar metric, and the run-to-run spread.
2. Apply one checkpoint's fix only.
3. Re-run the **same** measurement, same conditions, ≥ 3 runs, take the median.
4. Compare against the checkpoint's `pass_bar` — not against the score alone.
5. **Smoke-test the product**: primary CTA, main nav, any form or authenticated path the change touched. A metric win that breaks a flow is a regression.
6. Report: checkpoint id, what changed, metric before → after (median), pass bar met?, deferred tradeoffs.
7. If the median did not move outside the noise floor, revert or park it and say so. Do not ship a "fix" you cannot measure.

## Stop conditions

Report and stop when:

- The remaining delay is **unowned** (CDN/hosting/DNS you do not control, required third party).
- The metric is already **inside the pass bar** — an insight can still list a node while the metric passes.
- The only way to move it further is a **product, design, or compliance** tradeoff; that needs sign-off, not a patch.

## Anti-patterns

- Declaring success from a score change in one run.
- Measuring behind auth with a different session/state than the baseline.
- Comparing a warmed cache against a cold one (or the reverse).
- Treating `localhost` lab numbers as production truth.
- Chasing an insight that passes, or that is `devtools-only` and absent from PSI.
- Re-measuring a different URL, template, or locale than the one that was fixed.
