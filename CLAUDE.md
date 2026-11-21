# Aturan Redesign Portofolio

## Lingkungan
- Aplikasi Next.js ada di web/ (root git satu tingkat di atasnya). Semua path di aturan ini relatif ke web/.
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

## 3D (Blender)
- 3D hanya sebagai AKSEN, bukan tema. Sumber .blend di design/blender/, hasil ekspor di public/3d/.
- Budget: tiap GLB <= 1.5 MB (Draco/Meshopt), tekstur <= 2K WebP, total 3D halaman utama <= 3 MB.
- Wajib ada poster WebP/AVIF sebagai fallback (mobile, reduced-motion, WebGL mati), dan wajib lazy-load.
- Jangan memakai generate_3d atau fitur berbayar lain tanpa izin saya. Poly Haven (CC0) boleh dipakai.
  Untuk Sketchfab, cek lisensinya dan catat di docs/CREDITS.md.

## Alur kerja
- Kerja hanya di branch redesign/professional. Commit kecil per fase/section. Jangan push ke main.
- Sebelum menghapus file lama, grep dulu semua import-nya.
- Di akhir setiap fase: jalankan npm run lint && npm run build, laporkan hasilnya,
  lalu BERHENTI dan tunggu persetujuan saya.
