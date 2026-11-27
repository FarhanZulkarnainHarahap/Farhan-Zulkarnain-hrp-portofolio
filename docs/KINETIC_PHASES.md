# Log fase — Redesign Kinetic Systems

Arah dan aturan: CLAUDE.md, DESIGN.md. Audit awal: docs/KINETIC_AUDIT.md.

## Fase K1 — Audit dan baseline (commit 940e715)

Lint 0, build sukses, `test:fast` 109/109. Detail: docs/KINETIC_AUDIT.md.

## Fase K2 — Design system dan layout global

### Keputusan desain

1. **Dark default, light opsional.** `:root` = `color-scheme: dark`; light hanya lewat toggle/⌘K
   (`data-theme="light"`, disimpan). Tidak lagi mengikuti OS. Alasan: master prompt meminta
   "premium dark interface"; toggle dipertahankan karena ⌘K dan fungsi tema adalah fitur yang ada.
2. **Palet** dari brief pemilik; `muted` dinaikkan dari #71717A ke #80808A (4,1 → 5,1:1 di canvas) agar
   lolos WCAG AA untuk teks kecil. Varian light dirancang dengan hue yang sama (accent #0B6E7F, 5,4:1).
3. **Dua keluarga, tiga peran.** Geist (display 600 + body) dan Geist Mono (label teknis). Newsreader
   dilepas dari root layout (−2 file font yang di-preload). Space Grotesk/Inter tidak ditambah: Geist
   sudah variabel 400–700 dan lokal, jadi tidak ada unduhan font tambahan.
4. **Grid 12 kolom terlihat** (`.layer-environment`, lg+), header section editorial asimetris (label kolom
   1–3, judul kolom 4–12), PageHeader dengan lead di kolom 7–12.
5. **Bentuk industrial**: radius 2px/4px; pill hanya untuk titik status.
6. **Layer stack** di SiteChrome: environment → `#webgl-root` → `#mask-root` → konten → UI → nav →
   `#transition-root` → dialog (top layer). Layer latar `fixed`, `pointer-events: none`, `display: none`
   saat kosong.
7. **Token runtime** (durasi, ease, spring, stagger, mask, hover, press, idle, kamera, z-index) di CSS;
   jembatan ke GSAP/Motion/Theatre/R3F: `src/lib/design-tokens.ts`. Reduced motion dinetralkan di CSS.
8. **Hero**: nama raksasa (display-hero, uppercase), label teknis berpasangan, CTA "Explore projects" +
   "Get in touch", status dengan pulse, proof API, indikator scroll berupa rel. Panggung orbit di kanan.
9. **Orbit sementara = SVG statis** (`components/hero/OrbitFallback.tsx`, `data-orbit-renderer="svg"`),
   digambar di server dari model bersama `src/lib/display/orbit.ts` (21 skill API, 3 cincin miring,
   node di belakang core diredupkan dan tertutup core). BUKAN orbit CSS 2D beranimasi; ditandai sebagai
   placeholder Fase 6 dan sekaligus fallback permanen tanpa WebGL.
10. **H1 tetap satu blok teks.** Percobaan membungkus tiap baris dalam `.mask-line` membuat LCP ponsel
    pindah ke paragraf lead (yang dianimasikan) — dibatalkan. Masked line reveal akan memakai SplitText
    di runtime (Fase 3+). Kelas `.mask-line` tetap tersedia untuk teks non-LCP.
11. **Nav desktop mulai `lg`** (sebelumnya `md`): di 834px nav berindeks + label membuat overflow 18px;
    menu mobile dipakai sampai 1024px.
12. **Aset render Blender lama** (fly-through, kartu Fz) tetap dipakai dan dibingkai warna render-nya
    (`--legacy-render-canvas`) sampai scene WebGL menggantikannya. Video entrance hero tidak lagi dipasang
    (komponen dan aset TIDAK dihapus, sesuai instruksi).

### Hasil

| Pemeriksaan | Hasil |
|---|---|
| `npm ci` | exit 0, 470 paket, tanpa konflik peer, tanpa `--force` / `--legacy-peer-deps` |
| `npm audit` | identik dengan lockfile Fase 2 (18 total; 6 production: next, postcss, sharp, nanoid, source-map-js, baseline-browser-mapping) |
| `npm run lint` | 0 error |
| `npm run build` | sukses; `/dev/animation-lab` 404 di production |
| `npm run test:fast` | 124/124 lolos pada kode final (Fase 2: 108; +11 `animation.spec`, +5 `animation-lab.spec`). Project `app` 116/116 di run penuh terakhir. `dev-quality` 8/8 di run terpisah, karena di run penuh lab sempat 404 akibat cache dev Next (lihat Risiko) |
| admin-visual | 20/20 identik (dashboard tidak berubah) |
| Penanda di `.next/static` | Theatre Studio, Theatre core, three.js, kode lab, shader mask: 0 file |

Bundle (KB gzip, diukur dengan `.qa/scripts/bundle.mjs`; "initial" = `<script>` di HTML, "loaded" = semua JS setelah load + idle 2,5 dtk):

| Rute | Initial Fase 2 → K3 | Loaded Fase 2 → K3 |
|---|---|---|
| `/` | 204,7 → 210,3 (+5,6) | 267,3 → 287,9 (+20,6) |
| `/about` | 201,1 → 206,7 (+5,6) | 263,8 → 284,4 (+20,6) |
| `/projects` | 202,5 → 208,1 (+5,6) | 240,3 → 261,0 (+20,7) |
| `/contact` | 193,8 → 199,4 (+5,6) | 231,3 → 251,9 (+20,6) |
| `/auth/login` | 198,4 → 204,0 (+5,6) | 204,6 → 210,2 (+5,6) |

- +5,6 KB awal: store, registry, lifecycle, scroll engine, dan kualitas (`AnimationProvider` di SiteChrome). Ikut ke `/auth/login` karena
  `app/not-found.tsx` memasang SiteChrome dan boundary not-found root di-preload di semua rute (struktur sejak K2). Kode itu tidak
  dijalankan di auth (`__kinetic` tidak ada).
- +15 KB setelah idle: runtime Lenis (~6,6 KB) dan pendaftaran plugin GSAP.
- ScrollTrigger tidak lagi ikut ke halaman publik. Pindah ke `src/lib/animation/scroll-trigger.ts`; sebelum dipindah, loaded +37 KB.
- three, R3F, drei, postprocessing, Theatre, Motion (`LazyMotion`) tidak dimuat rute publik mana pun.

Screenshot lab (development): `.qa/kinetic/k3/lab-*.png` (desktop per demo, mobile, Studio).

### Perubahan test (alasan)

| Test | Perubahan | Alasan |
|---|---|---|
| entrance.spec — "LCP … through the entrance" | ditulis ulang: H1 = LCP, ≤ 1,2 dtk, CLS < 0,05 di 1024–1920 × light/dark, tidak ada media entrance | entrance video tidak dipasang lagi di hero |
| entrance.spec — "entrance plays once per session" | diganti "hero orbit stage": SVG dari API, ringkasan aksesibel 3 cincin, orbit di kanan H1 (desktop) dan di bawah teks (ponsel), tanpa overflow | fitur diganti oleh panggung orbit |
| entrance.spec — phones / full film | klip `light-*` → `dark-*` | tema default sekarang dark |
| interactive.spec — "hero: idle loop… hover tilts" | dihapus, dengan komentar penjelas | fitur entrance dihapus dari hero; idle/hover/click orbit diuji di Fase 6 |
| home.spec — hero | label "Full-stack engineer · Medan" → label berpasangan; "View projects" → "Explore projects" | copy hero baru (master prompt) |
| site-chrome — theme toggle | default dark, opt-in light, bandingkan latar body (header transparan di atas) | dark default |
| site-chrome — palette | "dark theme" → "light theme" | palette menawarkan kebalikan tema aktif |
| site-chrome — mobile menu focus | cek di tiap Tab (14×) bahwa fokus di dalam sheet atau di UI browser, tidak pernah di halaman | sheet punya lebih banyak kontrol; niat test tetap (bahkan diperketat per langkah) |

Tidak ada test yang di-skip.

### Risiko / belum selesai

- Kartu Fz (About, footer) dan fly-through beranda masih render Blender lama: tonenya #141311 vs canvas
  #08090B; dibingkai sengaja, diganti di Fase 6–10.
- Gambar OG/Twitter dan favicon masih bergaya Quiet Editorial (font Newsreader, terakota) — diselaraskan di
  Fase 10/17.
- `StackAnatomy` (ilustrasi /about) dan komponen halaman belum didesain ulang (Fase 9–10); mereka hanya
  mewarisi token baru.
- Label orbit SVG kecil di tablet (≈ 7px pada 24rem); orbit WebGL Fase 6 memakai label DOM/kanvas yang
  dapat dibaca. Beberapa label node bisa berdekatan.
- Admin dashboard: tidak berubah (20/20 screenshot identik); restyle di Fase 11.

## Fase K3 — Integrasi pustaka animasi dan infrastruktur

Arsitektur lengkap: docs/ANIMATION_ARCHITECTURE.md. Theatre: docs/THEATRE.md. Playground (dev saja): `/dev/animation-lab`.

### Pustaka (versi aktual, tanpa `--force` / `--legacy-peer-deps`)

| Paket | Versi | Jenis | Catatan |
|---|---|---|---|
| three | 0.187.0 | dep | |
| @react-three/fiber | 9.8.2 | dep | peer react >=19 <19.4 (React 19.2.4) |
| @react-three/drei | 10.7.9 | dep | `stats-gl` membawa three 0.170 sendiri; hanya ikut ter-bundle bila `StatsGl` diimpor (tidak dipakai) |
| @react-three/postprocessing | 3.2.2 | dep | peer fiber >=9.7, postprocessing ^6.36 |
| postprocessing | 6.39.6 | dep | peer three >=0.168 <0.188 |
| maath | 0.10.8 | dep | |
| @theatre/core | 0.7.2 | dep | tanpa @theatre/r3f |
| @theatre/studio | 0.7.2 | devDep | import dinamis khusus development |
| lenis | 1.3.29 | dep | |
| motion | 14.14.0 | dep | menggantikan `framer-motion` 12.42.2 (DashboardShell → `motion/react`) |
| gsap | 3.15.1 | dep (sudah ada) | ScrollTrigger, Flip, SplitText, CustomEase didaftarkan terpusat di `setupGsap()` |
| @gsap/react | 2.1.2 | dep (sudah ada) | |
| @types/three | 0.187.0 | devDep | |

`npm audit --omit=dev`: 6 temuan, identik dengan baseline Fase 2 (next, postcss, sharp, nanoid, source-map-js,
baseline-browser-mapping). Tidak ada temuan baru dari paket Fase K3.

### Hasil

| Pemeriksaan | Hasil |
|---|---|
| `npm ci` | exit 0, 470 paket, tanpa konflik peer, tanpa `--force` / `--legacy-peer-deps` |
| `npm audit` | identik dengan lockfile Fase 2 (18 total; 6 production: next, postcss, sharp, nanoid, source-map-js, baseline-browser-mapping) |
| `npm run lint` | 0 error |
| `npm run build` | sukses; `/dev/animation-lab` 404 di production |
| `npm run test:fast` | 124/124 lolos pada kode final (Fase 2: 108; +11 `animation.spec`, +5 `animation-lab.spec`). Project `app` 116/116 di run penuh terakhir. `dev-quality` 8/8 di run terpisah, karena di run penuh lab sempat 404 akibat cache dev Next (lihat Risiko) |
| admin-visual | 20/20 identik (dashboard tidak berubah) |
| Penanda di `.next/static` | Theatre Studio, Theatre core, three.js, kode lab, shader mask: 0 file |

Bundle (KB gzip, diukur dengan `.qa/scripts/bundle.mjs`; "initial" = `<script>` di HTML, "loaded" = semua JS setelah load + idle 2,5 dtk):

| Rute | Initial Fase 2 → K3 | Loaded Fase 2 → K3 |
|---|---|---|
| `/` | 204,7 → 210,3 (+5,6) | 267,3 → 287,9 (+20,6) |
| `/about` | 201,1 → 206,7 (+5,6) | 263,8 → 284,4 (+20,6) |
| `/projects` | 202,5 → 208,1 (+5,6) | 240,3 → 261,0 (+20,7) |
| `/contact` | 193,8 → 199,4 (+5,6) | 231,3 → 251,9 (+20,6) |
| `/auth/login` | 198,4 → 204,0 (+5,6) | 204,6 → 210,2 (+5,6) |

- +5,6 KB awal: store, registry, lifecycle, scroll engine, dan kualitas (`AnimationProvider` di SiteChrome). Ikut ke `/auth/login` karena
  `app/not-found.tsx` memasang SiteChrome dan boundary not-found root di-preload di semua rute (struktur sejak K2). Kode itu tidak
  dijalankan di auth (`__kinetic` tidak ada).
- +15 KB setelah idle: runtime Lenis (~6,6 KB) dan pendaftaran plugin GSAP.
- ScrollTrigger tidak lagi ikut ke halaman publik. Pindah ke `src/lib/animation/scroll-trigger.ts`; sebelum dipindah, loaded +37 KB.
- three, R3F, drei, postprocessing, Theatre, Motion (`LazyMotion`) tidak dimuat rute publik mana pun.

Screenshot lab (development): `.qa/kinetic/k3/lab-*.png` (desktop per demo, mobile, Studio).

### Perubahan test (alasan)

| Test | Perubahan | Alasan |
|---|---|---|
| `tests/animation.spec.ts` (baru, project `app`) | 11 test: lab 404 di production; Studio, Theatre core, three.js, dan kode lab tidak dimuat rute publik; Lenis halus dan sinkron dengan frame bersama; satu loop; anchor, scroll lock, navigasi klien dan back; reduced motion dan touch tetap native; auth tanpa infrastruktur animasi; section aktif | Bukti integrasi Lenis/GSAP dan pengecualian Studio di build production |
| `tests/animation-lab.spec.ts` (baru, project `dev-quality`) | 5 test serial di `/dev/animation-lab`: render loop R3F + WebGL, timeline Theatre, SplitText ter-revert, Lenis scrollTo/anchor, progres ScrollTrigger, sinkron GSAP → Theatre → uniform mask, satu objek empat pemilik, konflik kepemilikan ditolak, hover raycast, state Motion, klik cepat, mode reduced motion, Studio hanya dev | Lab hanya ada di development |
| Engine di lab | Dari "lab memakai Lenis" menjadi "engine sesuai tier kualitas" (Lenis untuk high/medium, native untuk low/minimal). `THREE.Clock` deprecation (internal @react-three/fiber 9.8.2) diabaikan | Chromium headless merender WebGL lewat software (SwiftShader); probe kualitas menilainya "low", sehingga Lenis memang dimatikan. Lenis sendiri diuji di `animation.spec.ts` |
| Hover 3D di lab | Dari "pointer di tengah bounding box canvas" menjadi "gulir ke section scene, lalu coba beberapa titik di bagian canvas yang terlihat hingga raycast mengenai objek" | Tengah bounding box bisa berada di luar viewport (canvas sticky belum terlihat penuh) dan torus knot berlubang di tengah |
| State klik di lab | Dari "lihat teks 'loading' lalu 'success'" menjadi "riwayat state (`data-history`) tepat `idle,loading,success,idle` setelah dua klik dalam satu task" | Di renderer software (±6 FPS) jendela loading 700 ms bisa terlewat. Dua klik dalam satu task juga membuktikan klik cepat diabaikan; bug closure basi pada demo diperbaiki dengan ref `busy` |
| Warning yang diabaikan di lab | `You have Reduced Motion enabled on your device` (Motion, khusus development) | Itulah kondisi yang sengaja dibuat oleh test reduced motion |
| `playwright.config.ts` | `app` mengabaikan `animation-lab.spec.ts`; `dev-quality` kini juga menjalankannya | Lab 404 di production |
| Uji satu loop | Dari "rasio callback rAF/frame < 1,5" menjadi "tepat 1 callback rAF berulang per frame selama Lenis bergerak, dan 0 callback rAF dalam 1 dtk setelah settle" | Rasio ternyata mengukur hal yang salah. Pemeriksaan sumber callback menemukan keep-alive rAF permanen milik ScrollTrigger (`function t(){return enabled&&requestAnimationFrame(t)}`), yang aktif karena K3 awalnya mendaftarkan ScrollTrigger secara global. Kini ScrollTrigger lazy dan Lenis tidur saat idle, sehingga test diperketat, bukan dilonggarkan |
| Uji back | Dari "kembali ke ±80 px dari 1400" menjadi "pemulihan instan (tidak dianimasikan) dan sama dengan scroll native (±40 px)" | Scroll native pun mendarat di ~950 px, bukan 1400 (perilaku pemulihan Next/browser, bukan Lenis). Lihat Risiko |

Tidak ada test lama yang dihapus atau dilonggarkan.

### Perbaikan yang ditemukan test

- `entrance.spec.ts` (resource dilepas saat idle: 0 rAF/dtk) gagal dengan 64 rAF/dtk. Ada dua sebab:
  - ScrollTrigger didaftarkan global di `setupGsap()` sehingga keep-alive rAF-nya berjalan di semua halaman. Kini lazy lewat `setupScrollTrigger()`,
    seperti sebelum K3 (Fase 8 sengaja tidak memakai ScrollTrigger).
  - Lenis di-tick setiap frame bahkan saat diam, sehingga ticker GSAP tidak pernah tidur. Kini Lenis hanya di-tick selama beranimasi.

- Studio macet di "loading" (`You seem to have imported @theatre/studio without importing @theatre/core`). `loadTheatre()` kini
  mengimpor core lebih dulu, lalu Studio. Studio juga menerima `__experimental_rafDriver` (driver ticker bersama), sehingga di dev pun tidak ada
  loop rAF tambahan.
- Anchor mendarat 144 px dari atas, bukan tepat di bawah header 72 px. Sejak K2, `Section` memakai `scroll-mt-(--nav-height)`
  sementara `html` juga punya `scroll-padding-top: var(--nav-height)`, jadi offset-nya ganda (native maupun Lenis).
  `scroll-mt` dihapus dari `Section` dan dari section lab; kini `/about#documents`, anchor lab, dan scrollTo programatik
  sama-sama mendarat di 72 px.
- `MaskedText` (per kata) merender satu kata per baris: `.mask-line { display: block }` di `globals.css` (tanpa layer) mengalahkan utility
  `inline-block`. Ditambahkan `.mask-word` (inline-block dengan clip yang sama).
- `scroll-behavior: smooth` tetap aktif selama Lenis berjalan (hanya `lenis-smooth` yang menimpanya), sehingga pemulihan scroll saat back
  ikut dianimasikan browser. Kini `html.lenis { scroll-behavior: auto !important }`.
- Anchor `#top` (div `display: contents` di SiteChrome) terbaca di posisi 0 oleh `getBoundingClientRect`, sehingga "Back to top" tidak bergerak.
  `resolveTop` mengukur elemen tanpa kotak dengan penanda sementara setinggi 0 tepat sebelum elemen itu.

### Risiko / belum selesai

- Pemulihan scroll saat back di /about mendarat di ~950 px, bukan posisi yang ditinggalkan (1400 px), baik dengan Lenis maupun native.
  Belum dibandingkan dengan build Fase 2. Ditangani bersama transisi halaman (Fase 5), mis. menyimpan posisi per entri history.
- `gsap.ticker.lagSmoothing(0)` bersifat global selama Lenis aktif (dikembalikan ke 500/33 saat Lenis dimatikan).
- `@react-three/drei` membawa three 0.170 lewat `stats-gl`; aman selama `StatsGl` tidak diimpor.
- Temuan `npm audit` lama (next critical, dll.) tetap ada; tidak berasal dari K3.
- `gitHead` @theatre/core 0.7.2 tidak ada di repo publik; referensi memakai `main` 6ea82b93 dan tag 0.7.1 (docs/THEATRE.md).
- Pustaka 3D berat belum dipakai di rute publik dan komponen Motion belum dipasang di halaman publik; keduanya mulai Fase 4.
- Pemulihan WebGL context loss baru dilaporkan (`webgl: "lost"`); pemulihan penuh di Fase 4.
- Studio 0.7.2 memeriksa `updates.theatrejs.com` sekali (tidak bisa dimatikan tanpa patch). Hanya terjadi di development saat Studio dibuka,
  dan gagal oleh CORS di localhost.
- Next 16 dev kadang memulai dengan daftar rute basi dari cache `.next/dev`, sehingga `/dev/animation-lab` 404 di dev (intermiten;
  `routes.d.ts` tidak memuat rutenya). `touch src/app/(site)/dev/animation-lab/page.tsx` atau menghapus seluruh `.next/dev` memulihkannya.
  Bukan masalah production (rute 404 by design).
- Next 16 dev: menghapus `.next/dev/types` saja (mis. untuk membersihkan file tipe yang terpotong oleh dev server yang dihentikan paksa)
  membuat daftar rute dev basi, sehingga rute baru seperti `/dev/animation-lab` menjadi 404. Hapus seluruh `.next/dev` (cache hasil generate),
  jangan hanya `types/`.
- QA lokal berjalan bersamaan dengan proyek lain di mesin yang sama (beban CPU tinggi); run yang timeout massal diulang dan tidak dihitung.
