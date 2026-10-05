# http — Modern HTTP (HTTP/2 / HTTP/3)

```yaml
id: http
status: filled
owner: server
devtools-only: true
pass_bar: Origins that serve ≥6 static assets use HTTP/2 or HTTP/3 (not HTTP/1.1). Not shown in PageSpeed Insights
```

### Ownership

- **Server / CDN / load balancer only.**
- **Front:** no code change fixes HTTP/1.1 on the origin.

### Stop here

**Not fixable from front-end app code alone.** If the user **owns** hosting/CDN/load balancer: enable h2/h3 (How to fix). If they do not own the terminator, escalate once and stop. Ignore on localhost/CI (insight excludes localhost). If PSI never shows it, don’t invent work from this insight alone — confirm in DevTools.

### What to check

- DevTools insight **Modern HTTP**: HTTP/1.1 resources from busy static origins (≥6 assets).
- Multiplexing benefits matter when many assets share a host.

### How to fix

1. Enable HTTP/2 and preferably HTTP/3 (QUIC) on CDN/origin TLS terminator.
2. Serve static assets through that CDN.
3. Confirm in DevTools Network Protocol column.

### References

- https://developer.chrome.com/docs/performance/insights/modern-http
- https://web.dev/articles/introduction-to-http2
