# Orion artwork assets

These are deterministic WebP conversions of artwork approved by the owner for ASTRON. No new imagery, crop, frame, retouching, or invented detail was added in this conversion step. Original artist identities, creation methods of the original references, and external licensing status have not been established. Owner approval is recorded as project direction, not a claim of public-domain status or verified third-party rights.

## Shipped files

Paths are relative to `astron/public`.

| Asset | Dimensions | Bytes | Use |
| --- | --- | ---: | --- |
| `art/orion/cover-640.webp` | 640 × 853 | 143,616 | Smaller welcome artwork |
| `art/orion/cover-1280.webp` | 1086 × 1448 | 320,068 | Native-resolution welcome artwork |
| `art/orion/hunter.webp` | 403 × 530 | 26,040 | Decorative hunter illustration beside the scientific chart |

The cover source is 1086 × 1448 (3:4). The `1280` filename identifies the requested size tier, but the output deliberately stops at the source's native 1086 px width. Use **1086w**, not 1280w, in a responsive `srcset`. The 640 px version has the normal nearest-pixel ratio rounding. Preserve the full image with automatic height or contain fitting; a cover crop would omit approved artwork.

## Sources and credit wording

Welcome source:

`C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/astron-bible-plan/orion-visual-review/artwork/telescope-night-painting-unframed.png`

The approved welcome artwork is an **AI-assisted edit of the user's painting reference**. Its painterly appearance does not establish that the displayed result is wholly human-painted. It is artwork, not an astronomical photograph, and its decorative sky is not a star-position reference. Suggested credit: “Welcome artwork: owner-provided reference, AI-assisted adaptation; original artist unverified.”

Hunter source:

`C:/Users/iiii/.codex/visualizations/2026/10/13/01a13754-50db-75c3-a8e0-a38bf4362431/astron-bible-plan/orion-visual-review/artwork/orion-source-adaptations/orion-hunter-engraving-atlas.png`

This 403 × 530 approved plate is a **deterministic recolouring of an owner-provided image**. Its source file was `C:/Users/iiii/Downloads/303359724897054069.jpg`. The original artist and creation method are unknown. Suggested credit: “Orion illustration: owner-provided image, deterministically recoloured; original artist unverified.” The plate contains baked constellation lines and must remain a decorative illustration. Do not identify those marks as verified J2000 coordinates or stretch the figure to suggest a precise alignment with an independent scientific star chart.

## Transparent overlay evaluation

A technical blue-chroma extraction of the original 403 × 530 JPEG was inspected and rejected. A mask using `B - max(R,G)` to select blue pixels removed the black background and most white chart strokes, but blue JPEG fringes retained portions of the baked lines. Neutral-pixel removal also broke details in the figure. No transparent figure asset is shipped. Place the approved plate beside the independently positioned chart; an artist-layer source without baked constellation strokes would be needed for a clean overlay.

## Reproduce the conversion

From the `astron` folder in PowerShell:

```powershell
& 'C:/Users/iiii/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' scripts/prepare-orion-assets.cjs
```

The script uses the bundled Sharp module, resizes covers with `withoutEnlargement: true`, and preserves the hunter's dimensions. WebP settings: cover quality 84, hunter quality 90, effort 6. It prints actual dimensions and byte sizes after writing each file. No dependency installation is needed.

For another local checkout, pass alternate source and module locations using `--cover=PATH`, `--hunter=PATH`, and `--sharp=PATH`. Quote each complete argument when it contains spaces. Output always goes to the script's project-relative `public/art/orion` folder. Byte-for-byte reproduction requires the same Sharp/libvips encoder versions.

Both generated image types were opened and visually checked against their sources. The cover composition, border-free presentation, and hunter details were retained. No browser, application code, scientific data, or deployment was changed in this asset task.
