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
