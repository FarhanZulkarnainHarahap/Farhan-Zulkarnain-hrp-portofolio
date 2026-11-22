# Motion Plan (Fase 8)

Dasar: DESIGN.md → Motion (tenang, singkat, bermakna; tanpa loop; H1 tidak dianimasikan) dan prinsip
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
| 2 | Reveal section saat masuk viewport (semua halaman publik, kecuali header halaman) | Section langsung ada | Mencegah konten "meloncat" masuk saat scroll; ritme membaca | Kadang (per kunjungan) | ScrollTrigger `once: true`, `start: top 85%`. Header section lalu grup isi (kartu, daftar) dengan stagger `--stagger`; `opacity`, `y: --reveal-distance`, `--duration-reveal`, `ease-enter`. Maks. dua grup per viewport. |
| 3 | Filter `/projects` (`ProjectsExplorer.tsx`) | Kartu berpindah/hilang seketika | Konsistensi spasial: kartu yang tetap ada bergeser ke posisi baru, yang keluar/masuk memudar | Kadang | GSAP Flip: posisi `--duration-base`, `ease-standard`; kartu yang masuk `opacity 0→1` + `scale 0.98→1` `ease-enter`. Kartu yang keluar dihapus React seketika (tanpa fade-out; hasil filter tidak boleh tertunda). Animasi sebelumnya di-kill (bisa diinterupsi saat mengetik). Hanya transform/opacity. |
| 4 | Tekan tombol (`components/ui/button.tsx`) | Tidak ada umpan balik tekan | Umpan balik | Puluhan kali | CSS `:active { scale(0.97) }`, `transition: transform --duration-fast ease-standard`. Hanya transform. |
| 5 | Menu mobile (`site/MobileMenu.tsx`) | Sheet muncul/hilang seketika | Konsistensi spasial (sheet datang dari atas) & mencegah perubahan mendadak | Kadang (mobile) | CSS pada `<dialog>`: masuk `opacity 0→1` + `translateY(-8px)→0` `--duration-base` `ease-enter` (via `@starting-style`), keluar `--duration-fast` `ease-exit` (`allow-discrete`). Interuptibel (transisi CSS). |
| 6 | Pesan hasil form kontak (`contact/ContactForm.tsx`) | Teks muncul seketika | Umpan balik | Jarang | CSS `@starting-style`: `opacity 0→1`, `y 4px→0`, `--duration-base`, `ease-enter`. |

Koreografi (8.4): di hero, satu gerakan dari kiri-atas ke kanan; grid proyek dan entri timeline
memakai stagger yang sama (`--stagger`) dengan batas 6 item agar tidak terasa lambat; header section
selalu mendahului isinya; tidak ada dua grup yang beranimasi bersamaan di satu layar.

## Menunggu keputusan (tidak dikerjakan)

| Usulan | Alasan ragu |
|---|---|
| Garis progress timeline di `/journey` | DESIGN.md → Components → Timeline entry: "No dots or glowing rails." Garis progress adalah rel. Perlu keputusan: ubah DESIGN.md atau batal. |
| Parallax halus gambar utama studi kasus (desktop) | Tujuannya dekoratif; gambar itu adalah konten yang sedang dibaca (UI proyek). Gate "Fungsi" gagal menurut prinsip Emil; DESIGN.md hanya melarang parallax pada teks. Butuh keputusan Anda. |

## Ditolak

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

- `src/lib/gsap.ts`: `registerPlugin(useGSAP, ScrollTrigger, Flip)` sekali; default `ease`/`duration`
  dibaca dari token; `motion()` = `gsap.matchMedia()` dengan kondisi `(prefers-reduced-motion:
  no-preference)` — di luar kondisi itu tidak ada tween sama sekali.
- `useGSAP` dengan `scope` ref; ScrollTrigger dibuat di dalam context sehingga otomatis di-kill saat
  komponen unmount (pindah halaman); `ScrollTrigger.refresh()` setelah `document.fonts.ready`.
- Komponen client sekecil mungkin: `MotionSection`/`HeroIntro` hanya membungkus markup server.

## Hasil review (8.6) — yang dibuang / dibatasi

- Intro hero diputar ulang setiap kembali ke beranda → **dibatasi** sekali per kunjungan.
- Fade-out kartu saat filter → **dibuang** (menunda hasil; kartu keluar langsung hilang).
- Gerak saat aksi keyboard (palette, toggle tema, "+N", "Show all") → **tetap tanpa animasi**.
- Under reduced motion: tidak ada tween GSAP maupun ScrollTrigger; transisi CSS memakai token
  yang menjadi 1 ms, dan pergeseran (translate/scale) dimatikan.
