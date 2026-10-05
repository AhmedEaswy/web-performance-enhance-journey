# ttfb — Document request latency / TTFB

```yaml
id: ttfb
status: filled
owner: server
pass_bar: Insight — avoid redirects; server response ≤ 600ms; document compressed. CWV TTFB good ≤ 800ms (includes DNS + redirects)
```

### Ownership

- **Server / CDN / hosting (primary):** redirects, app SSR time, DB, cache, compression (`Content-Encoding`), edge cache.
- **Front:** only reduce SSR work (smaller queries, streamed HTML, avoid giant sync renders) when you own the app server / Node (or equivalent) code.

### Stop here

**Front-only CSS/JS will not fix pure TTFB.** Stop front work when the lever is origin/CDN. If the user **owns** the server/CDN: apply How to fix below (redirects, compression, SSR/DB, edge cache). Stop entirely when latency is **geo DNS / cold edge / hosting tier you cannot change**, or origin already compresses, has no app-controlled redirects, and remaining delay is upstream you do not control. Note: insight’s **600ms** server time ≠ CWV **800ms** TTFB (TTFB includes DNS + redirects).

### What to check

- Insight **Document request latency**: redirects, &gt;600ms server response, uncompressed document.
- Cross-host www/apex redirects; http→https chains.
- Missing `Content-Encoding: br|gzip|zstd` on HTML.
- Blocking DB / upstream awaits on the document path before first byte.

### How to fix

1. Eliminate redirects; link to final URLs; responsive site instead of m-dot redirects.
2. Speed SSR: cache full page at CDN when personalized HTML allows; optimize DB; stream HTML (`renderToNodeStream` / framework streaming).
3. Enable compression on the server/CDN.
4. CDN closer to users for cacheable HTML.
5. Trim or parallelize queries and upstream calls that gate the HTML response; avoid sync fan-out before first byte.

### References

- https://developer.chrome.com/docs/performance/insights/document-latency
- https://web.dev/articles/ttfb
