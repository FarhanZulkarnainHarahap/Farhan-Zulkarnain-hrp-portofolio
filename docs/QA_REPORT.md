# QA Report — Fase 12 (performa + QA menyeluruh)

Tanggal: 2026-11-24. Branch `redesign/professional`. Semua ukur dilakukan pada build produksi lokal
(`next start`) dengan fixture API (`tests/fixture-api.mjs`), kecuali test `@live` (12.9).
Data mentah: `.qa/fase12/` (tidak di-commit).

---

## 12.1 Diet JS & font

Lighthouse 12.8.2, mobile = throttling bawaan (simulasi), desktop = `--preset=desktop`, median 3 run
(langkah F6–F7: 5 run). Karena LCP simulasi bising (±0,4 dtk untuk byte yang sama), kolom terakhir
memberi metrik yang lebih stabil: total KB yang diminta sebelum LCP teramati (Lantern menghitung
semuanya).

| Langkah | Desktop LCP light / dark | Mobile LCP light / dark | Mobile TBT | Skor mobile | KB sebelum LCP |
|---|---|---|---|---|---|
| Sebelum (Fase 10.5 final) | 840 / 834 ms | 3,04 / 2,77 dtk | 226 / 306 | 90 / 89 | 525 / 533 |
| 1. Subset font lokal | 1008 / 865 ms | 2,37 / 2,58 dtk | 247 / 304 | 93 / 90 | 413 / 413 |
| 2. GSAP + SplitText dinamis | 1109 / 1123 ms | 2,88 / 2,82 dtk | 186 / 249 | 92 / 91 | 424 / 393 |
| 3. Fly-through + entrance on demand | 819 / 1097 ms | 2,60 / 3,10 dtk | 279 / 291 | 90 / 88 | 414 / 417 |
| 4. Command palette saat dipakai | 1091 / 759 ms | 2,38 / 2,52 dtk | 307 / 379 | 92 / 87 | 393 / 422 |
| 5. Poster di atas ambang entropi | 763 / 1073 ms | 2,62 / 3,15 dtk | 274 / 269 | 91 / 88 | 423 / 422 |
| 6. Video 1 px di dalam poster | 761 / 658 ms | 2,67 / 2,52 dtk | 285 / 310 | 90 / 91 | 416 / 418 |
| **7. content-visibility di bawah lipatan** | **753 / 679 ms** | **2,43 / 2,43 dtk** | 246 / 291 | **92 / 92** | **393 / 393** |

Target: mobile ≤ 2,5 dtk **tercapai** (2,43); ideal 2,0 belum. Desktop ≤ 1,0 dtk **tercapai** (0,68–0,75).

Isi tiap langkah:
1. **Font**: Newsreader 129 KB (wght 200–800 + opsz) → 38 KB (400) + 40 KB (500), opsz tetap
   variabel; Geist 28,6 → 18,8 KB (400–700); Geist Mono 22,6 → 13,6 KB (400–500). Latin + tanda baca,
   € ™ panah ⌘ ● ✓. Lisensi OFL tanpa Reserved Font Name, jadi nama family tetap
   (`src/app/fonts/README.md`).
2. **GSAP**: seluruh logika motion di `motion-runtime.ts`, di-`import()` setelah hidrasi; tidak pernah
   dimuat di bawah reduced motion. FlyThrough tidak lagi memakai GSAP (opacity/translate langsung).
3. **Fly-through dan entrance**: markup (teks, stills, poster, preload) tetap komponen server; loader
   kecil memuat `engine.ts` saat section ±1 layar dari viewport dan `entrance-player.ts` hanya di
   desktop + motion.
4. **Palette ⌘K**: `next/dynamic` saat ⌘K / klik pertama; hover/fokus tombol memanaskan chunk.
5. **Poster LCP desktop**: AVIF poster awal 0,04–0,05 bit/px berada di bawah ambang "low-entropy" Chrome
   sehingga tidak dihitung → LCP jatuh ke frame video (±1,1 dtk). Re-encode ke 0,08–0,13 bit/px
   (2,8–5,9 KB).
6. **Kandidat video**: kotak video kadang 1 baris piksel lebih besar dari poster (pembulatan subpiksel)
   dan menjadi kandidat LCP baru di ±570 ms (terlihat di trace). Video kini 1 px di dalam poster.
7. **Section di bawah fly-through**: `content-visibility: auto` + ukuran intrinsik yang diingat; layout dan
   font untuk bagian yang belum terlihat ditunda.

Sisa JS besar di beranda (analisis build, gzip):

| Chunk | Ukuran | Isi | Status |
|---|---|---|---|
| Framework (react-dom, router, runtime Turbopack) | ±145 KB | Next.js / React | wajib |
| Ikon skill (react-icons, `StackSummary`) | 20 KB | peta ikon skill | dimuat setelah LCP; kandidat berikut: render ikon di server atau impor per ikon |
| Header + tema | 18 KB | SiteHeader, ThemeToggle, MobileMenu, `useCollection` dokumen (link CV) | wajib di semua halaman |
| Komponen beranda | 13 KB | ThemedPicture, loader, ShinyText, ServerCollection | kecil |
| GSAP + SplitText | 42 KB | runtime motion | kini dinamis, di luar jalur paint |

Catatan pengukuran: CPU host sempat ±2,8× lebih lambat (benchmarkIndex ±900 vs ±2.500) pada satu run;
run itu diulang. Semua angka di tabel dari run dengan benchmarkIndex 2.200–2.800.

## 12.2 Peringatan LCP gambar Cloudinary

Penyebab peringatan: potret di /about (`ProjectImage` tanpa `priority`) adalah LCP di ponsel, tablet dan
1920 (diukur di 7 ukuran). Sekarang `priority`. Gambar utama studi kasus sebaliknya: di bawah lipatan di
ponsel, hanya ±70 px di desktop, dan tidak pernah LCP (paragraf lead) → `priority` dicabut supaya
preload tidak bersaing dengan teks.

## 12.3 /break-ui

Skenario fixture `worst` (POST `/__scenario {"scenario":"worst"}`) + regression test
`tests/break-ui.spec.ts`. Laporan lengkap: `.qa/fase12/break-ui/REPORT.md`.

| # | Tingkat | Temuan | Perbaikan |
|---|---|---|---|
| 1 | Ugly | caseType 90 karakter jadi pil 4 baris di kartu | satu baris + ellipsis, nilai penuh di `title` dan studi kasus |
| 1b | Broken (regresi perbaikan #1, tertangkap) | teks nowrap melebarkan grid → scroll horizontal | grid `grid-cols-1` + `min-w-0` |
| 2 | Ugly | 56 teknologi = kolom ±2.000 px di ponsel | 16 + "+40" (pola sama dengan fitur) |
| 3 | Ugly | dokumen tanpa preview tampil "Image unavailable" | "No preview" |
| 4 | Ugly | kategori dokumen kehilangan huruf kapital nama diri | ejaan asli dipertahankan |
| 5 | Ugly | kategori skill "Devops" / huruf kecil | "DevOps", ejaan asli untuk kategori campuran |

Di lapisan data (tidak diubah, sesuai aturan): dokumen tanpa `size` → `api.ts` menolak seluruh koleksi
(UI: ErrorState "Try again"); slug judul panjang berakhir "-"; judul non-Latin → slug = id.
Tidak bisa diverifikasi di WSL: teks Jepang dan emoji (tidak ada font CJK/emoji di lingkungan test).

## 12.4 /mobile-native

| Gejala | Perbaikan |
|---|---|
| `env(safe-area-inset-*)` selalu 0 (tanpa `viewport-fit=cover`) | ekspor `viewport` (cover), padding safe area di body (sisi), footer (bawah), menu mobile, skip link |
| Warna chrome browser tidak ikut tema | `theme-color` per skema (cermin `--ui-canvas`), disinkron ThemeProvider saat toggle |
| Kilatan abu-abu saat tap | `-webkit-tap-highlight-color: transparent` (tombol punya `:active`) |
| Jeda tap / label terseleksi saat ditekan lama | `touch-action: manipulation`; `user-select: none` hanya di kontrol |
| Target < 44 px | skip link, nama di footer, breadcrumb "Projects" (hit area `::after`) |
| Sudah benar | input/select/palette 16 px; hover di-gate `(hover: hover)`; palette `dvh`; hero `svh`; menu `h-dvh`; zoom tidak dimatikan |

Fly-through, menu mobile dan ⌘K di 360 px: screenshot `.qa/fase12/mobile/`. Perlu HP sungguhan: tap delay,
safe area landscape, warna status bar, keyboard virtual.

## 12.5 UX + aksesibilitas per halaman

Otomatis (axe-core, WCAG 2.0/2.1/2.2 A+AA + best-practice), 8 halaman (/, /about, /journey, /projects,
/projects/kasirku, /contact, /auth/login, 404) × light/dark × 390/1440: **0 pelanggaran**.
Kontras label SVG gambar teknis (axe "incomplete") dihitung manual: light 4,86–15,19:1, dark 5,36–14,96:1.

| Pemeriksaan | Hasil |
|---|---|
| Satu H1 per halaman | ya (6/6), tanpa lompatan level heading |
| Landmark | header (banner), nav berlabel, main, footer di semua halaman |
| Alt text | semua `<img>` punya alt (dekoratif = `alt=""`) |
| Label form | semua field kontak berlabel terlihat (axe) |
| Urutan tab / fokus | Tab pertama = "Skip to content"; urutan mengikuti baca; ring fokus terlihat (kartu proyek: outline kartu lewat `:has(:focus-visible)`); tidak ada fokus tertutup header sticky |
| Zoom 200 % | tanpa scroll horizontal (dicek dengan data ekstrem, 12.3) |
| Responsif 360/768/1024/1440/1920 | tanpa scroll horizontal; screenshot `.qa/fase12/a11y/` |

Tujuan dan CTA (docs/PAGE_MAP.md):

| Halaman | Tujuan terpenuhi? | CTA ke halaman berikutnya |
|---|---|---|
| `/` | ya: siapa (H1 + lead), bisa apa (fly-through, stack), bukti (Selected work, Journey) | View projects, Get in touch, View all projects, Full stack on About (/about#stack), Full journey, Contact band |
| `/about` | ya: profil, cara kerja, stack lengkap, CV + sertifikat | Download CV, "Next: see the journey", Get in touch |
| `/journey` | ya (riwayat; empty state bila kosong) | "Next: see the projects" |
| `/projects` | ya: galeri + filter tipe/stack/judul | kartu → studi kasus; "Interested in working together?" → Contact |
| `/projects/[slug]` | ya: masalah → solusi → hasil, stack, fitur, tautan | Previous/Next project, Get in touch, All projects |
| `/contact` | ya: form berfungsi + email salin + profil | (akhir alur) |

## 12.6 Fly-through lintas browser

`npm run test:browsers` (config terpisah, di luar test:fast): **12/12 lolos** di Chromium, Firefox dan
WebKit (mesin Safari).

| Cek | Chromium | Firefox | WebKit |
|---|---|---|---|
| Scrub mengikuti scroll di 5 scene + penutup | ✓ | ✓ | ✓ |
| "Skip to projects" dengan keyboard | ✓ | ✓ | ✓ (Alt+Tab, perilaku Safari) |
| 10× bolak-balik: 0 video, 0 blob URL tersisa | ✓ (heap +0,76–0,95 MB) | ✓ | ✓ |
| Reduced motion: daftar statis, 0 video | ✓ | ✓ | ✓ |

WebKit di WSL tanpa sudo: pustaka sistem dan GStreamer (dekoder H.264) diekstrak ke `~/.local/pw-libs`
(lihat CLAUDE.md → test:browsers). Safari asli (macOS/iOS) tetap perlu dicek manual.

## 12.7 SEO & berbagi

`tests/seo.spec.ts` (4 test, lolos): robots.txt (allow /, disallow /dashboard /admin /auth, sitemap),
sitemap (semua halaman + studi kasus, URL absolut, tanpa area privat), canonical self-referensial,
judul unik + deskripsi tiap halaman, JSON-LD Person (name, url, jobTitle, address, sameAs), og:* dan
twitter:* (summary_large_image) dengan gambar PNG 1200×630 yang benar-benar dirender (200), dan 7 URL lama
→ 308 ke tujuan baru.

## 12.8 Lighthouse final

Lighthouse 12.8.2, median 3 run, build produksi lokal + fixture API. "Sebelum" = run final pertama
(setelah 12.1–12.7), "sesudah" = setelah perbaikan di bawah. Halaman: beranda (light + dark), /about,
/projects, /projects/kasirku, /contact (light). JSON: `.qa/fase12/lighthouse/P12-before`, `P12-final`.

| Halaman | Perangkat | Tema | Perf (sebelum → sesudah) | A11y | BP | SEO | LCP (sebelum → sesudah) | CLS | Elemen LCP |
|---|---|---|---|---|---|---|---|---|---|
| about | desktop | light | 100 → **100** | 100 | 100 | 100 | 0,69 → 0,74 dtk | 0,000 | Portrait of Farhan Zulka |
| about | mobile | light | 81 → **86** | 100 | 100 | 100 | 4,65 → 3,64 dtk | 0,000 | Portrait of Farhan Zulka |
| case | desktop | light | 100 → **100** | 100 | 100 | 100 | 0,57 → 0,70 dtk | 0,000 | MY-CASHIER is a modern w |
| case | mobile | light | 93 → **93** | 100 | 100 | 100 | 2,55 → 3,03 dtk | 0,000 | MY-CASHIER is a modern w |
| contact | desktop | light | 99 → **100** | 100 | 100 | 100 | 0,92 → 0,70 dtk | 0,000 | Whether it's a role, a p |
| contact | mobile | light | 81 → **91** | 100 | 100 | 100 | 4,49 → 3,33 dtk | 0,000 | Whether it's a role, a p |
| home | desktop | dark | 100 → **100** | 100 | 100 | 100 | 0,64 → 0,76 dtk | 0,000 | div.hero-entrance > div. |
| home | desktop | light | 100 → **100** | 100 | 100 | 100 | 0,80 → 0,75 dtk | 0,000 | div.hero-entrance > div. |
| home | mobile | dark | 93 → **94** | 100 | 100 | 100 | 2,07 → 2,28 dtk | 0,000 | Farhan Zulkarnain Haraha |
| home | mobile | light | 90 → **91** | 100 | 100 | 100 | 2,66 → 2,60 dtk | 0,000 | Farhan Zulkarnain Haraha |
| projects | desktop | light | 100 → **100** | 100 | 100 | 100 | 0,72 → 0,80 dtk | 0,000 | li.flex > article.group  |
| projects | mobile | light | 82 → **92** | 100 | 100 | 100 | 4,39 → 3,18 dtk | 0,000 | Web applications I've de |

**Tercapai:** Accessibility 100, Best Practices 100, SEO 100 di semua 12 kombinasi; CLS 0,000 di semua
halaman; Performance desktop 100 di semua halaman; Performance mobile ≥ 90 di beranda (91 / 94),
/projects (92), studi kasus (93) dan /contact (91).

Perbaikan yang ditemukan lewat run ini:
- **favicon.ico 85 KB** (PNG 256 px, prioritas High, di jalur LCP setiap halaman) → ICO 32 px 2,6 KB,
  gambar yang sama (keputusan logo tetap pada pemilik, lihat 12.11).
- **Lead header halaman disembunyikan entrance** (Fase 10.5) padahal LCP di ponsel → lead tidak lagi
  dianimasikan (garis aksen, aksi dan visual tetap). /contact 81 → 91–98.
- **Blok pertama yang memakai reveal ikut disembunyikan sampai GSAP termuat** (potret /about) → reveal
  hanya untuk blok di bawah layar pertama; pre-hide CSS `[data-reveal]` dihapus.
- **/projects**: GSAP Flip (34 KB) diimpor statis dan 2 kartu pertama di-preload walau di bawah filter
  di ponsel → Flip dimuat saat filter pertama kali disentuh, kartu tanpa preload. 82 → 92–95.
- **Ikon skill** (react-icons 20 KB) dimuat setelah mount, kotak ikon berukuran tetap.
- **CLS 0,01–0,035**: swap Newsreader membuat H1 panjang membungkus ulang di ponsel → Newsreader
  di-preload lagi (kedua file memang sudah diminta sebelum LCP, jadi tidak menambah byte).

**Tidak tercapai: /about mobile 86 (target ≥ 90).** LCP-nya potret (foto 39 KB dari Cloudinary) di
layar pertama. Byte sebelum LCP sudah setara beranda (±409 KB), tetapi dalam simulasi 4G lambat foto
berbagi bandwidth dengan JS framework dan selesai paling akhir; hasil per run 83–88. Dicoba dan
dibatalkan karena tidak ada perbaikan terukur: menyajikan potret lewat origin yang sama (`/_next/image`)
dan kualitas 55 (27 KB, LCP justru 4,25 dtk karena bising). Opsi untuk Anda: (a) di ponsel letakkan
potret setelah bio sehingga LCP menjadi teks (perkiraan skor ±92, mengubah tata letak About);
(b) potret lebih kecil/terpotong di ponsel; (c) terima 86 (desktop 100, LCP teramati ±0,3 dtk).

**Keputusan pemilik (setelah Fase 12): coba (b) satu kali, terima (c) bila median < 90.** Dicoba: potret
khusus ponsel (Cloudinary f_auto → AVIF, 320/480 w, q 55 = 15 KB alih-alih 39 KB), `fetchpriority=high`,
preload hanya untuk media ponsel, tata letak tidak berubah. Hasil 3 run: 77 / 85 / 87 → **median 85**
(desktop turun ke 99). Dibatalkan; **(c) diterima: /about mobile 86** dengan potret tetap seperti Fase 12.
Kesimpulan: batasnya ada di simulasi LCP-gambar (foto selesai paling akhir saat bandwidth dibagi dengan JS
framework), bukan di ukuran foto.

## 12.9 test:full

`npm run test:full` = suite default + `@live`: **102/102 lolos** (11,5 menit) + **1/1 `@live` lolos**.
`npm run lint`: 0 error, 0 peringatan. `npm run build`: lolos.

Test `@live` (tests/live.spec.ts) **hanya membaca** API produksi: GET `/api/public/*`, buka studi kasus,
unduh CV (GET). Tidak mengirim form kontak, tidak login, tidak menulis. Sejak Fase 12.9 ada pagar: setiap
permintaan browser selain GET/HEAD dibatalkan dan membuat test gagal (`writes` harus kosong).

Test baru di Fase 12: `tests/break-ui.spec.ts` (3), `tests/seo.spec.ts` (4), test lazy-loading dan
entrance halaman di `tests/motion.spec.ts`, plus `tests/flythrough-browsers.spec.ts` (12, lewat
`npm run test:browsers`).

## 12.10 Aturan selera desain

Semua koreksi desain pemilik selama Fase 1–12 dirangkum sebagai aturan di DESIGN.md → "Owner taste rules"
(nada & copy, visual/3D, gerak, tampilan data, interaksi & aksesibilitas, performa). Skill `/learn-taste`
tidak terpasang di lingkungan ini, jadi diringkas manual dari transkrip keputusan.
`design-system/farhan-zulkarnain-harahap/MASTER.md` (keluaran mentah generator Fase 2, "Brutalism")
diganti dengan penunjuk ke DESIGN.md.

## 12.11 Checklist pra-merge

### Tugas pemilik (SAYA)
- [ ] Isi data Journey lewat `/admin/experience` (beranda menyembunyikan section Journey dan /journey
      menampilkan empty state selama kosong).
- [ ] Konfirmasi email kontak `farhanzulkarnaenhrp@gmail.com` (dipakai di /contact, footer, JSON-LD,
      palette ⌘K).
- [ ] Cek preview deploy di HP sungguhan: Android (Chrome) dan iOS (Safari): entrance + fly-through
      (scrub, "Skip to projects"), menu mobile, ⌘K/pencarian, form kontak (keyboard virtual, zoom input),
      safe area di landscape, warna status bar light/dark, teks non-Latin/emoji bila ada di data.
- [ ] Cek Safari desktop (macOS): entrance, fly-through, tema.
- [x] Favicon: monogram Fz baru (glyph Newsreader dalam komposisi kartu Blender): `icon.svg` (light/dark,
      986 B), `icon1.png` 32 px, `apple-icon.png` 180 px, `favicon.ico` 32 px. Logo "FZ DEV" dihapus.
- [ ] Opsional: rapikan kategori skill di `/admin/skill` (kategori API "DEVOPS" tampil sebagai grup sendiri).

### Teknis
- [x] `npm run lint` 0 error, `npm run build` lolos.
- [x] `npm run test:full` lolos: 102/102 + `@live` 1/1 (hanya-baca, dengan pagar GET/HEAD).
- [x] `tests/admin-visual.spec.ts` lolos (tampilan dashboard identik).
- [x] Pengecualian sementara dicabut (KineticCore di eslint, legacy-kinetic.css + `.legacy-root`; Fase 11).
- [x] `design-system/.../MASTER.md` diselaraskan dengan DESIGN.md.
- [x] Lapisan data tidak diubah (api.ts, api-client, lib/portfolio, app/api, proxy, .env*).
- [x] `npm run test:browsers` 12/12 (Chromium, Firefox, WebKit).
- [ ] Preview deploy Vercel dicek setelah push (link dilaporkan bila tersedia).
