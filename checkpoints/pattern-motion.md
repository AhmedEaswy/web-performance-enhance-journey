# pattern-motion — Animation CLS-safety

```yaml
id: pattern-motion
status: filled
owner: front
pass_bar: Motion uses transform/opacity (or equivalent compositor props); no layout-property animation on visible content
```

### Ownership

- **Front.**
- **Server:** N/A.

### Stop here

Stop when animations are compositor-only and `prefers-reduced-motion` is respected. Design requests that require animating `height` must use reserved max space or accept CLS — escalate to design.

### What to check

- Animating `top`/`left`/`width`/`height`/`margin` on visible nodes.
- Enter/leave transitions that collapse height without reservation.

### How to fix

1. Use `transform: translate/scale` and `opacity`.
2. Honor `prefers-reduced-motion`.
3. If height must change, reserve space or animate within a fixed box.

### References

- https://web.dev/articles/cls#animations-and-transitions
- Overlaps: `cwv-cls`
