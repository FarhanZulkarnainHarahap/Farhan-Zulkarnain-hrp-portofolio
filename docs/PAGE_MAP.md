# Peta Halaman Website

Sumber tujuan tiap halaman untuk redesign profesional. Rincian kontrak data ada di `docs/REDESIGN_AUDIT.md`.

**Alur utama pengunjung:** Beranda → Projects → Detail Proyek → Contact
**Alur alternatif:** Beranda → About / Journey → Contact

| Halaman | Untuk siapa | Tujuan | Data API | Lanjut ke | Komponen saat ini | Field data yang dipakai |
|---|---|---|---|---|---|---|
| `/` | Recruiter, klien, semua pengunjung | Kesan pertama 10–30 detik: siapa, bisa apa, buktinya | skills, experiences, portofolios | Projects / About / Contact | `LandingPage(home)` → `kinetic/Hero`, `Profile`, `Capabilities` (+`three/CapabilityMatrix`), `Trajectory`, `Projects selectedOnly` (+`three/projects/ProjectVault`), `Principles`, `Contact`; `HeroKineticCore` | Skill: name, category · Experience: title, company, startDate, endDate, current, description, technologies · Project (4 pertama): id, title, imageUrl, tags (+ slug dari title) |
| `/about` | Pengunjung yang ingin menilai kecocokan | Mengenal lebih dalam, cara kerja, keahlian lengkap, CV | skills, documents | Journey / CV / Contact | `LandingPage(about)` → `Profile`, `Capabilities`, `Principles`; sub-rute `/about/detail` (`Profile detail`), `/about/skills` (`Capabilities`), `/about/docs` (`Documents`) via `AboutNestedShell` | Skill: name, category · Document: id, name, category, size, previewUrl (+ slug dari name) · `profile.image` statis |
| `/journey` | Recruiter / HR | Riwayat pengalaman (pengganti CV) | experiences | Projects | `LandingPage(journey)` → `kinetic/Trajectory` (+ fallback 5 milestone hardcode karena API kosong) | Experience: title, company, startDate, endDate, current, description, technologies (location, sortOrder belum dipakai) |
| `/projects` | Semua pengunjung | Galeri semua karya + filter | portofolios | Detail | `LandingPage(projects)` → `kinetic/Projects` (vault 3D, `ProjectNavigation`, `ProjectDetails`) | Project: id, title, imageUrl, tags (description/caseType/demoUrl/repoUrl belum tampil di kartu) |
| `/projects/[slug]` | Hiring manager, klien | Studi kasus: masalah → solusi → hasil | portofolios (1 item) | Proyek lain / Contact | Server page + `kinetic/Shell` + `Primitives/Media`; `generateMetadata` | Project: title, description, imageUrl, demoUrl, repoUrl, caseType, caseProblem, caseSolution, caseResult, tags, features (createdAt belum dipakai) |
| `/contact` | Yang siap menghubungi | Konversi: tawaran kerja / klien | POST /api/contact | (selesai) | `LandingPage(contact)` → `kinetic/Contact` | POST `{ name, email, message: "Subject: …\n\n…" }`; `profile.email/github/linkedin` statis |
| `/auth/*` | Admin | Login admin (logika tetap) | apiFetch `/api/auth/login`, `/api/auth/register` | /dashboard | `auth/login`, `auth/register` pages | cookie `accessToken` (JWT) |
| `/dashboard` | Admin (ADMIN) | Redirect `/admin/home` (tetap) | — | — | `redirect("/admin/home")`; admin CMS di `/dashboard/admin/*` (alias `/admin/*`) | — |
| 404 / error | Pengunjung tersesat | Pesan singkat dan jalan kembali | — | `/`, `/projects` | `app/not-found.tsx` (`kinetic/Shell`), `app/error.tsx` | — |
