# Aturan Redesign Portofolio

## Lingkungan
- Selalu laporkan dalam Bahasa Indonesia.
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
- Modul bersama yang dipindah dari kinetic/ (kode Kinetic sudah dihapus di Fase 11):
  src/hooks/useCollection.ts, src/types/content.ts (Skill, Experience), src/lib/site.ts (profile),
  src/components/admin/{Modal,Confirmation,CollectionState,DashboardShell,DashboardNavbar,
  MotionPreference}.tsx. DashboardShell (dipakai /dashboard/user) satu-satunya pemakai framer-motion;
  framer-motion tetap di package.json tetapi TIDAK boleh ter-import di rute publik.
- next.config.ts boleh diubah untuk redirects atas izin eksplisit (Fase 1.5: /about/* → /about#…).

## Lint
- Lint harus 0 error, tanpa pengecualian file aplikasi di eslint.config.mjs.

## Struktur halaman
- Setiap halaman punya tujuan sendiri (lihat "Peta Halaman" di docs/PAGE_MAP.md).
  /about, /journey, /projects, /contact harus menjadi HALAMAN MANDIRI dengan isi lebih dalam dari beranda,
  bukan potongan beranda.
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
- Motion: GSAP lewat src/lib/gsap.ts (token, reduced-motion = tanpa tween). Reveal memakai
  IntersectionObserver (src/components/motion/MotionController.tsx). ScrollTrigger TIDAK dimuat di halaman
  mana pun; kalau 3D di Fase 10 butuh efek scroll, import ScrollTrigger secara dinamis hanya di chunk
  komponen 3D. Rencana dan keputusan motion di docs/MOTION_PLAN.md.
- legacy-kinetic.css dan wrapper `.legacy-root` sudah dihapus (Fase 11); jangan dihidupkan lagi.

## 3D (Blender)
- 3D hanya sebagai AKSEN, bukan tema. Sumber .blend di design/blender/, hasil ekspor di public/3d/.
- Budget: tiap GLB <= 1.5 MB (Draco/Meshopt), tekstur <= 2K WebP, total 3D halaman utama <= 3 MB.
- Wajib ada poster WebP/AVIF sebagai fallback (mobile, reduced-motion, WebGL mati), dan wajib lazy-load.
- Jangan memakai generate_3d atau fitur berbayar lain tanpa izin saya. Poly Haven (CC0) boleh dipakai.
  Untuk Sketchfab, cek lisensinya dan catat di docs/CREDITS.md.
- SEMUA aset 3D baru WAJIB dibuat lewat MCP blender (execute_blender_code, look, get_scene_info,
  search_assets/import_asset) dan Blender Skills: /blender-director sebagai titik awal, lalu
  /minimalist-style, /procedural-modeling, /hard-surface, /materials, /lighting, /lookdev, /rendering,
  /asset-optimization, /export-pipeline, /qa-review. Dikerjakan di Fase 10.
- DILARANG: memakai ulang GLB/model lama Kinetic (dulu public/models; dihapus di Fase 11, hanya ada
  di riwayat git), membuat geometri 3D langsung dengan kode three.js sebagai pengganti aset Blender,
  atau mengambil model dari sumber lain tanpa izin saya.
- Hasil Fase 10 (lihat docs/3D_PLAN.md):
  - HeroModel: src/components/hero3d/ (HeroVisual → poster ThemedPicture + HeroModelSlot →
    heroScene.ts, three.js langsung + meshopt, di-import dinamis). Gating di src/lib/webgl-capability.ts
    (desktop, pointer halus, tanpa reduced motion, WebGL2, slot terlihat). Render on demand: 0 rAF saat
    diam; dispose saat unmount. Warna dari token `--model-*`; rig cahaya per tema di heroScene.ts.
  - Geometri poster/kamera di hero3d/hero-frame.ts (crop + MODEL_SCALE). Jangan membesarkan poster:
    H1 harus tetap elemen LCP (dijaga tests/hero-model.spec.ts).
  - DeviceMockup STATIS saja (tanpa GLB/three.js): src/components/case-study/DeviceMockup.tsx +
    device-screen.ts (koordinat layar dari Blender).
  - Render per tema lewat src/components/media/ThemedPicture.tsx (hanya varian aktif diunduh).
  - DotGrid (WebGL) DIHAPUS; yang tersisa hanya pola titik CSS statis `.dot-pattern` (token `--dots-*`).
  - Mengubah aset: edit design/blender/portfolio-3d.blend lewat MCP, render ulang, ekspor ke public/3d/,
    ulangi /qa-review. PNG sumber tidak di-commit ke public/.

## Alur kerja
- Kerja hanya di branch redesign/professional. Commit kecil per fase/section.
- Sebelum menghapus file lama, grep dulu semua import-nya.
- Setiap fase/sub-fase yang selesai DAN lolos npm run lint + npm run build + test yang relevan:
  langsung commit lalu `git push origin redesign/professional`, tanpa menunggu persetujuan.
- Push HANYA ke redesign/professional. Jangan pernah push/merge ke main, jangan force push.
- Kalau lint/build/test gagal: JANGAN push; laporkan kegagalannya.
- Setelah push: laporkan hash commit dan link preview deploy jika ada.
- Fase tanpa perubahan file tidak perlu commit/push.
- Test di akhir fase: `npm run test:fast` (semua test kecuali `@live`; tag `@legacy3d` sudah tidak ada). `npm run test:full`
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
