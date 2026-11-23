# 3D Plan (Fase 10)

Aturan: CLAUDE.md → 3D. 3D hanya **aksen**. Semua aset dibuat lewat MCP blender + Blender Skills;
tanpa GLB lama dari `public/models`, tanpa geometri three.js pengganti aset, tanpa sumber luar/generator.
Sumber `.blend` di `design/blender/` (dari Blender Windows: `\\wsl.localhost\Ubuntu-24.04\home\nexxusfz\
nexxus-project\nexxus-portofolio\web\design\blender\`), ekspor ke `public/3d/`.

## 10.0 Lingkungan (sudah dicek)

| | |
|---|---|
| Blender | 5.2.1 LTS, mesin `BLENDER_EEVEE` |
| Addon MCP | 2.0, protokol 16 (up to date), telemetry off |
| Library aset (Poly Haven, Sketchfab, Poly Pizza) | semua **off** → semua geometri dan pencahayaan dibuat prosedural |
| Generator berbayar (Tripo, Hunyuan3D, Hyper3D, Meshy) | semua **off** (dan tidak akan dipakai) |
| Ekspor | glTF 2.0 (Draco tersedia; format gambar WebP/JPEG) |
| Scene saat ini | default (Camera, Cube, Light), belum tersimpan |

## Workaround pratinjau (pengganti tool `look`)

Tool `look` dari MCP tidak bisa dipakai di setup ini: Blender (Windows) menulis gambar sementaranya ke
`/tmp` Windows, sedangkan server MCP (WSL) mencarinya di `/tmp` WSL → "file not found". Penggantinya: helper
`snap()` di Blender (`bpy.app.driver_namespace["snap"]`) memasang kamera sementara dari beberapa arah dan
merender langsung ke folder WSL lewat path UNC `\\wsl.localhost\Ubuntu-24.04\...` (Workbench untuk bentuk,
EEVEE untuk material/cahaya), lalu gambar dibuka dari WSL. Kamera sementara dihapus setelahnya.

## Keputusan checkpoint

- **Checkpoint 1 (disetujui):** jarak pelat 36 cm; kamera poster HeroModel 3/4 rendah (~20°).
  DeviceMockup: area keyboard dilunakkan; kamera **tegak lurus bidang layar** (ikut menunduk ~15°), lensa
  85–100 mm, shift lensa untuk membingkai deck, sehingga area layar tetap persegi panjang lurus (CSS biasa).
  Koordinat 4 sudut layar diekspor dalam persen dan diverifikasi lurus (selisih < 0,5%).
- **B hanya statis** di semua perangkat: tanpa GLB/three.js di halaman studi kasus.

## Keputusan lintas aset

- **Gaya:** minimalist-style — bentuk sederhana, tepi dibulatkan halus, material matte seperti keramik/clay,
  satu aksen terakota. Tanpa tekstur bitmap (warna flat PBR) → file kecil, tajam di semua DPI.
- **Warna mengikuti tema di web:** material diberi nama tetap (`MAT_Surface`, `MAT_Line`, `MAT_Accent`,
  `Screen`). Di browser, warna base material diisi dari token yang sudah di-resolve (`--ui-raised`,
  `--ui-ink`, `--ui-accent`, …) sehingga light/dark ikut berganti tanpa reload (pola yang sama dengan
  DotGrid). Poster dirender dua kali di Blender dengan palet light dan dark dari DESIGN.md.
- **Kompresi:** ekspor glTF tanpa Draco dari Blender, lalu `npx @gltf-transform/cli optimize --compress
  meshopt` (meshopt + kuantisasi). Alasan: decoder meshopt ~20 KB JS sudah ada di three
  (`three/examples/jsm/libs/meshopt_decoder.module.js`), sedangkan decoder Draco ±300 KB wasm harus di-host
  sendiri — lebih berat daripada penghematannya untuk model sekecil ini.
- **Runtime web:** three.js langsung (bukan React Three Fiber/drei) untuk memperkecil chunk; dimuat
  dinamis (`ssr:false`) hanya di desktop + pointer halus + tanpa reduced motion + WebGL2 + saat terlihat
  (gating yang sama dengan DotGrid). Render **on demand**: tidak ada loop rAF saat diam (sesuai Fase 8/9).
  Tidak ada ScrollTrigger.
- **Gerak:** rotasi pelan mengikuti pointer (lerp kecil, maks. ±8°), kembali diam saat pointer pergi.
  Tanpa loop/idle spin (DESIGN.md: "nothing loops").
- **Penamaan Blender:** `COL_*`, `SM_*`, `MAT_*`, `LGT_*`, `CAM_*`.

## A. HeroModel (beranda, slot visual hero)

**Konsep:** padanan 3D dari ilustrasi /about — lima pelat tipis bertumpuk (Interface → API → Service →
Database → Deployment) dengan jarak lega, sudut membulat, dan relief halus (inset) yang meniru glif di
ilustrasi. Satu batang tipis vertikal (sumbu) berwarna aksen menembus pusat tumpukan sebagai satu-satunya
warna. Dilihat dari kamera 3/4 atas yang sama dengan ilustrasi supaya terasa satu keluarga.

**Production brief**

| | |
|---|---|
| Tipe | Prop/komposisi abstrak (hero accent) |
| Target | Web (three.js), desktop saja; mobile = poster |
| Gaya | minimalist-style |
| Polycount | ≤ 12.000 segitiga total (5 pelat × ≈2.000 + sumbu) |
| Tekstur | tidak ada (warna flat), 3 material |
| GLB | target ≤ 200 KB setelah meshopt (budget 1,5 MB) |
| Poster | `hero-poster-{light,dark}.{avif,webp}`, 1200×1500 (4:5 slot), latar transparan, target ≤ 120 KB per file |
| Pivot | pusat tumpukan di origin, Y-up |
| Animasi | tidak di-bake; interaksi pointer dihitung di web |

**Pipeline dan skill**
1. `/blender-director` — brief ini, struktur koleksi, skala (1 unit = 1 m, tumpukan ±1 m).
2. `/minimalist-style` — proporsi, jarak antar pelat, radius bevel, palet.
3. `/procedural-modeling` — pelat parametrik lewat skrip (lebar, kedalaman, tebal, jarak) agar mudah disetel.
4. `/hard-surface` — bevel/chamfer tepi, inset glif dangkal, weighted normals.
5. `/materials` — `MAT_Surface` (clay matte), `MAT_Line` (inset/tepi lebih gelap), `MAT_Accent` (sumbu).
6. `/lighting` — studio lembut (key area besar + fill + rim tipis), world netral prosedural (HDRI Poly Haven nonaktif di addon).
7. `/lookdev` — cek light/dark lewat `look` (shading rendered) sampai tenang dan terbaca.
8. `/rendering` — EEVEE, AgX, film transparan, dua poster (light/dark).
9. `/asset-optimization` — apply modifier, hapus face tersembunyi, hitung segitiga, nama bersih.
10. `/export-pipeline` — glTF binary Y-up, lalu gltf-transform meshopt; verifikasi ulang ukuran.
11. `/qa-review` — screenshot dari beberapa sudut, checklist, putuskan kirim/tidak.

**DotGrid di slot hero — usulan: digantikan.** Di desktop yang mampu, HeroModel menggantikan DotGrid
(satu konteks WebGL saja; dua lapisan yang sama-sama bereaksi terhadap pointer akan saling bersaing).
Pola titik **CSS statis** tetap menjadi latar tenang di belakang poster/model (tanpa JS). Komponen
`DotGrid`/`HeroDotGrid` dihapus (grep import dulu) beserta test-nya, diganti test HeroModel dengan
jaminan yang sama (gating, tanpa rAF saat diam, ikut tema). Alternatif yang tidak saya sarankan:
DotGrid tetap sebagai latar di belakang model (2 konteks WebGL, lebih berat), atau DotGrid sebagai
fallback (fallback seharusnya statis, bukan WebGL).

**Urutan tampil di slot:** poster (gambar statis, `fetchpriority="low"`, tidak memengaruhi LCP H1) →
saat model siap di desktop, cross-fade 240 ms ke canvas. Mobile / pointer kasar / reduced motion /
tanpa WebGL: poster saja, GLB tidak diunduh.

## B. DeviceMockup (studi kasus, slot gambar utama) — DIHAPUS di Fase 10.5

> Fase 10.5 (keputusan pemilik): mockup laptop dihapus dari studi kasus. Gambar utama kembali ke
> `ProjectImage` biasa (16:10, `--media-radius`, border hairline, priority). `public/3d/device/`,
> `DeviceMockup.tsx`, `device-screen.ts`, token `--device-shadow-color` dan test-nya dihapus. Scene
> `Device` di `design/blender/portfolio-3d.blend` tetap sebagai arsip. Bagian di bawah adalah catatan
> historis.

**Konsep:** laptop generik tanpa logo: deck tipis dengan trackpad dan area keyboard berupa inset halus
(tanpa ratusan tombol), engsel, layar terbuka ±105°, bezel tipis. Mesh layar terpisah dengan material
bernama **`Screen`**, UV 0–1 pas ke area tampilan **16:10** (sama dengan rasio `ProjectImage`), sehingga
`imageUrl` proyek dipasang sebagai tekstur di web tanpa distorsi.

**Production brief**

| | |
|---|---|
| Tipe | Hard-surface prop |
| Target | Web (three.js) desktop; semua perangkat = mockup statis |
| Polycount | ≤ 20.000 segitiga |
| Tekstur | tidak ada di GLB (tekstur layar diisi di web dari `imageUrl`) |
| GLB | target ≤ 300 KB setelah meshopt |
| Render statis | `device-front-{light,dark}.{avif,webp}` + `device-screen-rect.json` |
| Pivot | tengah bawah deck, Y-up |

**Mockup statis tanpa WebGL (untuk semua perangkat):** satu render tampak depan sedikit dari atas
dengan area layar yang tegak lurus kamera, dirender dengan layar transparan. Blender juga mengekspor
posisi area layar dalam persen (`device-screen-rect.json`). Di web, screenshot proyek diletakkan dengan
CSS tepat di area itu → mockup perangkat berisi gambar proyek yang asli, tanpa 3D, di mobile pun.
Versi 3D interaktif (tilt halus mengikuti pointer, tanpa loop) hanya untuk desktop yang mampu.
Kalau gambar proyek gagal: tetap tampil "Image unavailable" di dalam layar.

**Pipeline dan skill:** `/blender-director` → `/hard-surface` (bodi, engsel, bevel) → `/minimalist-style`
→ `/uv-workflow` (UV layar 0–1 tepat 16:10) → `/materials` (`MAT_Body`, `MAT_Bezel`, `Screen`) →
`/lighting` + `/rendering` (render depan transparan, light/dark, ekspor rect layar) →
`/asset-optimization` → `/export-pipeline` (glTF + meshopt) → `/qa-review`.

## C. Turntable untuk mobile — usulan: **tidak perlu**

Video turntable melanggar "tanpa loop" di DESIGN.md, menambah ±1–2 MB untuk mobile, dan tidak menambah
informasi dibanding poster. Mobile cukup poster statis (A) dan mockup statis (B).

## Anggaran

| Item | Target |
|---|---|
| `hero-model.glb` | ≤ 200 KB |
| `hero-poster-*` (2 tema × AVIF/WebP) | ≤ 120 KB per file; browser hanya memuat satu |
| `device-mockup.glb` | ≤ 300 KB (hanya di halaman studi kasus) |
| `device-front-*` | ≤ 150 KB per file |
| Total 3D beranda (desktop) | ≈ 0,35 MB aset (budget 3 MB) |
| JS three.js (chunk lazy, hanya desktop mampu) | dilaporkan saat implementasi; tidak masuk First Load JS |

## Test (implementasi)

Poster ada di HTML awal; GLB/three hanya dimuat di desktop mampu (chunk diff seperti test DotGrid);
0 rAF dan 0 draw saat diam; warna ikut ganti tema; reduced motion/mobile = statis; mockup statis
menempatkan gambar proyek di area layar; ukuran setiap file ≤ budget; 0 issue dev overlay.

## Keputusan final (disetujui) dan hasil

Keputusan pemilik: A dibuat; **B statis saja** (tanpa GLB/three.js di studi kasus); DotGrid **dihapus**
dan diganti HeroModel (pola titik CSS statis tetap, token `--dots-*`); C tidak dibuat; runtime three.js
langsung + meshopt. Koreksi Checkpoint 2: metallic laptop gelap 0,6 → 0,3; ujung sumbu diberi bevel
(0,006 m, 3 segmen).

### Pipeline akhir

1. `/asset-optimization`: PASS. Hero 2.844 segitiga (budget 12.000), 3 material, 0 non-manifold, skala
   di-apply, nama `SM_/MAT_/LGT_/CAM_`.
2. `/export-pipeline`: glTF binary dari scene `Hero` (`use_active_scene`, seleksi dibersihkan di semua
   scene), Y-up, modifier di-apply, tanpa tekstur, `CAM_Hero` ikut.
3. meshopt: `npx @gltf-transform/cli` macet saat instalasi (unduhan `sharp`), jadi langkah yang sama
   dijalankan dengan library `@gltf-transform/{core,extensions,functions}` + `meshoptimizer` di folder
   sementara (tanpa dependensi baru di package.json): dedup → flatten → join → weld → prune → reorder →
   quantize → `EXT_meshopt_compression` (filter). 75.960 B → **21.080 B**, 3 mesh (3 draw call).
4. `/qa-review`: lihat verdict di bawah.

### Integrasi web

- **HeroModel** (`src/components/hero3d/`): `HeroVisual` (poster + slot) → `HeroModelSlot` (gating dari
  `src/lib/webgl-capability.ts`, IntersectionObserver, import dinamis) → `heroScene.ts` (three.js,
  `GLTFLoader` + `MeshoptDecoder`, kamera dari GLB, render on demand, `dispose()` + `forceContextLoss`).
  Warna material dari token `--model-surface/line/accent`; rig cahaya per tema (`RIGS`) disetel terhadap
  poster (selisih rata-rata piksel ≈ 2,7/255 light, 3,1/255 dark) sehingga cross-fade 240 ms nyaris tak
  terlihat.
- **LCP:** poster 4:5 penuh ternyata lebih besar dari H1 (poster jadi elemen LCP). Perbaikan: poster
  di-crop ke batas alpha model (x 224–968, y 256–1272 dari 1200×1500) dan model digambar pada
  `MODEL_SCALE = 0,8` di tengah bingkai (rect poster diskalakan, kamera three.js `zoom = 0,8`, tetap
  sejajar piksel). Luas poster ≤ 0,73× teks H1 di 1024–1920 px; H1 tetap LCP (diuji).
- **Koreksi warna sumbu gelap:** rig gelap (key 680 W) membuat sumbu `#DE916C` terbakar menjadi
  (255,255,203). Untuk render poster gelap saja, albedo `MAT_Accent` dikompensasi ×0,4 → sumbu terbaca
  (221,150,117) ≈ token. `.blend` disimpan dengan palet light.
- **DeviceMockup** statis (`src/components/case-study/`), render via `ThemedPicture`
  (`src/components/media/`), bayangan elips dari token `--device-shadow-color`.

### Aset

| File | Ukuran | Budget |
|---|---|---|
| `public/3d/hero-model.glb` | 21,1 KB | ≤ 200 KB |
| `public/3d/hero/{light,dark}-{320,560,744}.avif` | 12,1–23,6 KB | ≤ 120 KB |
| `public/3d/hero/{light,dark}-{320,560,744}.webp` | 21,4–40,2 KB | ≤ 120 KB |
| `public/3d/device/{light,dark}-{640,960,1280,1600}.avif` | 3,1–5,5 KB | ≤ 150 KB |
| `public/3d/device/{light,dark}-{640,960,1280,1600}.webp` | 5,0–12,5 KB | ≤ 150 KB |
| `design/blender/portfolio-3d.blend` | 133 KB | sumber |

Yang diunduh di beranda desktop mampu: satu poster (≈ 20 KB) + GLB 21 KB + chunk three.js (lazy).
Mobile/reduced motion: tanpa GLB dan tanpa three.js; mobile juga tanpa poster (slot disembunyikan).

### QA verdict (`/qa-review`)

**SHIP WITH NOTES.** Sudut 3/4, profil, atas, belakang, dan per-objek untuk Hero dan Device; poster
dibandingkan dengan canvas three.js; tidak ada blocker atau major.
- Fixed: sumbu gelap overexposed (lihat di atas); kamera sementara `CAM_snap` yang tertinggal dihapus.
- Minor: bayangan antarpelat di canvas sedikit lebih tipis daripada render Blender (area light vs
  directional light + PCF); perbedaannya hanya terlihat saat dibandingkan berdampingan.
- Note: ruang kosong di sekitar model bertambah karena `MODEL_SCALE` (keputusan LCP).

## Fase 11 — bersih-bersih aset lama

- Dihapus: GLB/poster Kinetic `public/models/**` (12,5 MB), `public/visuals/system-map.svg`,
  `public/icons/capability/*`, sumber `.blend` lama `assets/blender/` dan skrip pipeline-nya
  `scripts/blender/`, `scripts/qa/check-models.mjs`, serta `previews/`. Semuanya masih ada di riwayat git.
- Aset 3D yang tersisa hanya `public/3d/` (hasil Fase 10) dan sumbernya `design/blender/portfolio-3d.blend`.
- **Sisa yang tidak berbahaya:** `next.config.ts` masih punya rule `headers()` untuk `/visuals/:path*`
  (cache immutable). Foldernya sudah tidak ada, jadi rule itu tidak pernah cocok dengan file apa pun.
  `next.config.ts` termasuk lapisan terlarang, jadi rule itu sengaja dibiarkan.

## Fase 10.5 — Kartu Fz (Checkpoint A0, disetujui)

- **Bentuk (pilihan b):** kartu 0,8 × 1,0 (4:5), tebal 0,11 = lima lapis × 0,022, sudut radius 0,055.
  Scene `Card`, koleksi `COL_Card`, pivot `EMPTY_Card`.
- **Monogram:** Newsreader 400 (sama dengan H1). F timbul 12 mm krem, z inlay rata terakota, diselipkan
  di bawah lengan atas F dengan celah tipis. Celah tersempit 9 px pada kartu selebar 320 px (20 px pada
  640 px). Ukiran "MEDAN, INDONESIA" / "UTC+7" Geist Mono, dalam 2 mm. Font sumber di
  `design/blender/fonts/` (OFL).
- **Warna (cermin token):** light kartu `--paper-200`, F `--paper-50`, z `--clay-600`, ukiran `--paper-500`,
  glif `--paper-700`; dark kartu `--night-700`, F `--night-50`, z `--clay-400`, ukiran `--night-500`,
  glif `--night-200`. Latar render transparan. Rig cahaya sendiri (`LGT_Card_*`) dengan key/fill di garis bagi
  normal "atas" dan "depan", jadi muka kartu sama terangnya saat tegak maupun rebah (diukur: light
  #e8e1d5 tegak / #e1dbd0 rebah vs token #e4ded3).
- **Glif lapis:** API, Service, Database, Deployment di muka atas lapisnya (tertutup lapis di atasnya);
  glif jendela Interface di SISI BAWAH lapis Interface (muka atas = muka kartu dengan monogram). Syarat
  fly-through scene 1: kamera memperlihatkan glif jendela itu dengan jelas saat pelat Interface terangkat
  dan miring.
- **Transisi membelah → tumpukan HeroModel:** tiap lapis memakai topologi pelat Hero (36 titik per cincin).
  Basis = lapis kartu tipis, shape key `Plate` = pelat Hero (1 × 1 × 0,06, radius 0,07). Bevel dua atribut
  (`bevel_outer` 0,012 → 0,008, `bevel_seam` 0,0015 → 0,008), glif, monogram dan cutter ukiran digerakkan
  driver dari nilai morph yang sama. Pada morph = 1 dan posisi z = ±0,72/±0,36/0 tanpa rotasi, mask alfa
  render `CAM_Hero` identik dengan scene Hero (0 dari 116.626 piksel berbeda; sumbu, monogram dan glif
  Interface dikecualikan karena berbeda sengaja).
- **Catatan warna:** pelat HeroModel memakai `--model-surface` (light `--paper-50`), kartu `--paper-200`.
  Disatukan bila HeroModel dipertahankan.
- Render A0: `.qa/fase10-5/a0/` dan `.qa/fase10-5/a0-compare/` (tidak di-commit).

## Fase 10.5 — Rencana entrance + fly-through (Checkpoint A, DISETUJUI 2026-11-23)

Semua klip dirender di Blender (scene `Card`, koleksi `COL_Card` + `COL_Film`) lewat MCP; tanpa
generator berbayar. Satu timeline Blender yang kontinu (30 fps) berisi entrance + seluruh fly-through;
klip web = potongan rentang frame dari timeline itu.

### Jaminan seam (frame-identical)

- Kamera dan semua objek di-keyframe pada SATU timeline. Frame batas tiap klip dirender sekali dan
  dipakai sebagai frame terakhir klip i dan frame pertama klip i+1 (file PNG yang sama masuk ke kedua
  encode).
- Entrance TIDAK dirender terpisah: frame entrance = potongan tengah 4:5 dari render 16:9 kamera yang
  sama (fit vertikal). Terbukti: potongan tengah F0 vs frame entrance terakhir selisih 0 (max 0/255).
  Render terpisah pada resolusi lain TIDAK identik (EEVEE: 3 % piksel beda > 2/255 di tepi AA dan
  bayangan), jadi aturan potong ini wajib.
- Frame terakhir entrance = poster hero baru = frame pertama fly-through (F0).
- Morph lapis → pelat Hero identik (Checkpoint A0: mask alfa 0 piksel beda).

### Timeline entrance (2.000 ms, 60 frame) — klip `entrance`

| ms | Frame | Kejadian | Easing |
|---|---|---|---|
| 0–450 | 0–13 | Kartu Fz utuh melayang masuk dari kanan-atas, miring ±14°, menghadap kamera | ease-enter |
| 450–800 | 13–24 | Mendarat dan rebah ke belakang; retak rambut muncul di 700–800 ms | ease-standard |
| 800–1.250 | 24–37 | Membelah horizontal menjadi lima lapis; tiap lapis menebal 0,022 → 0,06 dan melebar ke 1 × 1 (shape key `Plate`) | ease-standard |
| 1.250–1.650 | 37–49 | Lapis terangkat ke jarak 0,36 dan terkunci (glif tiap lapis terlihat saat terbuka) | ease-enter |
| 1.650–1.850 | 49–55 | Sumbu terakota turun dari atas menembus tumpukan | ease-standard |
| 1.850–2.000 | 55–60 | Sumbu menyala sekilas (emisi 0 → 4 → 0); frame 60 = tumpukan terkunci = F0 | ease-exit |

Kunjungan berikutnya dalam sesi yang sama (`sessionStorage`): klip yang sama diputar dari 1.500 ms
(±0,5 dtk: lapis mengunci + sumbu menyala). Diputar sekali, `autoplay muted playsinline`, tanpa loop,
tanpa kontrol; poster awal = frame 0 (kartu utuh).

Teks hero (GSAP, durasi/easing dari token; H1 dan Navbar TIDAK dianimasikan):
150 ms garis aksen di bawah H1 tergambar kiri → kanan · 250 ms eyebrow · 400 ms positioning naik per
baris · 550 ms CTA bergantian · 700 ms status + kilau ShinyText · ±2.000 ms penanda "Scroll to explore ↓"
dengan satu dorongan halus (tanpa loop; hilang saat mulai scroll).

### Fly-through (frame 0 = F0, 30 fps) — scene + connector

| Klip | Frame | Durasi | Isi | Kamera |
|---|---|---|---|---|
| S1 Interface | 0–120 | 4,0 dtk | Pelat Interface terangkat dan miring −38° sehingga SISI BAWAHnya (glif jendela) menghadap kamera; kartu, kolom dan tombol UI bermunculan dari glif jendela; bola request lahir dari tombol | Dari bawah-depan, lampu bawah `LGT_Card_Under` menyala hanya di scene ini (syarat A0: glif jendela terlihat jelas) |
| C1 | 120–165 | 1,5 dtk | Interface kembali ke tumpukan; request turun sejajar sumbu | Turun mengikuti bola |
| S2 API | 165–285 | 4,0 dtk | Tiga garis API menyala bergantian (emisi per garis); request melesat menembus pelat | Orbit setengah lingkaran di level API |
| C2 | 285–330 | 1,5 dtk | Lapis atas membuka; request turun | Mengikuti |
| S3 Service | 330–450 | 4,0 dtk | Ubin 2×2 berbalik satu per satu (sisi belakang terakota); request keluar dengan jejak lebih tebal | Atas-depan, mendekat |
| C3 | 450–495 | 1,5 dtk | Request turun | Mengikuti, mulai merendah |
| S4 Database | 495–615 | 4,0 dtk | Empat baris tabel terisi bergantian | Menukik ke sudut rendah |
| C4 | 615–660 | 1,5 dtk | Request turun ke Deployment | Mengikuti |
| S5 Deployment | 660–780 | 4,0 dtk | Simpul tumbuh menjadi jaringan titik dan garis; tumpukan menyala sekilas | Mundur jauh |
| C5 | 780–825 | 1,5 dtk | Lapis merapat dan menipis kembali (morph 1 → 0) | Mendekat ke depan |
| S6 Penutup | 825–945 | 4,0 dtk | Kartu Fz utuh sejenak (monogram) → mengembang dan menyebar menjadi tiga kartu proyek → berhenti tepat di posisi grid Selected work; crossfade ke kartu HTML asli dari data, sinkron dengan frame terakhir | Lurus ke depan |

Total fly-through 31,5 dtk (945 frame). Jalur request sejajar sumbu (offset x 0,14) supaya jejaknya
tidak tertutup sumbu. Gerak: easing halus, tanpa kedip, tanpa loop.

### Varian, light/dark, mobile

- **Dua set klip (light + dark)**, bukan satu set netral: H.264 tidak punya alfa, jadi latar kanvas
  (`--ui-canvas`) ikut terbakar di video; satu set netral pasti tidak cocok dengan salah satu tema. Hanya
  set tema aktif yang diunduh; ganti tema → klip yang sudah termuat diganti lazily.
- **Mobile:** rantai portrait 9:16 asli (720 × 1280, GOP 4) dari timeline yang sama dengan kamera
  portrait sendiri (bukan crop 16:9); `stillMobile` = frame pertama tiap klip portrait.
- **Reduced motion / tanpa JS:** video tidak diunduh. Visual hero = **tumpukan terkunci** (bukan kartu
  utuh): itu frame yang menyambung ke still tiap scene, menjelaskan lima lapis tanpa gerak, dan monogram
  tetap terlihat di pelat teratas. Section fly-through = still per scene + teks.

### Integrasi web (rencana untuk Checkpoint B)

- `references/scrub-engine.js` dari skill dipasang di komponen `"use client"` (mount di `useEffect`,
  dibersihkan saat unmount): `nav: false`, `atmosphere: false`, font dan warna dari token, blob-seek,
  prefetch lazy saat section mendekat.
- Teks tiap scene (eyebrow + judul + satu kalimat + indikator 1/5–5/5) dianimasikan GSAP sinkron dengan
  progres scroll; ScrollTrigger tidak di bundle utama (bila perlu, dimuat dinamis di chunk section ini).
  Semua teks scene ada di HTML awal.
- H1, positioning dan CTA tetap teks server di atas lipatan (H1 = LCP). Section fly-through setelah hero,
  sebelum Selected work.

### Estimasi ukuran dan waktu render (diukur, bukan ditebak)

Uji: orbit 3 dtk (90 frame) 1080p di scene ini, latar kanvas, encode sesuai skill.

| Varian | Laju terukur | Fly-through 31,5 dtk | Budget |
|---|---|---|---|
| Desktop 1920 × 1080, CRF 20, GOP 8 | 276 KB/dtk | ≈ 8,5 MB per tema | ≤ 10 MB ✓ |
| Mobile 720 × 1280, CRF 23, GOP 4 | ≈ 107 KB/dtk | ≈ 3,4 MB per tema | ≤ 4 MB ✓ |
| Entrance desktop 4:5 (864 × 1080, potongan render 1080p, 2 dtk) | ≈ 150 KB/dtk | ≈ 0,3 MB | ≤ 600 KB ✓ |
| Entrance mobile 4:5 (720 × 900, potongan rantai portrait, 2 dtk) | ≈ 90 KB/dtk | ≈ 0,18 MB | ≤ 300 KB ✓ |

Gerak cepat (orbit S2) adalah kasus terberat; scene yang lebih tenang lebih kecil. Kalau hasil akhir
melewati budget: CRF 21–22 atau GOP 12 di desktop.

Waktu render EEVEE: 1,25 dtk/frame 1080p (termasuk tulis PNG lewat jaringan WSL), ±0,6 dtk/frame
720 × 1280. Desktop 1.005 frame (entrance dipotong dari render yang sama) + mobile 1.005 frame, × 2
tema ≈ **65–80 menit** render, ditambah ±5 menit encode (ffmpeg-static lokal, tanpa instalasi global).

### HeroModel three.js — DIHAPUS (keputusan pemilik, Checkpoint A)

Perannya (visual hero yang hidup) digantikan entrance + fly-through. Menghapusnya menghemat ±158 KB gzip
JS three.js di desktop yang mampu (First Load beranda awal tidak berubah karena chunk-nya dinamis),
menghapus satu konteks WebGL, dan menghilangkan selisih warna `--model-surface` vs kartu. Visual hero
menjadi video entrance + poster (frame terakhir entrance). `three` dan `@types/three` bisa ikut dihapus
dari package.json kalau tidak ada pemakai lain.

### Storyboard

Lokasi gambar: `.qa/fase10-5/a/` (lihat laporan Checkpoint A).

## Fase 10.5 — Checkpoint B (dev)

- Timeline Blender: entrance frame 1–61, S1 Interface frame 61–181 (30 fps); kamera desktop `CAM_Card`
  (fit vertikal 36 mm, sama dengan `CAM_Hero`), kamera mobile `CAM_Card_M` (Copy Transforms, lensa × 0,72).
- Entrance: potongan **568 × 930** dari render 1080p (gabungan bounding box alfa seluruh gerak, x 676,
  y 0), supaya kotak elemen kecil dan H1 tetap LCP. Lebar `--entrance-width: min(16vw, 14rem)`.
  Desktop saja: di 390 px poster mana pun yang berarti lebih besar dari H1 (31.648 px²).
- Ukuran: entrance 198 KB (light) / 130 KB (dark); S1 desktop 681 / 474 KB, mobile 478 / 377 KB
  (≈ 170 / 120 KB per detik → proyeksi film penuh ≈ 5,4 MB desktop, ≈ 3,8 MB mobile per tema).
- Warna latar video vs token kanvas: selisih ≤ 1/255 (diukur di browser).
- Panjang scroll: 0,8 layar per scene + 0,4 per connector + 1 → film penuh 7,8 layar (default skill
  13,3). Checkpoint B (S1 saja): 1,8 layar.
