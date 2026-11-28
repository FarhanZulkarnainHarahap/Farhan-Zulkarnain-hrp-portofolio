# Arsitektur animasi: Kinetic Systems (Fase K3)

Sumber kode: `src/lib/animation/`, `src/components/animation/`, `src/components/animated/`, `src/components/three/`.
Canvas persisten dan scene manager (Fase K4): docs/SCENE_ARCHITECTURE.md.
Token: `src/app/globals.css` → `src/lib/design-tokens.ts`. Theatre: `docs/THEATRE.md`. Playground: `/dev/animation-lab` (khusus dev).

## Tanggung jawab tiap engine

| Engine | Tanggung jawab | Di mana |
|---|---|---|
| three | Render 3D: geometri, material, cahaya | scene (Fase 4+), lab |
| @react-three/fiber | Integrasi React dan satu render loop (`frameloop="never"` + `advance` dari ticker) | `components/three/TickerFrameloop.tsx` |
| drei | Utilitas 3D: Environment/Lightformer, PerformanceMonitor (DPR adaptif) | lab, Fase 4+ |
| Theatre.js (`@theatre/core`) | Koreografi sinematik dan timeline keyframe | `lib/animation/theatre/*`, `TheatreProvider` |
| GSAP | Sequencing DOM yang kompleks (intro, reveal, Flip) | `lib/gsap.ts`, `lib/animation/gsap-utils.ts`, `MotionController` |
| ScrollTrigger | Satu-satunya pemetaan scroll → progres (0–1); diimpor dan didaftarkan lazy | `lib/animation/scroll-trigger.ts`, `gsap-utils.scrollProgress` |
| Lenis | Smooth scrolling (posisi scroll itu sendiri) | `SmoothScrollProvider`, `smooth-scroll-runtime.ts` |
| Motion (`motion/react`) | Animasi UI DOM dan mikro-interaksi | `MotionProvider`, `components/animated/*` |
| maath | Damping dan interpolasi halus (respons pointer) | `three/drivers.applyInteraction` |
| GLSL | Masking, dissolve, distorsi | `lib/animation/three/mask-material.ts` |
| postprocessing | Efek layar (Bloom, Vignette); hanya pada tier yang mengizinkan | lab, Fase 4+ |
| CSS | Transisi ringan, warna hover, pre-hide, reduced motion | `globals.css` |

## Modul infrastruktur

| Nama (brief) | Implementasi |
|---|---|
| AnimationProvider | `components/animation/AnimationProvider.tsx` (dipasang SiteChrome) |
| AnimationController | `lib/animation/controller.ts` (fasad: store, registry, scroll, kualitas) |
| AnimationStateManager | `lib/animation/state.ts` |
| AnimationRegistry | `lib/animation/registry.ts` |
| AnimationConfig | `lib/animation/config.ts` |
| MotionProvider | `components/animation/MotionProvider.tsx` |
| SmoothScrollProvider | `components/animation/SmoothScrollProvider.tsx` + `lib/animation/smooth-scroll-runtime.ts` |
| ScrollProgressController | `lib/animation/scroll.ts` |
| TheatreProvider | `components/animation/TheatreProvider.tsx` + `lib/animation/theatre/*` |
| AnimationLifecycleManager | `lib/animation/lifecycle.ts` |
| ReducedMotionProvider | `components/animation/ReducedMotionProvider.tsx` |
| AnimationQualityManager | `lib/animation/quality.ts` |

`MotionController` (intro dan reveal GSAP dari fase lama) tetap dipakai dan berjalan di ticker GSAP yang sama.

## State bersama (`animationStore`)

Store dibagi dua tingkat:

1. **Snapshot**: frekuensi rendah, immutable, reaktif lewat `useSyncExternalStore` (re-render hanya bila slice yang dipilih berubah).
   Isinya: route, previousRoute, activeSection, hovered, selected, transition, interaction (pointer/touch/keyboard), reducedMotion,
   quality, webgl, visible, smoothScroll, scrollLocks.
2. **Frame**: frekuensi tinggi, mutable, tidak pernah reaktif. Isinya `scroll {y, limit, progress, direction, velocity}` dan
   `pointer {x, y, nx, ny, inside}`, ditulis oleh satu sumber scroll dan satu listener pointer. Pembaca melakukan polling di loop
   (`useFrame`, ticker) atau `onFrame`.

Debug read-only: `window.__kinetic.{state, frame, animations, scrollEngine}`.

## Satu loop

`lib/animation/ticker.ts` menjalankan satu callback `gsap.ticker` (rAF milik GSAP, yang juga menjalankan semua tween dan
ScrollTrigger) dengan fase berurutan:

1. `scroll`: `lenis.raf()`, yang memicu ScrollTrigger.update dan frame scroll bersama.
2. `timeline`: tick rafDriver Theatre (hanya saat diminta Theatre).
3. `render`: `advance()` R3F (canvas `frameloop="never"`, dilewati bila offscreen).

Tidak ada rAF kedua (Lenis `autoRaf: false`, driver default Theatre dan loop R3F tidak dipakai). Tab tersembunyi menghentikan rAF.

Idle berarti tanpa frame:

- Fase `scroll` hanya terpasang selama Lenis beranimasi. Ia dibangunkan oleh gesture wheel (`virtual-scroll`) atau `scrollTo` halus,
  lalu dilepas pada frame pertama setelah Lenis settle. Saat itu ticker GSAP tidur sendiri (`autoSleep`).
- ScrollTrigger diimpor dan didaftarkan hanya lewat `lib/animation/scroll-trigger.ts` (`setupScrollTrigger()`), oleh kode yang membuat trigger.
  `lib/gsap.ts` tidak mengimpornya; runtime Lenis memakai `registeredScrollTrigger()`. Pendaftarannya memasang
  keep-alive rAF permanen milik GSAP, jadi halaman tanpa trigger tidak membayarnya.

Diuji di `animation.spec.ts` (tepat 1 loop rAF berulang saat Lenis beranimasi, 0 callback rAF saat idle) dan `entrance.spec.ts`.

## Lenis dan sinkronisasi GSAP

- Lenis menggulir window **asli**, sehingga ScrollTrigger, IntersectionObserver, scroll restoration browser, dan anchor tetap membaca
  `scrollY`. Tidak ada posisi virtual kedua dan tidak perlu `scrollerProxy`.
- Event scroll Lenis memanggil `ScrollTrigger.update()` (bila ScrollTrigger terdaftar) dan `writeScroll()` (frame bersama).
- Lenis hanya di-tick selama beranimasi (lihat "Satu loop"). Saat bangun dari idle, Lenis diberi delta satu frame, bukan seluruh jeda.
- `html.lenis` mematikan `scroll-behavior: smooth` CSS. Tanpa itu, pemulihan scroll saat back ikut dianimasikan browser.
- Aktif hanya bila motion diizinkan, pointer utama `fine`, dan tier kualitas mengizinkan (high/medium). Dimuat dengan `import()` saat idle.
  Touch, reduced motion, dan halaman auth/dashboard memakai scroll native.
- Wheel saja (`syncTouch: false`). Scroller bersarang, `<dialog>`, dan `[data-lenis-prevent]` tetap native. Keyboard dan form tidak diintersepsi.
- Anchor halaman yang sama: smooth ke target (menghormati `scroll-padding-top`), lalu `pushState` hash (back/forward berfungsi), lalu fokus
  dipindah ke target. Aktivasi lewat keyboard langsung lompat.
- Navigasi klien: inersia dibuang (`scrollTo(scrollY, immediate)`; `reset()` private di 1.3) lalu re-measure. Saat back, posisi dipulihkan browser/Next.
- Scroll lock berbasis counter (`acquireScrollLock`): overflow `<html>` dikunci dan Lenis distop. Dipakai MobileMenu.

## Kepemilikan properti

Lapisan transform objek 3D (`components/three/TransformStack.tsx`), satu pemilik per lapis:

| Lapis | Pemilik | Menggerakkan |
|---|---|---|
| scene-root | R3F (props) | penempatan di scene |
| scroll | ScrollTrigger | progres scroll → rotasi/posisi |
| choreography | Theatre | transform keyframe sinematik |
| interaction | maath | respons hover/pointer/klik yang di-damp |
| idle | R3F (clock) | float, breath, putaran lambat |
| mesh/material | GLSL | uniform mask dan dissolve |

Aturan properti:

| Properti | Pemilik | Catatan |
|---|---|---|
| Posisi scroll window | Lenis | native saat Lenis mati |
| Progres scroll section | ScrollTrigger | |
| Posisi sequence Theatre | Theatre | GSAP/ScrollTrigger boleh mengeset posisinya |
| Transform/opacity elemen DOM | Motion | GSAP hanya untuk intro dan reveal halaman, tidak pernah dua engine pada satu elemen |
| Transform Object3D | per lapis | |
| Uniform shader | GLSL | nilainya ditulis di `useFrame` |

`AnimationRegistry` menegakkan aturan ini: klaim `(target, properti)` oleh engine kedua ditolak dengan `OwnershipError`
(didemokan dan diuji di lab).

## Siklus hidup

Handle registry punya `play`, `pause`, `resume`, `reverse`, `interrupt`, `reset`, `dispose`, plus `status`.

| Kejadian | Penanganan |
|---|---|
| Klik cepat | `reversible()` membalik arah dari posisi saat itu; Motion menginterupsi tanpa menumpuk; tombol loading mengabaikan klik |
| Navigasi cepat | scope `route` dibuang saat pathname berubah; MotionController me-revert konteks GSAP-nya |
| Scroll berbalik | progres ScrollTrigger dua arah; keyframe Theatre deterministik terhadap posisi |
| Resize | debounce dan hanya bila lebar berubah (bukan URL bar mobile); juga setelah font selesai dimuat; lalu Lenis resize dan ScrollTrigger.refresh |
| Tab tersembunyi | `pauseAll` hanya untuk yang sedang berjalan; `resumeAll` hanya untuk yang dipause olehnya; rAF berhenti |
| Unmount | `dispose` (kill tween/ScrollTrigger, revert SplitText, detach objek Theatre) |
| WebGL context loss | canvas persisten: fallback, restore terbatas, remount sekali (docs/SCENE_ARCHITECTURE.md) |

## Kualitas, performa, aksesibilitas

- `estimateTier()` memakai sinyal murah (reduced motion, Save-Data, memori, core CPU, pointer kasar).
  `probeWebGL()` hanya dipanggil oleh scene 3D: satu context sementara yang segera dilepas. Renderer software atau tanpa WebGL
  menurunkan tier ke low atau minimal.
- Profil per tier: rentang DPR, antialias, postprocessing, shadow, anggaran partikel, smooth scroll, WebGL.
  `PerformanceMonitor` menurunkan tier saat frame drop.
- Reduced motion:
  - CSS menetralkan durasi dan jarak.
  - Lenis mati.
  - Helper GSAP melompat ke keadaan akhir tanpa split.
  - Motion `reducedMotion="user"`.
  - Theatre tidak auto-play.
  - Lapis idle/interaksi diam.
- Konten tidak bergantung pada animasi: komponen Motion merender keadaan akhir di server. Elemen di bawah layar pertama baru
  disembunyikan sebelum paint dan di-reveal saat terlihat. LCP tetap teks server.
- Sejak Fase K4, three, R3F dan drei dimuat di rute publik lewat `import()` saat idle (canvas persisten), tidak pernah sebagai skrip
  HTML awal, dan tidak pernah di auth/dashboard. Theatre dan postprocessing belum dimuat di rute publik.

## Rentang durasi (AnimationConfig)

| Jenis | Rentang | Token awal |
|---|---|---|
| Mikro-interaksi | 120–180 ms | `--duration-micro` 150 ms |
| Hover | 200–350 ms | `--duration-hover` 280 ms |
| Umpan balik klik | 100–180 ms | `--duration-press` 140 ms |
| Masuk komponen | 400–700 ms | `--duration-enter` 560 ms |
| Reveal section | 600–1000 ms | `--duration-section` 800 ms |
| Transisi halaman | 600–1000 ms | `--duration-page` 800 ms |
| Kamera sinematik | 800–1500 ms | `--camera-duration` 1200 ms (sebelumnya 1600 ms, di luar rentang) |
| Idle floating | 3–6 dtk | `--idle-float-period` 6 dtk |
| Rotasi orbit | 12–40 dtk/putaran | `--orbit-period-*` 21 / 30 / 38 dtk |

`durationViolations()` memeriksa semuanya; lab menampilkan hasilnya ("all within range").
