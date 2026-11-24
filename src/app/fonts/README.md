# Web fonts (Fase 12.1)

Subsets of the Google Fonts files, made with fontTools (`varLib.instancer` + `pyftsubset`, woff2):

| File | Source | Axes kept | Size |
|---|---|---|---|
| `newsreader-400.woff2` | Newsreader (variable wght + opsz) | wght = 400, opsz 18–72 | 37.7 KB |
| `newsreader-500.woff2` | Newsreader | wght = 500, opsz 18–72 | 39.5 KB |
| `geist.woff2` | Geist (variable wght) | wght 400–700 | 18.8 KB |
| `geist-mono.woff2` | Geist Mono (variable wght) | wght 400–500 | 13.6 KB |

Characters: Basic Latin + Latin-1, Œœ ı, modifier quotes, General Punctuation, €, ™, arrows
U+2190–2199, minus, ⌘ (Geist), ● ✓ (Geist). Anything else (e.g. non-Latin project titles from the
API) falls back to the system stack in `--stack-*`.

Licence: SIL Open Font License 1.1 (`OFL-Newsreader.txt`, `OFL-Geist.txt`). Neither font declares a
Reserved Font Name, so the subsets keep their family names (OFL §3 only restricts RFNs).
Newsreader was 129 KB (wght 200–800 + opsz), Geist 28.6 KB, Geist Mono 22.6 KB.
