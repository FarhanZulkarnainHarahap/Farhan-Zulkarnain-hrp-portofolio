# Audit Fase 1 — Redesign "FARHAN — KINETIC SYSTEMS" (3D imersif)

Tanggal: 2026-11-27. Branch: `redesign/professional` (keputusan pemilik: tetap di branch ini).
Keputusan pemilik: **master prompt Kinetic Systems menggantikan arah "Quiet Editorial"**
(CLAUDE.md diperbarui di fase ini). Setiap fase berhenti untuk persetujuan.

## 1. Kondisi awal

| Hal | Temuan |
|---|---|
| Root git | `web/` (bukan folder induk; `.git` induk kosong). 263 commit. |
| Stack | Next.js 16.2.4 (Turbopack, `proxy.ts`), React 19.2.4, Tailwind 4, TypeScript 5, Node 20. |
| Animasi terpasang | `gsap` 3.15.1 (+CustomEase, SplitText; **tanpa** ScrollTrigger), `@gsap/react`, `framer-motion` 12 (hanya dashboard). Tidak ada three / R3F / Theatre / Lenis / maath di `package.json` (`node_modules/@react-three` sisa yatim). |
| Desain aktif | DESIGN.md "Quiet Editorial": kanvas kertas terang, serif Newsreader, Geist, satu aksen terakota, tema gelap lengkap. |
| 3D aktif | Hanya **video/poster pra-render Blender** (`public/3d/` 18 MB: `entrance/`, `flight/` fly-through 12 klip × 2 tema × desktop/mobile, `card/`). three.js dihapus di Fase 10.5. |
| Blender | `design/blender/portfolio-3d.blend`, `portfolio-3d-interactive.blend` (ada perubahan belum di-commit — dibiarkan, milik pemilik). |
| Dokumen | README, DESIGN.md, docs/{3D_PLAN, COPY, CREDITS, MOTION_PLAN, PAGE_MAP, QA_REPORT, REDESIGN_AUDIT}.md. `KINETIC_REDESIGN.md` **tidak ada** (sudah dihapus). README masih menyebut HeroModel three.js yang sudah dihapus (basi). |

## 2. Rute

Publik (grup `(site)`, frame `SiteChrome`): `/`, `/about`, `/journey`, `/projects`, `/projects/[slug]`, `/contact`.
`/about/detail|skills|docs` → **redirect 308** ke `/about#profile|#stack|#documents` (next.config.ts);
master prompt menyebut halaman terpisah, tetapi struktur sekarang adalah satu halaman `/about` bersection.
Auth: `/auth/login`, `/auth/register`. Admin: `/dashboard/admin/{home,skill,skill/manage,portofolio,portofolio/upload,experience,document,document/upload}` (alias rewrite `/admin/*`), `/dashboard/user`.
API route: `/api/public/[resource]` (proxy GET whitelist), `/api/documents/download`, `/api/documents/[slug]/download`.
SEO: `sitemap.ts`, `robots.ts`, OG/Twitter image per rute, JSON-LD Person/WebSite di root layout.

## 3. Data (asli, tidak boleh dikarang)

- Skill dari API (21, per 2026-11-27): FRONTEND React, Next.js, Tailwindcss, CSS, redux · BACKEND Node.js,
  Express, Nestjs, Bun, Postgresql, MongoDB, Prisma, Supabase · TOOLS TypeScript, JavaScript, Docker, Github,
  Visualstudio · OTHERS AWS, Vercel, Figma. **Tidak ada** MySQL / Git / REST API → tidak dipakai di orbit.
- Orbit hero: cincin 1 = FRONTEND, cincin 2 = BACKEND, cincin 3 = TOOLS + OTHERS — semuanya dibaca dari API
  saat render server (`getHomeContent`), bukan daftar hardcode. Ikon lewat `skill-icon-resolver.ts` (react-icons).
- Lapisan data DILARANG diubah (CLAUDE.md): `services/api.ts`, `lib/api-*`, `lib/portfolio/**`, resolver ikon,
  `app/api/**`, `proxy.ts`, `.env*`. Server render via `lib/server/content.ts` + fallback `ServerCollection`.

## 4. Komponen yang dapat dipakai ulang

`components/ui/*` (button, card, badge, field, section, container, skeleton, empty/error-state, skill-icon,
tooltip, theme-toggle), `components/site/*` (header, footer, mobile menu, ⌘K palette, PageHeader,
ServerCollection, StatusPage), `components/motion/MotionController.tsx` (reveal IO), `lib/gsap.ts`
(token motion + reduced motion), `components/media/ThemedPicture.tsx`, `components/projects/flip.ts`,
`hooks/useCollection.ts`, `lib/display/*` (formatter data).

## 5. Kompatibilitas pustaka baru (npm view, 2026-11-27)

| Paket | Versi | Peer | Status |
|---|---|---|---|
| three | 0.187.0 | — | OK |
| @react-three/fiber | 9.8.2 | react >=19 <19.4 | OK (React 19.2.4) |
| @react-three/drei | 10.7.9 | fiber ^9 | OK |
| @react-three/postprocessing | 3.2.2 | fiber >=9.7, postprocessing ^6.36 | OK |
| @theatre/core, @theatre/studio | 0.7.2 | core * | OK |
| **@theatre/r3f** | 0.7.2 | **fiber ^8.13.6** | **TIDAK kompatibel** → tidak dipasang. Theatre dipakai lewat `@theatre/core` langsung: objek sheet menggerakkan ref di `useFrame`. Studio hanya `import()` dinamis saat `NODE_ENV=development`. |
| lenis | 1.3.29 | react >=17 | OK |
| maath | 0.10.8 | three, @types/three | OK |
| motion | 14.14.0 | react ^19 | OK (dipertimbangkan menggantikan framer-motion yang sama-sama dari tim Motion) |
| gsap | 3.15.1 | — | sudah ada; ScrollTrigger/Flip/SplitText bawaan paket |

Tidak ada `--force` / `--legacy-peer-deps` yang dibutuhkan.

## 6. Konflik yang harus diselesaikan saat implementasi

1. Test lama mengunci arah lama: `accents.spec.ts`, `entrance.spec.ts`, `home.spec.ts` menegaskan **tidak ada
   `<canvas>`**; `public-quality.spec.ts` melarang framer-motion di rute publik; banyak test memeriksa teks/desain
   Quiet Editorial dan fly-through video. Test ini akan diperbarui per fase (bukan dihapus diam-diam) dan
   perubahannya dicatat di laporan fase.
2. `admin-visual.spec.ts` (baseline screenshot dashboard) akan berubah di Fase 11 → baseline diperbarui dengan
   sengaja di fase itu saja.
3. Aset video `public/3d/flight` + `entrance` (≈17 MB) menjadi tidak relevan bila hero/fly-through diganti scene
   WebGL nyata. Diputuskan di Fase 9 (hapus atau dipertahankan sebagai fallback tanpa WebGL — kemungkinan poster
   saja yang dipertahankan).
4. Halaman terpisah `/about/detail|skills|docs` di master prompt vs redirect 308 saat ini → usulan: tetap satu
   halaman `/about` dengan section yang didesain ulang (URL lama tetap redirect, SEO aman). Perlu konfirmasi di Fase 10.
5. Logo FZ asli: `public/fz-logo.png`, `src/app/icon.svg` (monogram Fz). Monogram 3D akan diekstrusi dari path SVG
   ini (identitas tetap).

## 7. Risiko teknis

- LCP/CLS: R3F + three ≈ 250–350 KB gzip. Canvas harus `dynamic(ssr:false)` dan dimuat setelah teks hero
  ter-paint; teks hero tetap HTML server (LCP = teks, bukan canvas).
- Satu Canvas persisten di `(site)/layout` (bertahan antar navigasi App Router) + scene manager per rute.
- Mobile/low-end: DPR adaptif, tanpa postprocessing, partikel dikurangi; tanpa WebGL → fallback SVG statis.
- Next 16 + React Compiler mati (`reactCompiler:false`) — tidak ada konflik dengan R3F.

## 8. Baseline

| Cek | Hasil (2026-11-27, sebelum perubahan kode) |
|---|---|
| `npm run lint` | 0 error, 0 warning (hanya info caniuse-lite usang) |
| `npm run build` | sukses (Next 16.2.4, 38 rute, Proxy aktif) |
| `npm run test:fast` | **109 passed** (12,3 menit), 0 gagal |

Catatan: `npm ci` tidak dijalankan ulang — `node_modules` sudah sesuai lockfile dan build/test lolos; akan
dijalankan saat dependensi baru dipasang di Fase 3.
