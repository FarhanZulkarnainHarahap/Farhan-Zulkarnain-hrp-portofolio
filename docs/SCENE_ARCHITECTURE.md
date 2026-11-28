# Canvas persisten dan scene manager (Fase K4)

Kode: `src/lib/scene/` (logika, tanpa React) dan `src/components/scene/` (R3F). Dasarnya adalah infrastruktur animasi K3
(docs/ANIMATION_ARCHITECTURE.md): satu ticker, store bersama, dan Lenis/native sebagai satu-satunya sumber scroll.

## Canvas persisten

- `SiteChrome` (frame rute publik) memasang `GlobalCanvasMount` di dalam `#webgl-root` (layer 2, `--z-canvas`). Auth dan dashboard punya
  frame sendiri, jadi tidak pernah memuat canvas maupun three.js (diuji).
- `GlobalCanvasMount` tidak merender apa pun di server. Setelah hidrasi, saat idle, ia menjalankan `capabilityTier()` (probe WebGL dan
  sinyal perangkat):
  - tanpa WebGL → status `unsupported`, fallback statis tetap tampil;
  - selain itu → `import("./GlobalCanvas")`.
- Satu `<Canvas>` untuk semua rute publik. Navigasi klien hanya mengganti scene; `sceneStore.mountCount` tetap 1 (diuji dengan
  penanda pada elemen `<canvas>`).
- Canvas transparan, `position: fixed`, `pointer-events: none`. Teks tetap bisa diseleksi, tombol dan form tetap berfungsi, scroll dan
  touch tetap native.

## Modul

| Nama (brief) | Implementasi | Tanggung jawab |
|---|---|---|
| GlobalCanvas | `components/scene/GlobalCanvas.tsx` | `<Canvas>` (frameloop never, transparan, ACES, sRGB, local clipping) dan susunan controller |
| SceneManager (state) | `lib/scene/store.ts` | snapshot reaktif (rute, section, scene, transisi, objek, preset, kualitas, renderer, mode render, mount count, lifecycle, aset) dan frame mutable (kamera, statistik renderer, placement, override Theatre, probe) |
| SceneController | `lib/scene/controller.ts` | API imperatif: sync rute/section, paksa scene (lab), preset, hover/select/focus/activate, pin kualitas, invalidate, lose/restore context. Debug di `window.__kinetic.scene` |
| SceneRegistry | `lib/scene/presets.ts` (data: `SCENES`, `resolveScene`) dan `components/scene/registry.ts` + `SceneModule.tsx` (modul lazy, unit box, preload) | definisi scene, loader `import()`, scene berikutnya yang di-preload |
| SceneRoot | `components/scene/SceneRoot.tsx` | memasang scene aktif dan scene yang keluar, RouteTransitionGroup, ScrollTransformGroup, Suspense, error boundary per scene, lifecycle |
| CameraController | `components/scene/CameraController.tsx` | kamera perspektif: preset, fokus, parallax pointer, sway pelan, damping maath, hook Theatre |
| LightingController | `components/scene/LightingController.tsx` | ambient, hemisphere, key (bayangan di tier high), rim aksen, point aksen, intensitas IBL; preset dengan damping |
| EnvironmentController | `components/scene/EnvironmentController.tsx` | satu environment studio prosedural (Lightformer), di-bake sekali |
| ObjectRegistry | `lib/scene/objects.ts` | objek interaktif terpasang: id, scene, label, posisi dunia, `press()` |
| InteractionController | `components/scene/InteractionController.ts` | filter raycast (hanya di `[data-scene-interactive]`, tidak di atas kontrol DOM), umpan balik kursor |
| ScrollSceneController | `components/scene/ScrollSceneController.tsx` | slot DOM → placement dunia, visibilitas, progres scroll |
| QualityManager | `lib/scene/quality.ts` + `components/scene/QualityManager.tsx` | plafon kemampuan, waktu frame dengan histeresis, DPR |
| RenderLoopController | `lib/scene/render-loop.ts` + `components/scene/RenderLoopController.tsx` | continuous / on demand / suspended di ticker bersama, jam scene yang dibatasi, statistik renderer |
| AssetManager | `lib/scene/assets.ts` + `components/scene/resources.ts` | GLB/glTF (Meshopt), PNG/WebP/SVG, HDR; cache dengan refcount, masa tenggang, preload, error; geometri dan material bersama |
| WebGLContextRecovery | `components/scene/WebGLContextRecovery.tsx` | context lost/restored, restore terbatas, remount sekali, error shader |
| WebGLFallback | `components/scene/GlobalCanvasMount.tsx` (`WebGLFallback`) + CSS | `<html data-webgl>`: fallback statis tampil kecuali saat `active` |
| InteractiveObject | `components/scene/InteractiveObject.tsx` | idle / hover / klik / exit per objek |

## Slot DOM (placement)

Tata letak halaman menentukan letak 3D. Elemen `data-scene-anchor` adalah slot sebuah scene. Setiap frame yang dirender, rect slot
diproyeksikan ke bidang z = 0 milik **kamera layout** (posisi (0, 0, 10), FOV token 35°, atau 45° untuk lebar < 768 px):

- `[data-orbit-stage]` (hero): `home`. Model orbit ada di `data-scene-props` (dari skill API, di server).
- PageHeader, kolom 1–5 di samping lead: `page` (about, journey, projects, contact). Case study: sisi kanan header (xl).
- `SectionHeader` dengan `sceneProps` (kolom label): `section` (/about #profile, #stack, #documents).
- Lab: `lab any`.

Slot tanpa kotak (disembunyikan di layar kecil) berarti scene tidak menggambar apa pun, sehingga 3D tidak menindih teks di ponsel.
Slot yang pendek (lead satu baris) diukur dari lebarnya (min 0,42 × lebar). Karena rect sudah memuat posisi scroll (Lenis atau native),
3D ikut bergerak bersama halaman tanpa sumber scroll kedua.

## Hierarki objek (satu pemilik per lapis)

```
SceneRoot
  RouteTransitionGroup       masuk/keluar scene                         SceneRoot (maath damp)
    ScrollTransformGroup     mengikuti slot DOM saat scroll             ScrollSceneController (placement)
      TheatreChoreographyGroup  nilai Theatre objects[id] (Fase 5)       Theatre
        InteractionGroup     hover scale, tilt, pegas klik               InteractiveObject (maath + pegas)
          IdleAnimationGroup putaran, float, napas (jam scene)           InteractiveObject (R3F clock)
            ObjectMesh       geometri + material (emissive, mask)        material / GLSL
```

Orbit: tiap cincin adalah grup miring (Euler ZXY −inklinasi, −roll). Node-nya ada di grup putar (IdleAnimationGroup level cincin) yang
dirotasi `kecepatan sudut × waktu scene`.

## Preset

Kamera (`CAMERA_PRESETS`) berupa offset kecil dari kamera layout, dengan batas aman dari motion sickness (offset ≤ 0,6 m, sway ≤ 0,08 m,
parallax ≤ 0,22 m). Target ikut 70 % dari parallax/sway, sehingga bidang slot hampir diam di layar dan objek yang ditunjuk tetap di bawah
pointer.

| Scene / section | Offset posisi | Target | ΔFOV | Parallax | Sway |
|---|---|---|---|---|---|
| home | (0, 0.15, −0.4) | (0, 0, 0) | −2 | 0.22 | 0.02 |
| about | (0.2, 0.1, 0) | 0 | 0 | 0.15 | 0 |
| skills (#stack) | (−0.25, 0.3, −0.2) | (0, 0.05, 0) | +2 | 0.15 | 0 |
| documents (#documents) | (0.1, −0.1, −0.3) | 0 | −1 | 0.12 | 0 |
| journey | (0.3, 0.2, 0) | 0 | 0 | 0.15 | 0.015 |
| projects | (−0.2, 0.15, −0.1) | 0 | 0 | 0.15 | 0 |
| project-detail | (0, 0, −0.2) | 0 | −2 | 0.1 | 0 |
| contact | (0, 0.2, 0) | 0 | 0 | 0.2 | 0.01 |
| fokus objek terpilih | dolly 0,6 m di garis pandang ke objek (posisi + target) | ikut dolly | 0 | ≤ 0.05 | 0 |
| preset `focus` (tombol lab / Theatre) | (0, 0, −0.6) | 0 | −4 | 0.05 | 0 |

Cahaya (`LIGHTING_PRESETS`); warna berasal dari token (key putih netral, rim dan point = aksen, hemisphere = metal/canvas):

| Preset | Ambient | Hemisphere | Key | Rim | Point aksen | IBL | Dipakai |
|---|---|---|---|---|---|---|---|
| hero | 0.18 | 0.35 | 2.4 | 1.6 | 1.2 | 0.7 | home, lab |
| page | 0.22 | 0.35 | 1.8 | 0.9 | 0 | 0.6 | about, journey, contact |
| lattice | 0.28 | 0.45 | 1.6 | 1.1 | 0.6 | 0.6 | skills |
| showcase | 0.12 | 0.35 | 2.6 | 1.4 | 0 | 0.8 | projects, project-detail |

Tier `low`: rim dan point aksen mati, ambient +0.15 (pencahayaan minimal).

## Render loop

- **Continuous** selama ada alasan aktif:
  - `scene:<id>`: scene animasi yang slotnya terlihat dan motion diizinkan;
  - `transition:<id>`, `camera` (belum settle), `lights`, `object:<id>` (respons interaksi).
- **On demand**: `invalidate(n)` saat scroll menyentuh slot yang terlihat, pointer bergerak (parallax), resize, ganti tema, kualitas,
  preset, atau rute. Setelah n frame, tick dilepas dan ticker GSAP tidur (0 rAF; diuji K3 dan entrance).
- **Suspended** saat context hilang.
- Jam scene dalam detik dengan langkah maks 50 ms. Lanjut setelah tab tersembunyi dihitung satu frame normal, jadi tidak ada lompatan.
- Orbit tetap berputar selama hero terlihat walau mouse diam. Saat discroll menjauh, orbit berhenti di posisinya dan lanjut dari sana.

## Kualitas

Tier = min(plafon kemampuan, tier runtime). Plafon berasal dari sinyal CPU/memori/Save-Data/pointer dan probe WebGL (software → low,
tanpa WebGL → minimal). Runtime memakai median waktu frame per detik: turun setelah 3 jendela lambat (> 28 ms), naik setelah 10 jendela
cepat (< 12 ms), maks 2 kali naik, jeda 20 dtk.

| Tier | DPR | Antialias | Bayangan | Detail geometri | Resolusi env | Cahaya |
|---|---|---|---|---|---|---|
| high | 1–2 | ya | key + ContactShadows (home) | 128 radial | 256 | penuh |
| medium | 1–1.5 | ya | tidak | 96 | 128 | penuh |
| low | 1 | tidak | tidak | 64 | 64 | minimal |
| minimal | tanpa WebGL (fallback) | | | | | |

Bloom selektif belum dipakai karena canvas transparan di atas layer environment; komposisi bloom dengan alpha dievaluasi bersama hero
final (Fase 6). Tier smooth scroll (Lenis) terpisah dari tier GPU.

## Pemulihan WebGL

- `webglcontextlost`: render ditangguhkan, status `lost`, fallback tampil (`data-webgl`), DOM dan navigasi tetap jalan.
- Tunggu restore dari browser. Bila tidak datang, `restoreContext()` maks 2 kali dengan jeda 1,5 dtk.
- Bila masih gagal: satu kali remount canvas. Bila tetap gagal: `failed` dan fallback permanen selama kunjungan itu.
- `webglcontextrestored`: three menginisialisasi ulang dan mengunggah ulang resource; environment di-bake ulang (`recoveries`).
- Error shader ditangkap lewat `renderer.debug.onShaderError` dan dilaporkan, scene lain tetap jalan. Kegagalan chunk, inisialisasi
  renderer, scene, atau aset juga ditangani (error boundary, status, fallback prosedural).

## Theatre (kesiapan Fase 5)

`sceneStore.frame.theatre` menerima:

- `camera` (posisi, target, FOV);
- `lights` (key, rim, environment);
- `objects[id]` (transform lapis koreografi);
- `materials[id]`;
- `mask` (progress, dissolve).

Controller membacanya di loop. Lab punya bridge "Global Camera" dan "Lighting" sebagai contoh (`CanvasLab.tsx`).
`@theatre/r3f` tidak dipakai; Studio tetap hanya di development.
