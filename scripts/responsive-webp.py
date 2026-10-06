#!/usr/bin/env python3
"""Create WebP srcset candidates while keeping the source untouched.

Requires Pillow with WebP support: python -m pip install Pillow
"""

import argparse
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageOps, features


def psnr(reference, encoded):
    reference = reference.convert("RGBA")
    encoded = encoded.convert("RGBA")
    histogram = ImageChops.difference(reference, encoded).histogram()
    mse = sum((value % 256) ** 2 * count for value, count in enumerate(histogram)) / (
        reference.width * reference.height * 4
    )
    return math.inf if mse == 0 else 10 * math.log10(255**2 / mse)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="One JPEG or PNG source image")
    parser.add_argument("--out", required=True, type=Path, help="Output directory")
    parser.add_argument("--widths", default="320,640,960,1280", help="Comma-separated pixel widths")
    parser.add_argument("--quality", type=int, default=88, help="WebP quality, 1-100 (default: 88)")
    parser.add_argument("--min-psnr", type=float, help="Optional minimum decoded PSNR in dB")
    parser.add_argument("--lossless", action="store_true", help="Require pixel-identical output at each resized width")
    args = parser.parse_args()

    if not features.check("webp"):
        parser.error("This Pillow build has no WebP support")
    if args.source.suffix.lower() not in {".jpg", ".jpeg", ".png"} or not args.source.is_file():
        parser.error("source must be an existing JPEG or PNG file")
    if not 1 <= args.quality <= 100:
        parser.error("quality must be between 1 and 100")
    if args.min_psnr is not None and (not math.isfinite(args.min_psnr) or args.min_psnr < 0):
        parser.error("min-psnr must be nonnegative")
    try:
        widths = sorted({int(part.strip()) for part in args.widths.split(",")})
        if not widths or widths[0] <= 0:
            raise ValueError
    except ValueError:
        parser.error("widths must be a comma-separated list of positive integers")

    with Image.open(args.source) as original:
        if getattr(original, "is_animated", False):
            parser.error("animated images require a separate workflow")
        icc = original.info.get("icc_profile")
        source = ImageOps.exif_transpose(original)
        source.load()
        source = source.convert("RGBA" if "A" in source.getbands() or "transparency" in source.info else "RGB")

    widths = [width for width in widths if width <= source.width]
    if not widths:
        parser.error(f"all requested widths exceed the source width ({source.width}px); refusing to upscale")
    targets = [args.out / f"{args.source.stem}-{width}w.webp" for width in widths]
    existing = [str(target) for target in targets if target.exists()]
    if existing:
        parser.error("output already exists; refusing to overwrite: " + ", ".join(existing))
    args.out.mkdir(parents=True, exist_ok=True)

    for width, target in zip(widths, targets):
        height = max(1, round(source.height * width / source.width))
        resized = source.resize((width, height), Image.Resampling.LANCZOS)
        options = {"format": "WEBP", "method": 6, "lossless": args.lossless}
        if not args.lossless:
            options["quality"] = args.quality
        elif resized.mode == "RGBA":
            options["exact"] = True
        if icc:
            options["icc_profile"] = icc
        try:
            resized.save(target, **options)
            with Image.open(target) as decoded:
                decoded.load()
                score = psnr(resized, decoded)
            if (args.lossless and not math.isinf(score)) or (
                args.min_psnr is not None and score < args.min_psnr
            ):
                target.unlink()
                raise RuntimeError(f"{target}: quality check failed (PSNR {score:.1f} dB)")
            print(f"{target}: {width}x{height}, {target.stat().st_size} bytes, PSNR {score:.1f} dB")
        except Exception:
            if target.exists():
                target.unlink()
            raise

    print("Review each variant at its intended display size before replacing image URLs.")


if __name__ == "__main__":
    main()
