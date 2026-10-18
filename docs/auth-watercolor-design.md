# Authentication watercolor assets

The user-provided light/dark mockups guided the background composition and glass forms. The production forms and logo are real HTML/SVG, never baked into the artwork. The canonical logo geometry and fig are preserved; the pen nib keeps its original creamy fill in both themes. Dark leaf fills use the established light-olive brand tint for contrast.

## Saved assets

- `src/assets/auth-watercolor-light.jpg` — 1536×1024, 265,118 bytes.
- `src/assets/auth-watercolor-dark.jpg` — 1536×1024, 343,524 bytes.

Generated with the built-in image-generation tool, then JPEG-encoded at quality 90 without resizing. No CLI/API generation or new runtime dependency was used. Original generated PNGs remain in the generator's output directory; existing scenic project assets were not overwritten.

## Final prompts

### Light

Use case: stylized-concept. Asset type: production website background ONLY, landscape 1536x1024. Primary request: recreate the quiet watercolor paper background aesthetic of the user's cream InkFig login reference, with NO interface, NO card, NO logo, NO lettering. Warm ivory cream #f7f3d9 handmade watercolor paper with very subtle grain. Broad organic diagonal wet watercolor washes of muted olive #617d2b and pale sage concentrated at the lower-left corner and upper-right corner, delicate irregular watercolor edges and pigment granulation. The central 55% of the canvas is mostly clean soft cream negative space for a form that will be added in code. Elegant, simple, restrained, light and airy, same composition zone as the supplied reference. No pens, objects, scenery, text, symbols, borders or watermark.

### Dark

Use case: stylized-concept. Asset type: production website background ONLY, landscape 1536x1024. Primary request: dark-theme counterpart to the user's InkFig watercolor login reference, NO interface, NO card, NO lettering or logo. Deep forest olive #10140c watercolor paper, subtle handmade paper grain. Broad organic diagonal wet watercolor washes of muted olive #617d2b and pale olive #a9b65f concentrated in lower-left and upper-right corners. Irregular pigment granulation and softly feathered watercolor edges. Central 55% mostly quiet deep green negative space for a form added in code. Elegant, simple, restrained, sophisticated dark green, not black. No pens, objects, scenery, symbols, borders or watermarks.

## Verification notes

Headless Edge renders reviewed: desktop sign-in in both themes, Arabic registration, true 390px iframe login/reset layouts, and a wide-image/taller-information-column artwork fixture. The interactive browser helper could not start because of the Windows sandbox lock error. Physical-device behavior was not tested. Temporary theme/media fixtures are not production code or committed build output.
