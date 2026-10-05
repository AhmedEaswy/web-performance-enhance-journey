# dom-size — Avoid large DOM size

```yaml
id: dom-size
status: filled
owner: front
pass_bar: Warn ~&gt;800 body nodes; error ~&gt;1,400; prefer virtualize / defer offscreen nodes
```

### Ownership

- **Front:** render less, virtualize lists, defer below-fold DOM, flatten wrappers.
- **Server:** SSR should not emit entire infinite scroll HTML at once — paginate/stream.

### Stop here

Stop when the page **genuinely needs** a large interactive tree (spreadsheet, long editor) and you’ve already windowed offscreen rows + simplified selectors. Further node-shaving that breaks a11y/SEO lists is not worth a lab warning.

### What to check

- Lighthouse **Avoid an excessive DOM size** (nodes, depth, max children).
- Hidden tabs/accordions still fully in DOM.
- Large marketing pages with nested wrappers.

### How to fix

1. Create nodes on demand; destroy when unused.
2. Virtual scrolling for long lists (`react-window`, etc.).
3. Don’t SSR thousands of cards — paginate or infinite-load.
4. Simplify CSS selectors if DOM must stay large (`css-selector`).
5. `content-visibility: auto` for offscreen sections (INP/render).

### References

- https://developer.chrome.com/docs/lighthouse/performance/dom-size
- https://web.dev/articles/dom-size-and-interactivity
