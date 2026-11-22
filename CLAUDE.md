# Aturan Redesign Portofolio

## Lingkungan
- Aplikasi Next.js ada di web/, yang juga merupakan root git. Semua path di aturan ini relatif ke web/.
- Referensi desain di ../design-refs/ (awesome-design-md, design.md). Blender Skills ada di ~/.claude/skills (global).
- WSL, Node 20, tanpa sudo: jangan npm install -g (pakai npx), jangan npx skills add.
- Blender berjalan di Windows; MCP blender terhubung lewat localhost:9876 (mirrored networking) atau BLENDER_HOST.

## Lapisan data: DILARANG DIUBAH
- src/services/api.ts, src/lib/api-client.ts, src/lib/api-config.ts, src/lib/portfolio/**,
  src/lib/skill-icon-resolver.ts, src/lib/skill-icons.ts, src/lib/image-loader.ts,
  src/app/api/**, src/proxy.ts, .env*, next.config.ts (kecuali menambah remotePatterns gambar).
- Semua data tetap dari API https://api.farhanzulkarnainhrp.com lewat fungsi yang sudah ada:
  /api/skills, /api/experiences, /api/portofolios, /api/documents, /api/contact.
  Komponen baru hanya MENGONSUMSI tipe dan fungsi yang sama. Jangan hardcode data yang berasal dari API.
- Logika /auth/login, /auth/register (JWT via jose) dan /dashboard (redirect ke /admin/home,
  dijaga proxy.ts untuk role ADMIN) jangan diubah. Tampilan /auth boleh diselaraskan.

## Dashboard (di luar cakupan redesign)
- Tampilan dashboard tidak diubah dalam redesign ini; komponennya ada di src/components/admin/
  dan CSS-nya di src/app/dashboard/admin.css.
- admin.css adalah salinan globals.css lama yang di-scope ke `.dashboard-root` (wrapper di
  src/app/dashboard/layout.tsx, display: contents). Aturan baru di globals.css tetap bisa "bocor"
  ke dashboard untuk properti yang tidak didefinisikan admin.css, dan utilitas Tailwind dashboard
  memakai tema default Tailwind. Jadi: jangan reset namespace tema default Tailwind
  (mis. `--color-*: initial`), dan setelah mengubah globals.css jalankan
  `npx playwright test tests/admin-visual.spec.ts` (baseline screenshot dashboard harus tetap identik).
- Modul bersama yang dipindah dari kinetic/: src/hooks/useCollection.ts, src/types/content.ts
  (Skill, Experience), src/lib/site.ts (profile), src/components/admin/{Modal,Confirmation,
  CollectionState,DashboardShell,DashboardNavbar}.tsx. Jangan hapus saat bersih-bersih Kinetic.
- next.config.ts boleh diubah untuk redirects atas izin eksplisit (Fase 1.5: /about/* → /about#…).

## Lint
- Lint harus 0 error. Pengecualian SEMENTARA di eslint.config.mjs:
  src/components/three/kinetic/KineticCore.tsx — cabut entri ini saat file dihapus di Fase 11.

## Struktur halaman
- Setiap halaman punya tujuan sendiri (lihat "Peta Halaman" di docs/PAGE_MAP.md).
  /about, /journey, /projects, /contact harus menjadi HALAMAN MANDIRI dengan isi lebih dalam dari beranda,
  BUKAN lagi <LandingPage initialSection="..."/> yang menampilkan potongan beranda.
- Pertahankan: rute yang ada, metadata dan canonical tiap halaman, sitemap.ts, robots.ts,
  skip-to-content, command palette ⌘K, dan form kontak yang berfungsi.

## Desain
- DESIGN.md adalah sumber kebenaran visual. Semua warna, font, spacing, radius, dan motion memakai token.
  Tidak ada nilai hardcode.
- Gaya: portofolio profesional, bersih, tenang, berkelas. Hilangkan semua istilah "Kinetic Systems",
  "System Initialized", "Transmission", "Capability Graph", "Trajectory Map", "FZH-001".
- Copywriting: bahasa Inggris profesional, kecuali saya minta lain.
- Animasi wajib menghormati prefers-reduced-motion dan tidak boleh memperburuk LCP/CLS.
- Token ada di src/app/globals.css (primitive → semantic `--ui-*` + `@theme` → component). Tema via
  `light-dark()`; jangan pakai utilitas `dark:`. Elemen yang butuh skema sendiri pakai class
  `.site-scheme` / `.scheme-dark` (token di-deklarasi ulang di sana), bukan `color-scheme` lepas.
- Komponen dasar di src/components/ui/, frame situs di src/components/site/ (dipasang lewat
  src/app/(site)/layout.tsx; app/not-found.tsx memasangnya sendiri).
- SEMENTARA: halaman yang belum di-redesign memakai src/styles/legacy-kinetic.css (CSS lama, di-scope ke
  wrapper `.legacy-root` di kinetic/Shell.tsx, app/auth/layout.tsx, app/error.tsx). Jangan diperluas.
  Halaman baru TIDAK dibungkus `.legacy-root`. Hapus file, import di layout.tsx, dan wrapper-nya di Fase 11
  (atau saat halaman terakhir pemakainya diganti).

## 3D (Blender)
- 3D hanya sebagai AKSEN, bukan tema. Sumber .blend di design/blender/, hasil ekspor di public/3d/.
- Budget: tiap GLB <= 1.5 MB (Draco/Meshopt), tekstur <= 2K WebP, total 3D halaman utama <= 3 MB.
- Wajib ada poster WebP/AVIF sebagai fallback (mobile, reduced-motion, WebGL mati), dan wajib lazy-load.
- Jangan memakai generate_3d atau fitur berbayar lain tanpa izin saya. Poly Haven (CC0) boleh dipakai.
  Untuk Sketchfab, cek lisensinya dan catat di docs/CREDITS.md.

## Alur kerja
- Kerja hanya di branch redesign/professional. Commit kecil per fase/section.
- Sebelum menghapus file lama, grep dulu semua import-nya.
- Setiap fase/sub-fase yang selesai DAN lolos npm run lint + npm run build + test yang relevan:
  langsung commit lalu `git push origin redesign/professional`, tanpa menunggu persetujuan.
- Push HANYA ke redesign/professional. Jangan pernah push/merge ke main, jangan force push.
- Kalau lint/build/test gagal: JANGAN push; laporkan kegagalannya.
- Setelah push: laporkan hash commit dan link preview deploy jika ada.
- Fase tanpa perubahan file tidak perlu commit/push.
- Test di akhir fase: `npm run test:fast` (tanpa test 3D lama bertag `@legacy3d`). `npm run test:full`
  = semua + `@live`. `npm run test:live` hanya tests/live.spec.ts yang SENGAJA memakai API produksi.
- Tidak ada test di test:fast yang boleh menyentuh API produksi: server Next untuk test memakai
  `API_URL` ke tests/fixture-api.mjs (port 3190; skenario normal/empty/fail/extreme via
  POST /__scenario) dan `CONTENT_CACHE=off`; data browser dimock per test atau lewat /api/public → fixture.
- Halaman publik merender data di SERVER (src/lib/server/content.ts: fungsi api.ts + unstable_cache 300 dtk),
  dengan fallback "Try again" ke useCollection di browser (src/components/site/ServerCollection.tsx).
  Pola ini juga dipakai untuk /about, /journey, /projects di Fase 6.
- Playwright lokal butuh
  `export LD_LIBRARY_PATH=~/.local/pw-libs/root/usr/lib/x86_64-linux-gnu:~/.local/pw-libs/root/usr/lib/x86_64-linux-gnu/nss`.
- Tetap BERHENTI dan tunggu persetujuan saya sebelum memulai fase berikutnya.
