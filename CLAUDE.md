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

## Dashboard (Fase 11 redesign Kinetic)
- Sejak 2026-11-27 dashboard BOLEH diselaraskan dengan design language Kinetic di Fase 11 saja: animasi
  ringan dan fungsional, tanpa efek sinematik/WebGL yang mengganggu CRUD, upload, atau auth.
  Komponennya di src/components/admin/, CSS di src/app/dashboard/admin.css (di-scope ke `.dashboard-root`).
- Sebelum Fase 11: perubahan globals.css tidak boleh mengubah dashboard. Jangan reset namespace tema default
  Tailwind (mis. `--color-*: initial`); jalankan `npx playwright test tests/admin-visual.spec.ts` setelah
  mengubah globals.css. Baseline screenshot hanya boleh diperbarui dengan sengaja di Fase 11.
- Modul bersama: src/hooks/useCollection.ts, src/types/content.ts, src/lib/site.ts,
  src/components/admin/{Modal,Confirmation,CollectionState,DashboardShell,DashboardNavbar,MotionPreference}.tsx.
- next.config.ts boleh diubah untuk redirects atas izin eksplisit.

## Lint
- Lint harus 0 error, tanpa pengecualian file aplikasi di eslint.config.mjs.

## Struktur halaman
- Setiap halaman punya tujuan sendiri (lihat "Peta Halaman" di docs/PAGE_MAP.md).
  /about, /journey, /projects, /contact harus menjadi HALAMAN MANDIRI dengan isi lebih dalam dari beranda,
  bukan potongan beranda.
- Pertahankan: rute yang ada, metadata dan canonical tiap halaman, sitemap.ts, robots.ts,
  skip-to-content, command palette ⌘K, dan form kontak yang berfungsi.

## Desain (arah baru sejak 2026-11-27: master prompt "FARHAN — KINETIC SYSTEMS")
- Arah "Quiet Editorial" DIGANTI oleh master prompt Kinetic Systems (keputusan pemilik 2026-11-27):
  "Cinematic Spatial Computing Experience & Interactive 3D Developer Portfolio" — industrial futuristik,
  tipografi Swiss minimalis, kedalaman spasial, dark mode premium, motion sinematik. Hindari gradient/neon/
  glassmorphism berlebihan dan kumpulan card monoton. Audit: docs/KINETIC_AUDIT.md.
- DESIGN.md tetap sumber kebenaran visual; ditulis ulang ke sistem Kinetic di Fase 2. Semua warna, font,
  spacing, radius, motion memakai token di src/app/globals.css. Tidak ada nilai hardcode.
- Copywriting: bahasa Inggris profesional, kecuali saya minta lain. Istilah Kinetic boleh dipakai.
- Animasi wajib menghormati prefers-reduced-motion; konten tidak boleh bergantung pada animasi/WebGL.
  LCP tetap teks/HTML server, bukan canvas. CLS < 0,05.
- Stack motion (pembagian peran, satu pemilik per properti transform):
  three + @react-three/fiber + drei + postprocessing = render 3D; @theatre/core = timeline sinematik
  (Studio HANYA dev, import dinamis, tidak pernah ter-bundle/aktif di production; state di JSON yang di-commit);
  GSAP (+ScrollTrigger, Flip, SplitText) = scroll & sequencing DOM; motion = transisi DOM/mikro-interaksi;
  Lenis = smooth scroll; maath = damping; GLSL = masking/dissolve. SATU sumber scroll progress bersama.
  @theatre/r3f TIDAK dipakai (peer fiber ^8, tidak kompatibel dengan fiber 9 / React 19).
- Jangan setState React per frame; gerakkan objek lewat ref/useFrame/uniform. Satu Canvas persisten untuk
  rute publik; satu render loop; berhenti saat tab tersembunyi/offscreen.
- Komponen dasar di src/components/ui/, frame situs di src/components/site/ (dipasang lewat
  src/app/(site)/layout.tsx; app/not-found.tsx memasangnya sendiri).

## 3D
- 3D adalah inti pengalaman (bukan lagi aksen). Sumber .blend di design/blender/, ekspor GLB di public/3d/.
- Objek boleh dibuat lewat MCP blender + Blender Skills (diutamakan untuk monogram FZ dan objek hero) ATAU
  geometri prosedural three.js (orbit, badge, partikel, garis). Identitas: monogram Fz asli
  (src/app/icon.svg, public/fz-logo.png).
- Budget: tiap GLB <= 1.5 MB (Draco/Meshopt), tekstur <= 2K (WebP/KTX2), total 3D halaman utama <= 3 MB.
- Wajib fallback tanpa WebGL (SVG/statis) dengan seluruh konten & navigasi tetap berfungsi; mobile dan
  perangkat lemah memakai kualitas adaptif (DPR, tanpa postprocessing berat).
- Jangan memakai generate_3d atau fitur berbayar lain tanpa izin saya. Poly Haven (CC0) boleh dipakai.
  Untuk Sketchfab, cek lisensinya dan catat di docs/CREDITS.md. Tidak ada aset berhak cipta tanpa izin.
- Aset video/poster lama (public/3d/entrance, flight, card) dan komponen HeroEntrance/FlyThrough/FzCard
  diganti di Fase 6–10; grep import sebelum menghapus. Riwayat lama: docs/3D_PLAN.md.

## Alur kerja
- Kerja hanya di branch redesign/professional (dikonfirmasi lagi 2026-11-27). Commit kecil per fase/section.
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
- `npm run test:browsers` (Fase 12.6, tidak termasuk test:fast): fly-through di Chromium, Firefox, WebKit.
  Lokal butuh `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 LD_LIBRARY_PATH=~/.local/pw-libs/root/usr/lib/x86_64-linux-gnu`
  (TANPA folder nss: Firefox memakai NSS bawaannya), `GST_PLUGIN_SYSTEM_PATH_1_0=<lib>/gstreamer-1.0` dan
  `GST_PLUGIN_SCANNER=<lib>/gstreamer1.0/gstreamer-1.0/gst-plugin-scanner` (H.264 di WebKit). Pustaka WPE
  ditautkan ke `~/.cache/ms-playwright/webkit-*/minibrowser-wpe/sys/lib` (daftar: ~/.local/pw-libs/wpe-symlinks.txt).
- Tetap BERHENTI dan tunggu persetujuan saya sebelum memulai fase berikutnya.

## Proses
- Jangan pernah menghentikan proses berdasarkan pola nama (pkill/killall/kill dengan filter). Hentikan HANYA
  proses yang kamu jalankan sendiri, berdasarkan PID yang kamu catat. Jangan sentuh proses proyek lain
  (mis. data-entry-web) atau dev server milik saya.
