# img-encode — Efficiently encode / compress images

```yaml
id: img-encode
status: filled
owner: both
pass_bar: Same as img-delivery for compression factor; no oversized lossless where lossy is acceptable
```

### Ownership

- **Front:** build scripts (Squoosh/ImageMagick), framework image optimizer `quality`/`format`.
- **Server:** CDN compression policies, master asset pipeline in CMS/storage.

### Stop here

Stop when further quality reduction is a **design/brand decision**, or assets are already AVIF/WebP at sensible quality. Encoding alone will not fix LCP **resource load delay**.

### What to check

- Overlap with **Improve image delivery** “increase compression factor.”
- Huge PNG icons; unoptimized uploads from CMS.

### How to fix

1. Re-encode with ImageOptim / Squoosh / imagemin / optimizer quality.
2. Set default optimizer quality in framework config.
3. Enforce CMS upload max dimensions server-side if editors upload 4K heroes.

### Hint / example (optional)

- Overlaps `img-delivery`. When quality knobs barely move size, check for **expensive alpha** (soft glows) and flatten onto the real page background first — often ~100 KiB → ~few KiB.

### References

- https://developer.chrome.com/docs/performance/insights/image-delivery
- https://web.dev/articles/compress-images
