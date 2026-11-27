# Theatre.js di Kinetic Systems (Fase K3)

## Referensi

| | |
|---|---|
| Repository | https://github.com/theatre-js/theatre (lisensi Apache-2.0) |
| Paket dipakai | `@theatre/core` 0.7.2 (dependency), `@theatre/studio` 0.7.2 (devDependency) |
| Tidak dipakai | `@theatre/r3f`: peer `@react-three/fiber ^8.13.6`, tidak kompatibel dengan fiber 9 / React 19 |
| `gitHead` paket npm 0.7.2 | `2351a2c0191afbadacb3f79e611a4788610bb343`. Commit ini **tidak ada** di repo publik (`upload-pack: not our ref`), dan repo juga tidak punya tag `0.7.2`. |
| Commit referensi bacaan | `main` @ `6ea82b938ea49609489f6377ded693ccc6ee8f5b` ("Add the 1.0 notice"); tag rilis terdekat: `0.7.1` @ `f03d95a0c0a7a1b66b219a052fe7870b087f49f2` |
| Clone referensi (lokal, terisolasi) | `~/dev-refs/theatre-js`. Berada di luar repo proyek, tidak di-bundle, dan tidak di-commit. |

**Perbedaan penting.** Di `main` (pasca-0.7), `BasicKeyframedTrack.keyframes` berupa `PointableSet` (`{byId, allIds}`).
Di paket 0.7.2 yang terpasang, isinya **array** `Keyframe[]`. Jadi state JSON mengikuti `node_modules/@theatre/core/dist/index.d.ts`,
bukan source di `main`. Source `main` dipakai untuk memahami konsep (Project, Sheet, Sequence, rafDriver), bukan sebagai format data.

## Konsep yang dipakai

- **Project** `"Kinetic Systems"`: satu project; state awalnya dari `src/theatre/kinetic-systems.theatre.json`.
- **Sheet**: satu per area koreografi, dengan ID tetap di `THEATRE_SHEETS` (`src/lib/animation/config.ts`):
  Hero Orbit, Global Camera, Lighting, Scroll Masking, Page Transition, Project Showcase, Journey Timeline, Animation Lab.
- **Sheet Object**: dideklarasikan di `THEATRE_OBJECTS` (`src/lib/animation/theatre/props.ts`).
  - Posisi X/Y/Z, rotasi X/Y/Z, scale.
  - Posisi kamera, target kamera, FOV.
  - Intensitas cahaya.
  - Roughness, metalness, emissive intensity.
  - Progres mask/dissolve dan uniform shader (feather, noiseScale, edgeGlow).
- **Sequence / keyframe / timeline**: tiap sheet punya satu sequence.
  - Sheet berbasis waktu: panjang dalam detik (Animation Lab: 4 dtk).
  - Sheet yang disinkronkan ke scroll: panjang 1, sehingga `sequence.position` = progres scroll (Scroll Masking).
- **Animation state / subscription**: `object.onValuesChange(fn, rafDriver)` menulis nilai ke sebuah ref (`useTheatreObject`).
  R3F membacanya di `useFrame` lewat driver (`src/lib/animation/three/drivers.ts`). Tidak ada React state per frame.
- **rafDriver**: `createRafDriver({ start, stop })` di-tick oleh fase `timeline` ticker bersama (`src/lib/animation/ticker.ts`).
  Tick hanya terpasang saat Theatre memintanya, jadi tidak ada loop rAF tambahan.

Urutan per frame: Lenis/ScrollTrigger (fase `scroll`) dapat mengeset `sequence.position`, lalu Theatre menghitung nilai (fase `timeline`),
lalu R3F merender (fase `render`).

## Studio, khusus development

- `src/lib/animation/theatre/studio.ts` memakai `if (process.env.NODE_ENV === "development") { await import("@theatre/studio") }`.
  Di build production cabang itu dihapus. Pemeriksaannya ada di `tests/animation.spec.ts`: JS yang dimuat rute publik tidak mengandung
  penanda Studio, Theatre core, three.js, atau kode lab. Hasil `grep` pada `.next/static` juga 0 file.
- Urutan: `@theatre/core` dimuat lebih dulu, lalu `studio.initialize({ __experimental_rafDriver })` memakai driver ticker bersama
  (tanpa loop rAF Studio sendiri), lalu `getProject`.
- Studio 0.7.2 memeriksa pembaruan ke `updates.theatrejs.com` (tanpa opsi untuk mematikannya). Hanya di development.
- Di development pun UI Studio opsional. Ia aktif di `/dev/animation-lab` (kecuali `?studio=0`) atau di halaman mana pun dengan `?studio=1`.

## Alur kerja keyframe

1. `npm run dev`, lalu buka `/dev/animation-lab` (Studio terbuka).
2. Pilih sheet atau objek, edit keyframe di panel sequence.
3. Studio menyimpan perubahan di localStorage browser, dan state itu menimpa JSON. Untuk menyimpan ke Git: Studio → klik project
   "Kinetic Systems" → **Export** → timpa `src/theatre/kinetic-systems.theatre.json`.
4. Commit JSON tersebut. Production hanya membaca JSON ini.

Mengganti nama sheet atau objek membuat keyframe-nya yatim di JSON. ID sengaja dibuat tetap.

## Validasi state JSON

State awal ditulis dengan format 0.7.2 lalu diverifikasi dengan `@theatre/core` 0.7.2 sungguhan di Node:
keyframe dimuat, interpolasi bezier benar (misalnya Lab Object `position.y` = 0,35 di t = 2 dtk;
Scroll Masking `progress` = 0 di posisi 0,3 dan 1 di 0,85), dan `onValuesChange` terpanggil saat posisi berubah.
