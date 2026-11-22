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

## B. DeviceMockup (studi kasus, slot gambar utama)

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

## Menunggu persetujuan

1. Konsep A (lima pelat + sumbu aksen) dan B (laptop generik, mockup statis + 3D desktop).
2. DotGrid **digantikan** HeroModel (pola titik CSS statis tetap).
3. C (turntable) **tidak** dibuat.
4. Runtime three.js langsung + meshopt via `npx @gltf-transform/cli` (tanpa dependensi baru di package.json).
