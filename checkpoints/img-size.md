# img-size — Unsized images / width & height / aspect-ratio

```yaml
id: img-size
status: filled
owner: front
pass_bar: All content images reserve space (attrs or CSS aspect-ratio); CLS contribution from images ≈ 0
```

### Ownership

- **Front:** every `<img>` / framework image component / video poster dimensions.
- **Server:** image CDN that strips dimensions from HTML — fix template, not CDN.

### Stop here

Stop when all above-fold and layout-affecting images have stable boxes. Do not chase decorative CSS `background-image` (no width/height attrs) if the box is already sized by CSS. Overlaps `cwv-cls`; if CLS is good, this audit is done.

### What to check

- Missing `width`/`height` or conflicting utility classes.
- Lazy galleries with 0×0 intrinsic → browser thinks all fit in viewport and loads everything.

### How to fix

1. Set width/height matching display aspect (or `aspect-ratio` + one axis).
2. Keep lazy + dimensions together (`img-lazy`).
3. Prefer framework image components (`NuxtImg`, `next/image`, etc.) that emit width/height.

### References

- https://web.dev/articles/optimize-cls#images-without-dimensions
- Overlaps: `cwv-cls`, `img-lazy`
