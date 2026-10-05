# css-selector — CSS selector costs (recalculate style)

```yaml
id: css-selector
status: filled
owner: front
devtools-only: true
pass_bar: Informational — insight always “passes”; reduce high elapsed-time + high slow-path selectors when Recalculate Style is hot
```

### Ownership

- **Front:** simpler selectors, fewer rules, smaller/shallower DOM.
- **Server:** N/A.
- **Not in PageSpeed Insights** — DevTools Performance only, with **Enable CSS selector stats (slow)** on.

### Stop here

Stop when Recalculate Style is no longer a top long-task contributor, or when hottest selectors are unavoidable design-system primitives and **DOM size** is the real lever (`dom-size`). Measuring with selector stats **on** adds overhead — turn the setting off after diagnosis. Do not chase this from PSI alone (it will not appear).

### What to check

- DevTools Performance → Insights → **CSS selector costs**.
- Selectors with **high elapsed time** and **high slow-path %**.
- Deep selectors (`ul li a span`), universal/expensive combinators, huge rule counts on large DOMs.

### How to fix

1. Prefer class-based, shallow selectors over deep descendant chains.
2. Fewer rules; avoid broad selectors that match huge subtrees.
3. Shrink/flatten DOM (`dom-size`); `content-visibility` for offscreen.
4. After INP/style issues, re-profile with selector stats enabled briefly.

### Hint / example (optional)

- If style recalc dominates INP presentation delay, profile selectors before rewriting feature JS.
- Source insight: always passes; informational only.

### References

- https://developer.chrome.com/docs/performance/insights/slow-css-selector
- https://developer.chrome.com/docs/devtools/performance/selector-stats
- https://web.dev/articles/reduce-the-scope-and-complexity-of-style-calculations
