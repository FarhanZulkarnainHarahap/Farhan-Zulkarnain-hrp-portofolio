# Audit keamanan dependensi production (Fase K4)

Tanggal: 2026-11-28. Sumber: `npm audit --omit=dev --json` pada lockfile commit Fase K3 (`f7cacf6`). Jumlahnya identik dengan
Fase 2 dan K3: tidak ada temuan baru yang berasal dari pustaka K3/K4.
Tidak ada `npm audit fix --force` dan tidak ada upgrade yang dijalankan di fase ini.

## Ringkasan

| Paket | Severity | Jalur dependensi | Dipakai di runtime? | Dapat dieksploitasi di situs ini? | Perbaikan |
|---|---|---|---|---|---|
| `next` 16.2.4 | critical | langsung | Ya (server dan client) | **Ya, sebagian.** Lihat di bawah | `next` 16.4.6 (bukan major) |
| `sharp` 0.34.5 | high | `next` → `sharp` | Ya (Image Optimization di server) | Mungkin. Gambar remote dari `res.cloudinary.com/**` didekode libvips/libheif/librsvg | ikut `next` 16.4.6 (sharp ≥ 0.35.5) |
| `postcss` 8.4.31 | high | `next` → `postcss` | Tidak, hanya build CSS | Tidak. Input-nya CSS milik repo sendiri, bukan input pengguna | ikut `next` 16.4.6 |
| `nanoid` 3.3.11 | high | `next` → `postcss` → `nanoid` | Tidak, hanya build | Tidak. Ukuran ID tidak dikendalikan penyerang | ikut `next` 16.4.6 |
| `source-map-js` 1.2.1 | high | `next` → `postcss` → `source-map-js` | Tidak, hanya build | Tidak. Source map milik sendiri | ikut `next` 16.4.6 |
| `baseline-browser-mapping` 2.10.21 | moderate | `next` → `baseline-browser-mapping` | Tidak, hanya build | Tidak | ikut `next` 16.4.6 |

## `next` 16.2.4: rincian yang relevan

Advisory pada rentang terpasang (range ≥ 16.0.0 < 16.2.5 … ≤ 16.4.4). Yang **berlaku** untuk situs ini:

| Advisory | Kondisi | Situs ini |
|---|---|---|
| GHSA-2xp9-vwfh-vxw4 (RCE, Image Optimization, AVIF), GHSA-2464-fhr4-w9xw (RCE, Image Optimization, SVG), GHSA-7qx7-33qx-rqx2 (bypass penolakan SVG), GHSA-cjq9-62q9-8jv4 (SSRF), GHSA-h64f-5h5j-jqjh / GHSA-q8wf-6r8g-63ch (DoS) | Image Optimization API aktif | **Berlaku.** `images.formats` memuat AVIF, dan `remotePatterns` mengizinkan `https://res.cloudinary.com/**`, yaitu **akun Cloudinary mana pun**. Penyerang bisa menaruh berkas buatannya di Cloudinary sendiri lalu meminta `/_next/image?url=…`. |
| GHSA-vcvr-r3jv-pc5j (RCE di `next/og` ImageResponse) | memakai `next/og` | **Berlaku.** `opengraph-image.tsx` (root dan `/projects/[slug]`) lewat `src/lib/og/render.tsx`. Input judul berasal dari API sendiri, sehingga eksploitasi butuh kendali atas data API. Namun rentang versinya cocok. |
| GHSA-492v-c6pp-mqqv, GHSA-267c-6grr-h53f, GHSA-26hh-7cqf-hhc6, GHSA-6gpp-xcg3-4w24 (bypass Middleware/Proxy) | `proxy.ts` menjaga rute | **Berlaku.** `proxy.ts` menjaga `/dashboard` dan `/admin` (role ADMIN). Bypass bisa menampilkan UI admin tanpa login. Data admin tetap butuh JWT dari backend, tetapi UI dan alur yang terekspos tetap risiko. |
| Cache poisoning RSC / SSG / ISR (GHSA-vfv6, GHSA-wfc6, GHSA-4jqv, GHSA-mcj8) | self-hosted dengan cache | Mungkin, tergantung hosting. |
| GHSA-8h8q-6873-q5fj (DoS Server Components) | App Router | Berlaku (DoS). |

**Tidak berlaku** (fiturnya tidak dipakai, dicek dengan `grep` di `src/`):

- Server Actions dan `"use server"` (GHSA-m99w, GHSA-89xv, GHSA-4c39, GHSA-p3m5).
- `use cache` (GHSA-673q, GHSA-vc7v, GHSA-rhh4).
- CSP nonce (GHSA-ffhc) dan skrip `beforeInteractive` (GHSA-gx5p).
- Pages Router i18n (GHSA-36qx), WebSocket upgrade (GHSA-c4j6), Edge runtime (GHSA-f3mh).
- RCE khusus server Windows (GHSA-p293): server Linux/Vercel.
- Endpoint MCP dev server (GHSA-39w2): hanya development.

## Kesimpulan dan rekomendasi

**Ada risiko kritis yang dapat dieksploitasi** (RCE/SSRF di Image Optimization dengan sumber Cloudinary terbuka, RCE `next/og`, dan
bypass Proxy). Sesuai brief, ini **dilaporkan sebelum deployment berikutnya**:

1. **Upgrade `next` 16.2.4 → 16.4.6** beserta `eslint-config-next` yang sepadan. Ini upgrade minor dalam major yang sama, dan
   menutup semua advisory di atas termasuk sharp, postcss, nanoid, source-map-js, dan baseline-browser-mapping. Harus dijadikan
   langkah tersendiri dengan regresi penuh (`npm ci`, lint, build, `test:fast`, admin-visual), karena menyentuh seluruh aplikasi.
   Tidak dijalankan di K4 tanpa persetujuan.
2. **Mitigasi sementara**, perlu izin karena menyentuh `next.config.ts`: persempit `remotePatterns.pathname` ke akun Cloudinary
   milik pemilik (`/<cloud-name>/**`), atau matikan AVIF di `images.formats`.
3. Bila hosting di Vercel: Image Optimization dijalankan infrastruktur Vercel, tetapi `next/og` dan proxy tetap kode aplikasi.
   Upgrade tetap diperlukan.

Tidak ada temuan dari pustaka 3D/animasi (three, R3F, drei, postprocessing, maath, Theatre, GSAP, Lenis, motion).
