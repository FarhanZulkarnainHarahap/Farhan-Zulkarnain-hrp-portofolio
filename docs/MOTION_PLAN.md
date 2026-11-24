# Motion Plan (Fase 8)

Dasar: DESIGN.md → Motion (tenang, singkat, bermakna; tanpa loop pada teks/UI — loop hanya untuk aset 3D dekoratif, lihat Fase 12.5; H1 tidak dianimasikan) dan prinsip
Emil Kowalski ("you don't need animations"): setiap gerak harus lolos 4 pertanyaan — **frekuensi**,
**tujuan**, **durasi**, **fungsi**. Lebih sedikit gerak untuk elemen yang sering dipakai.

Token yang dipakai (src/app/globals.css): `--duration-fast` 150ms, `--duration-base` 240ms,
`--duration-slow` 420ms, `--duration-reveal` 700ms, `--stagger` 60ms, `--reveal-distance` 8px,
`ease-standard` (0.2, 0, 0, 1), `ease-enter` (0.16, 1, 0.3, 1), `ease-exit` (0.4, 0, 1, 1).
Reduced motion: semua tween GSAP dilewati (konten langsung tampil final); transisi CSS memakai token
yang otomatis menjadi 1ms.

Aturan teknis: hanya `transform` dan `opacity`; elemen hanya disembunyikan oleh CSS saat
`html.js-motion` aktif (dipasang script inline sebelum paint, hanya bila motion diizinkan), dengan
failsafe yang menampilkan semuanya bila GSAP belum siap dalam 2,5 detik. Tanpa JS: semuanya terlihat.

## Disetujui dan dikerjakan

| # | Tempat | Hari ini | Tujuan | Frekuensi | Gerak (token) |
|---|---|---|---|---|---|
| 1 | Hero beranda (`components/home/Hero.tsx`) | Semua muncul sekaligus | Mencegah perubahan mendadak saat halaman pertama tampil; mengarahkan mata dari siapa → bisa apa → langkah berikutnya | Jarang (sekali per kunjungan) | Timeline GSAP: eyebrow → positioning → CTA → status + proof → slot visual. `opacity 0→1`, `y: --reveal-distance → 0`, durasi `--duration-slow`, `ease-enter`, stagger `--stagger`, overlap sehingga total ≈ 0,65 dtk. **H1 tidak disentuh** (tetap elemen LCP). Hanya sekali per kunjungan: kembali ke `/` lewat navigasi client tidak memutar ulang intro (8.6). |
| 1b | Header halaman `/about`, `/journey`, `/projects`, `/contact` (`site/PageHeader.tsx`, Fase 10.5) | Semua muncul sekaligus | Entrance ringan yang senada dengan beranda | Jarang (sekali per halaman per kunjungan) | Timeline intro yang sama (`--intro-*`): garis aksen di bawah judul tergambar kiri → kanan (`scaleX`, `--duration-base`), lalu aksi dan visual naik bergantian. Eyebrow, **H1 dan lead tidak dianimasikan**: di ponsel lead adalah elemen LCP halaman-halaman ini; menyembunyikannya sampai GSAP termuat menambah ±1,3 dtk LCP (Fase 12.8, lead dikeluarkan dari intro). Reduced motion / tanpa JS: langsung final. |
| 2 | Reveal section saat masuk viewport (semua halaman publik, kecuali header halaman) | Section langsung ada | Mencegah konten "meloncat" masuk saat scroll; ritme membaca | Kadang (per kunjungan) | IntersectionObserver (`rootMargin: 0 0 -15% 0` ≈ top 85%), sekali per elemen lalu `unobserve`; tween GSAP. Header section lalu grup isi (kartu, daftar) dengan stagger `--stagger`; `opacity`, `y: --reveal-distance`, `--duration-reveal`, `ease-enter`. Maks. dua grup per viewport. |
| 3 | Filter `/projects` (`ProjectsExplorer.tsx`) | Kartu berpindah/hilang seketika | Konsistensi spasial: kartu yang tetap ada bergeser ke posisi baru, yang keluar/masuk memudar | Kadang | GSAP Flip: posisi `--duration-base`, `ease-standard`; kartu yang masuk `opacity 0→1` + `scale 0.98→1` `ease-enter`. Kartu yang keluar dihapus React seketika (tanpa fade-out; hasil filter tidak boleh tertunda). Animasi sebelumnya di-kill (bisa diinterupsi saat mengetik). Hanya transform/opacity. |
| 4 | Tekan tombol (`components/ui/button.tsx`) | Tidak ada umpan balik tekan | Umpan balik | Puluhan kali | CSS `:active { scale(0.97) }`, `transition: transform --duration-fast ease-standard`. Hanya transform. |
| 5 | Menu mobile (`site/MobileMenu.tsx`) | Sheet muncul/hilang seketika | Konsistensi spasial (sheet datang dari atas) & mencegah perubahan mendadak | Kadang (mobile) | CSS pada `<dialog>`: masuk `opacity 0→1` + `translateY(-8px)→0` `--duration-base` `ease-enter` (via `@starting-style`), keluar `--duration-fast` `ease-exit` (`allow-discrete`). Interuptibel (transisi CSS). |
| 6 | Pesan hasil form kontak (`contact/ContactForm.tsx`) | Teks muncul seketika | Umpan balik | Jarang | CSS `@starting-style`: `opacity 0→1`, `y 4px→0`, `--duration-base`, `ease-enter`. |

Koreografi (8.4): di hero, satu gerakan dari kiri-atas ke kanan; grid proyek dan entri timeline
memakai stagger yang sama (`--stagger`) dengan batas 6 item agar tidak terasa lambat; header section
selalu mendahului isinya; tidak ada dua grup yang beranimasi bersamaan di satu layar.

## Ditolak

- **Garis progress timeline di `/journey`** (keputusan pemilik, Fase 8): DESIGN.md → Timeline entry
  melarang "dots or glowing rails"; garis progress adalah rel.
- **Parallax gambar utama studi kasus** (keputusan pemilik, Fase 8): dekoratif pada konten yang sedang
  dibaca (UI proyek); gagal gate "fungsi".

- **Palette ⌘K buka/tutup**: dipicu keyboard dan sangat sering. Tidak pernah dianimasikan.
- **Tooltip**: sering muncul dan sudah ada delay 300 ms; animasi tambahan hanya memperlambat.
- **Cross-fade saat ganti tema**: mentransisikan warna seluruh halaman berat (banyak elemen) dan tidak
  menambah makna.
- **Ekspansi "+N" tag dan "Show all features"**: perubahan kecil di dalam baris; animasi tinggi butuh
  properti layout. Perubahan seketika lebih jujur dan cepat.
- **Animasi H1 / SplitText**: menunda LCP (DESIGN.md).
- **Hover kartu proyek dengan scale**: kartu besar yang membesar terasa berat; sudah ada sorotan halus
  (Fase 7) dan zoom gambar 1.02.
- **Transisi antarhalaman**: navigasi inti dipakai berulang; gerak antarhalaman memperlambat.

## Catatan implementasi

- `src/lib/gsap.ts`: `registerPlugin(useGSAP, CustomEase)` sekali; Flip didaftarkan hanya di filter
  `/projects`; ease/durasi dari token; `motion()` = `gsap.matchMedia()` dengan kondisi
  `(prefers-reduced-motion: no-preference)` — di luar kondisi itu tidak ada tween sama sekali.
- **Tanpa ScrollTrigger** (keputusan Fase 8): reveal memakai IntersectionObserver — tanpa listener scroll
  dan tanpa loop rAF saat diam. Observer + tween dibuat di context `useGSAP` dan dibersihkan saat
  pindah halaman (`disconnect`). Kalau Fase 10 butuh efek scroll pada 3D, ScrollTrigger dimuat dinamis
  hanya di dalam chunk komponen 3D.
- Komponen client sekecil mungkin: `MotionSection`/`HeroIntro` hanya membungkus markup server.

## Hasil review (8.6) — yang dibuang / dibatasi

- Intro hero diputar ulang setiap kembali ke beranda → **dibatasi** sekali per kunjungan.
- Fade-out kartu saat filter → **dibuang** (menunda hasil; kartu keluar langsung hilang).
- Gerak saat aksi keyboard (palette, toggle tema, "+N", "Show all") → **tetap tanpa animasi**.
- Under reduced motion: tidak ada tween GSAP maupun observer reveal; transisi CSS memakai token
  yang menjadi 1 ms, dan pergeseran (translate/scale) dimatikan.

## Fase 10.5 — Entrance hero dan fly-through

- **Intro hero (sekali per kunjungan):** timeline GSAP dengan waktu mulai dari token `--intro-*`
  (150 ms garis aksen di bawah H1 tergambar kiri → kanan · 250 ms eyebrow · 400 ms positioning naik per
  baris (SplitText, di-revert setelahnya) · 550 ms CTA bergantian · 700 ms status + satu sapuan ShinyText
  · 2.000 ms "Scroll to explore ↓" dengan satu dorongan, tanpa loop, hilang saat mulai scroll). H1 dan
  header tidak pernah dianimasikan.
- **Visual hero:** video entrance Blender 2 dtk, sekali per sesi (berikutnya mulai 1,5 dtk); desktop saja.
- **Fly-through:** waktu video = posisi scroll (scrub, bukan autoplay); teks scene mengikuti progres
  lewat `gsap.set`. Tanpa ScrollTrigger. rAF hanya selama video mengejar targetnya (0 rAF saat diam).
- **Reduced motion:** tidak ada tween, tidak ada video; poster tumpukan dan daftar still + teks.


## Fase 12.5 — aset 3D interaktif (idle + hover)

Aturan (menggantikan larangan loop untuk aset 3D dekoratif saja):
- Loop idle hanya pada aset 3D dekoratif (klip Blender pre-render): gerak ≤ 6 px, rotasi ≤ 3°, tanpa
  kedip/flash, tidak pada teks.
- Loop berhenti saat di luar viewport, tab tersembunyi (`visibilitychange`), atau reduced motion (still).
- Tidak ada rAF tanpa interaksi, kecuali loop idle yang sedang terlihat (berupa `<video>`, jadi tanpa
  skrip per frame). Hover = image sequence + follower ber-easing; rAF hanya selama bergerak.
- Hover hanya `(hover: hover) and (pointer: fine)`. Layar sentuh: idle + tap (kartu berbalik), tanpa tilt,
  tanpa tap-hijack.

| # | Tempat | Idle | Hover / interaksi | Status |
|---|---|---|---|---|
| 12.5-1 | Hero beranda (setelah entrance, desktop) | `{theme}-idle.mp4` 4 dtk: melayang ±4 px, sumbu bernapas; frame 0 = frame akhir entrance | tilt 5×3 (±6°/±8°) | X1 |
| 12.5-2 | Kartu Fz About (di bawah potret; ponsel setelah profil) | `idle.mp4` 3,5 dtk: melayang ±4 px, goyang ≤ 2°, satu kilau | tilt 7×5 (±12°); klik/Enter/Space/tap berbalik (18 frame) → kontak HTML | X1 |
| 12.5-3 | Kartu Fz footer (semua halaman) | idem, satu set gelap | idem; sisi belakang: Email / GitHub / LinkedIn | X1 |
| 12.5-4 | Idle mikro scene fly-through | klip 2 dtk mulai/berakhir di frame istirahat (tengah dataran linger); scroll lagi → crossfade ±150 ms ke scrub | parallax ≤ 1,5 % | setelah X1 |
| 12.5-5 | Journey, Projects, studi kasus, Contact, 404 | lihat `.qa/fase12-5/x0/PLAN.md` | | setelah X1 |
