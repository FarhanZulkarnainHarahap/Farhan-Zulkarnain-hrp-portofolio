# Fonts for the Fz card (Blender)

Source fonts for the text that was converted to mesh in `design/blender/portfolio-3d.blend`
(scene `Card`). They are not loaded by the website.

| File | Family | Used for | License |
|---|---|---|---|
| `Newsreader-Regular.ttf` | Newsreader 400 (same as the site H1) | Monogram F and z | SIL OFL 1.1, `OFL-Newsreader.txt` |
| `GeistMono-Regular.ttf` | Geist Mono 400 (`--font-meta`) | Engraved "MEDAN, INDONESIA" and "UTC+7" | SIL OFL 1.1, `OFL-GeistMono.txt` |

Both are the latin subsets from Fontsource (`@fontsource/newsreader@5.3.0`,
`@fontsource/geist-mono@5.3.0`) already in `src/assets/og/`, converted losslessly from WOFF to
TTF (WOFF tables decompressed, no glyph changes) because Blender reads TTF/OTF. They are unmodified
apart from the container format and keep their original names and copyright notices.
