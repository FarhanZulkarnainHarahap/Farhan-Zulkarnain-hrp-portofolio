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
