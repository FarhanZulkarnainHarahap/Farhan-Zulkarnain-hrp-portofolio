# Redesign Audit (Fase 1)

Tanggal: 2026-11-22 · Branch: `redesign/professional` · Basis: commit `be1fd40`
Dokumen ini read-only terhadap kode; hanya mencatat kondisi sebelum redesign.

---

## 1. Peta rute

| Rute | File | Render saat ini | Catatan |
|---|---|---|---|
| `/` | `src/app/page.tsx` | `<LandingPage initialSection="home"/>` | Semua section: Hero, Profile, Capabilities, Trajectory, Projects(selectedOnly), Principles, Contact |
| `/about` | `src/app/about/page.tsx` | `<LandingPage initialSection="about"/>` | ✅ Terkonfirmasi potongan beranda: Profile + Capabilities + Principles |
| `/about/detail` | `about/detail/page.tsx` | `AboutNestedShell` + `kinetic/Profile detail` | Ada di sitemap |
| `/about/skills` | `about/skills/page.tsx` | `AboutNestedShell` + `kinetic/Capabilities` | Target redirect `/skills` |
| `/about/docs` | `about/docs/page.tsx` | `AboutNestedShell` + `kinetic/Documents` | Target redirect `/documents`; fallback CV di ⌘K |
| `/about` layout | `about/layout.tsx` | passthrough | — |
| `/journey` | `journey/page.tsx` | `<LandingPage initialSection="journey"/>` | ✅ Terkonfirmasi: hanya Trajectory |
| `/projects` | `projects/page.tsx` | `<LandingPage initialSection="projects"/>` | ✅ Terkonfirmasi: Projects (semua) |
| `/projects/[slug]` | `projects/[slug]/page.tsx` | Server comp.: `getProjects` → `findProjectBySlug` → `notFound()`; `kinetic/Shell` + `Primitives/Media` | `generateMetadata` sudah ada (title, description, canonical, OG image) |
| `/projects/[slug]` 404 | `projects/[slug]/not-found.tsx` | re-export `app/not-found` | — |
| `/contact` | `contact/page.tsx` | `<LandingPage initialSection="contact"/>` | ✅ Terkonfirmasi: hanya Contact |
| `/auth/login`, `/auth/register` | `auth/*/page.tsx` | Client, `apiFetch("/api/auth/login|register")` | layout: `robots noindex` |
| `/dashboard` | `dashboard/page.tsx` | `redirect("/admin/home")` | layout: `robots noindex` |
| `/dashboard/admin/*` (alias `/admin/*` via `next.config.ts` rewrites) | home, skill, skill/manage, portofolio(+upload), document(+upload), experience | **Admin CMS ada di repo ini** | Dijaga `proxy.ts` (ADMIN) |
| `/dashboard/user` | `dashboard/user/page.tsx` | memakai `kinetic/Shell` | — |
| `not-found` | `app/not-found.tsx` | `kinetic/Shell`, copy "Node not found." | — |
| `error` | `app/error.tsx` | copy "CONNECTION INTERRUPTED" / "Retry connection" | — |
| API internal | `app/api/public/[resource]`, `app/api/documents/[slug]/download`, `app/api/documents/download` | proxy GET whitelist & download Cloudinary | DILARANG DIUBAH |
| `sitemap.ts` | — | 8 rute statis, **tidak** memuat `/projects/[slug]` | Perlu ditambah di Fase 6.6 |
| `robots.ts` | — | disallow `/dashboard/`, `/admin/`, `/auth/` | — |

Redirect di `next.config.ts`: `/home→/`, `/explore→/about`, `/skills→/about/skills`, `/documents→/about/docs`.

Root layout (`app/layout.tsx`): JSON-LD Person + WebSite sudah ada; metadata default & OG masih memuat "Kinetic Systems"; belum ada `next/font`; skip-link ada di `Navbar.tsx` (bukan layout).

---

## 2. Kontrak data

Dua jalur pengambilan data:
- **Server**: `src/services/api.ts` (`server-only`) → `getProjects()`, `getDocuments()`, `getPublicPayload(path)`. Memvalidasi bentuk respons dan melempar `TypeError` bila tidak valid. `cache: "no-store"`, timeout 10 s.
- **Client**: `apiFetch()` (`src/lib/api-client.ts`) — GET ke 4 koleksi publik di browser otomatis diarahkan ke `/api/public/<resource>` (same-origin); lainnya ke `PUBLIC_API_ORIGIN` dengan `credentials: include`. Hook `useCollection<T>(path)` di `src/components/kinetic/data.ts` → `{ data, loading, error, retry }`.

Envelope respons: `{ success: true, data: T[] }` (array polos juga diterima).

### `/api/portofolios` → `Project` (`services/api.ts`)
| Field | Tipe | Wajib | Catatan data live (8 item) |
|---|---|---|---|
| id | string | ✅ | uuid |
| title | string | ✅ | sumber slug (`getProjectSlug` = slugify(title) ∥ id) |
| description | string | ✅ | paragraf panjang |
| imageUrl | string | ✅ | Cloudinary → `cloudinaryImageLoader` |
| demoUrl | string \| null | — | semua ada |
| repoUrl | string \| null | — | semua ada |
| caseType | string \| null | — | **teks bebas, dipisah koma, bisa panjang** ("Full-Stack Web Application — Point of Sale (POS) & Retail Management S…"); 1 item kosong |
| caseProblem / caseSolution / caseResult | string \| null | — | 7/8 terisi; "Callender Season" kosong semua |
| tags | string[] | — (default []) | 0–**32** tag (Kasirku); campuran kategori & teknologi ("Frontend", "Next.js 16") |
| features | string[] | — (default []) | 0–**94** item (Kasirku), ada emoji di awal item |
| createdAt / updatedAt | string? | — | ISO; `updatedAt` tidak dikirim API saat ini |

Pemakai: `kinetic/Projects` (via `useCollection`), `projects/[slug]/page` (via `getProjects`), `three/projects/*`, `data/projects.ts` (`VaultProject`), admin portofolio.
`selectedOnly` di beranda = **`data.slice(0, 4)`** (urutan API, bukan flag "featured").

### `/api/skills` → `Skill` (`kinetic/data.ts`)
| Field | Tipe di kode | Wajib | Catatan |
|---|---|---|---|
| id | string | ✅ | |
| name | string | ✅ | **Casing tidak konsisten** di data: "redux", "Postgresql", "Visualstudio", "Nestjs", "Github" |
| category | string | ✅ | Nilai live: `FRONTEND`(5), `BACKEND`(8), `TOOLS`(5), `OTHERS`(3) — tidak ada DATABASE/DEVOPS |
| iconName | *(tidak ada di tipe)* | — | API mengirim (mis. `SiRedux`); dipakai admin via `resolveSkillIconKey` |
| createdAt | *(tidak ada di tipe)* | — | |

Pengelompokan per layer (Frontend/Backend/Database/Infrastructure/Creative/Tools) saat ini **diturunkan dari nama** lewat regex di `src/data/techStack.ts → skillCategory()` (bukan lapisan data terlarang; bisa dipakai ulang). Ikon: `skill-icon-resolver.ts` + `skill-icons.ts` (react-icons, katalog kecil) — dipakai admin; publik saat ini memakai SVG `/icons/capability/*.svg`.
Pemakai: `kinetic/Capabilities`, `three/CapabilityMatrix`, admin skill. Live: 21 skill.

### `/api/experiences` → `Experience` (`kinetic/data.ts`)
| Field | Tipe | Wajib |
|---|---|---|
| id, title, company, startDate (ISO) | string | ✅ |
| current | boolean | ✅ |
| location, endDate, description | string? | — |
| technologies | string[] | ✅ |
| sortOrder | number? | — |

⚠️ **Live: 0 entri.** `kinetic/Trajectory` lalu menampilkan **5 milestone hardcode** (Purwadhika, Laravel training, magang PT Tokio Marine, dll.) tanpa tanggal. Ini bertentangan dengan aturan "jangan hardcode data API" → butuh keputusan (lihat §7).
Pemakai: `kinetic/Trajectory`, admin experience (CRUD lengkap).

### `/api/documents` → `Document` (`services/api.ts`)
| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| id, name, category, fileUrl, createdAt | string | ✅ | category live: Resume, Certificate, Education |
| previewUrl | string \| null | — | gambar preview Cloudinary |
| size | number | ✅ | byte (151 KB – 952 KB) |
| updatedAt | string? | — | |

Download: `/api/documents/[slug]/download` (slug = `getDocumentSlug(doc)` = slugify(name) ∥ id); hanya file Cloudinary `dpanr1qqp` diizinkan; nama file via `formatDocumentFileName`. Ada juga `/api/documents/download?…` (legacy). Live: 4 dokumen (1 CV).
Pemakai: `kinetic/Documents`, `Navbar` palette (cari CV dengan regex `cv|resume|curriculum|curiculum`), admin.

### `POST /api/contact` (langsung ke backend via `apiFetch`)
- Payload: `{ name, email, message }` dengan `message = "Subject: <subject>\n\n<body>"` (API tidak punya field subject).
- Sukses bila `response.ok && result.success === true`; `TimeoutError` → pesan khusus.
- Validasi klien: semua field wajib (trim); `maxLength` name 100, email 254, subject 200, message 10000.
- Pemakai: `kinetic/Contact`.

### Auth (tidak diubah)
`apiFetch("/api/auth/login"|"/api/auth/register")` → cookie `accessToken` (JWT) → `proxy.ts` verifikasi dengan `jose` + `JWT_SECRET`; ADMIN → `/admin/home`, lainnya → `/dashboard/user`.

### Profil statis (`kinetic/data.ts → profile`)
`name`, `email: farhanzulkarnaenhrp@gmail.com`, `github`, `linkedin`, `image` (foto Cloudinary). Bukan dari API — perlu dipindah ke modul netral (mis. `src/lib/site.ts`) saat `kinetic/` dihapus.

---

## 3. Inventaris komponen Kinetic

Legenda: **GANTI** = tampilan baru; **PAKAI ULANG** = logikanya dipertahankan/dipindah; **HAPUS** = dibuang di Fase 11.

### `src/components/kinetic/`
| Komponen | Keputusan | Catatan |
|---|---|---|
| `data.ts` | **PAKAI ULANG** (pindah) | `useCollection`, tipe `Skill`/`Experience`, `profile`, `safeHref`. ⚠️ dipakai admin experience |
| `Contact.tsx` | GANTI tampilan, **PAKAI ULANG logika submit** persis | |
| `Modal.tsx` | **PAKAI ULANG** (pindah) | `<dialog>` native, focus trap, Esc. ⚠️ dipakai admin |
| `Confirmation.tsx` | **PAKAI ULANG** (pindah) | ⚠️ dipakai admin layout + 4 halaman admin |
| `Primitives.tsx` | GANTI; logika `Media` (fallback gambar + loader Cloudinary) & `CollectionState` **PAKAI ULANG** | ⚠️ `CollectionState` dipakai admin experience |
| `Documents.tsx` | GANTI | logika slug/download sederhana |
| `Trajectory.tsx` | GANTI | logika periode (tahun mulai — PRESENT) bisa dipakai |
| `Capabilities.tsx` | GANTI | logika tab keyboard bisa jadi referensi |
| `Projects.tsx` | GANTI | |
| `Profile.tsx` (+`Principles`) | GANTI | copy bio/principles jadi bahan `docs/COPY.md` |
| `Hero.tsx` | GANTI | framer-motion |
| `Shell.tsx` | GANTI | Footer (jam WIB live) & scroll progress; ⚠️ dipakai `dashboard/user` & `not-found` |
| `SceneState.tsx`, `SpatialSystem.tsx` | HAPUS | khusus scene Kinetic |

### `src/components/landing/`, `navigation/`, `projects/`
| Komponen | Keputusan |
|---|---|
| `landing/LandingPage.tsx` | HAPUS (setelah semua halaman mandiri) |
| `navigation/AboutNestedShell.tsx` | GANTI/HAPUS — tergantung keputusan rute `/about/*` (§7) |
| `projects/ProjectDetails.tsx` | HAPUS (ringkasan vault) |
| `projects/ProjectNavigation.tsx` | HAPUS — ini **daftar pemilih vault**, bukan prev/next. Prev/next detail proyek harus dibuat baru dari urutan `getProjects()` |
| `Navbar.tsx` | GANTI tampilan; **PAKAI ULANG** logika ⌘K (shortcut, combobox/listbox, cari CV), skip-link, focus handling menu mobile |

### `src/components/three/` (≈ 40 file)
| Komponen | Keputusan | Alasan |
|---|---|---|
| `BlenderAsset.tsx` | **PAKAI ULANG** (ubah path ke `/3d/`) | `useGLTF` + clone hierarki, GPU dimiliki cache loader |
| `RenderQuality.tsx` | **PAKAI ULANG** | DPR adaptif berdasar ukuran canvas; perlu diturunkan ke `[1, 1.5]` sesuai aturan |
| `motionPreference.tsx` | **PAKAI ULANG** | `useReduced3DMotion` (useSyncExternalStore) + opt-in override |
| `useAssetViewport.ts` | **PAKAI ULANG** | lazy load dekat viewport, pause saat tak terlihat/tab tersembunyi, pointer tanpa re-render, status gagal |
| `projects/DeviceScreen.tsx` + `data/projects.ts → projectScreenshot()` | **Pertimbangkan** untuk `<DeviceMockup/>` | tekstur layar dari `imageUrl` Cloudinary (f_webp, lebar responsif) |
| `assetMotion.ts` | Pertimbangkan | helper gerak idle |
| Sisanya: `KineticScene`, `HeroKineticCore`, `kinetic/*`, `AboutIdentityCapsule`, `Capability*`, `SkillNode`, `capabilityLayout`, `camera/*`, `controllers/*`, `core/*`, `environment/*`, `geometry/*`, `materials/*`, `nodes/*`, `shaders/*`, `projects/ProjectVault|Scene|Rail|Artifact|Connections`, `deviceMotion`, `useProjectSceneLayout` | HAPUS | estetika Kinetic/sci-fi |

### Lain-lain
- `src/data/techStack.ts`: **PAKAI ULANG** `skillCategory()` (pengelompokan layer). `capabilitySkill()`/ikon SVG kapabilitas: opsional.
- `src/data/projects.ts`: `projectScreenshot()` opsional untuk DeviceMockup; `projectWindow()` HAPUS.
- `public/visuals/system-map.svg`, `public/icons/capability/*`: HAPUS bila tak dipakai.
- `framer-motion` dipakai di `Hero`, `Primitives`, `Shell`, `Trajectory` → bisa dihapus setelah komponen itu hilang.

---

## 4. Ukuran aset 3D (pembanding performa)

- `public/models/`: **12,507,966 byte (≈ 11.9 MiB)**. (`KINETIC_REDESIGN.md` masih menyebut 2.1 MB — sudah usang.)
- Terbesar: `FZH_Hero_Kinetic_Core.glb` 3.23 MB, `FZH_About_Identity_Capsule.glb` 1.53 MB, `FZH_Hero_Kinetic_Core_LOD.glb` 1.21 MB, `FZH_Project_Artifact.glb` 0.85 MB, `FZH_Kinetic_Laptop.glb` 0.69 MB.
- Budget baru (CLAUDE.md): ≤ 1.5 MB per GLB, ≤ 3 MB total di halaman utama → hero lama sendiri sudah melampaui.
- Folder lain yang ikut di repo: `previews/` 23 MB, `assets/blender/` 14 MB (sumber `.blend` lama; aturan baru menaruh sumber di `design/blender/`), `docs/` 1.9 MB (README/stat aset FZH).

---

## 5. Dokumentasi & test yang ada

- `README.md` / `KINETIC_REDESIGN.md`: dokumentasi Kinetic (dipakai bersama admin, satu `globals.css` 2,569 baris). Catatan penting di dalamnya: experience produksi kosong → fallback milestone; subject diserialisasi ke `message`; skill tidak punya PUT/PATCH; dokumen tidak bisa diedit in-place.
- `scripts/qa/check-models.mjs`, `scripts/blender/*.py`: pipeline GLB Kinetic.
- Playwright (`playwright.config.ts`, server produksi di `localhost:3101`, fixture di `tests/fixtures/`: projects/skills/documents JSON + 2 webp).

### `tests/kinetic.spec.ts` (915 baris, ~22 test)
**Bergantung pada Kinetic/3D (harus ditulis ulang/dihapus):** selector `.hero [data-fzh-asset=core]`, `.hero-core img|canvas`, `.asset-poster-pending`, `.kinetic-scene-host canvas`, `.vault-canvas`, `.project-vault`, `.project-list button`, `.project-summary h3|a`, teks `Explore project ↗`, `.matrix-detail strong`, `.matrix-node-label`, `.matrix-stage`, `getByRole('tab', {name:/Backend/})`, `.profile-narrative`, `.project-spatial`, `.transmission-form [role=status|alert]`, `[data-screenshot=ready|failed]`, `group "Project device"`, `button "Next project"`, `toContainText('FARHAN')` pada h1, lebar responsif 360–1920, identity capsule, standby render, context loss WebGL.
**Cakupan yang harus DIPERTAHANKAN (logika tetap):**
- Rute publik + lebar responsif; palette ⌘K (`button "Open command palette"`), focus restoration, menu mobile.
- Error baca + retry; contact tidak pernah melapor sukses saat gagal (`getByLabel("Your name")`, `button "Send message"`).
- Token hilang/invalid/non-admin tidak bisa masuk admin; login/logout.
- Admin: modal edit proyek (focus trap, `dialog "Edit project"`), CRUD experience (`button "Save experience"`, `"Delete entry"`), upload proyek/dokumen, CRUD skill (`"Delete QA capability"`).
- Live: API publik, detail proyek, download CV.
- Reduced-motion / WebGL mati tetap menampilkan konten.

### `tests/procedural-core.spec.ts`, `tests/project-devices.spec.ts`
Sepenuhnya untuk KineticCore & device vault → HAPUS/ganti dengan test 3D baru di Fase 12. Ide yang layak dipertahankan: "teks hero terkirim sebelum JS/model", "satu canvas per hero setelah navigasi", "konten tetap ada saat WebGL tidak tersedia".

---

## 6. Risiko yang ditemukan

1. **Admin bergantung pada `components/kinetic/`**: `dashboard/admin/layout.tsx` + skill/portofolio/document/experience memakai `Confirmation`, `Modal`, `useCollection`, `Experience`, `CollectionState`; `dashboard/user` memakai `Shell`. Menghapus `kinetic/*` di Fase 11 tanpa memindahkan modul ini akan **merusak admin**.
2. **`globals.css` dipakai bersama admin.** Menulis ulang di Fase 3 akan mengubah tampilan dashboard admin (`admin-dialog`, `button`, `collection-state`, dll.). Perlu strategi: pertahankan/isolasi kelas admin, atau selaraskan admin dengan token baru.
3. Experience live kosong → halaman Journey hanya bisa menampilkan empty state, atau tetap memakai milestone hardcode.
4. Data ekstrem nyata: 32 tag, 94 fitur, caseType panjang berisi koma, nama skill huruf kecil → desain harus memotong/mengelompokkan (bukan hanya di `/break-ui`).
5. Prev/next proyek belum ada; perlu dibuat dari `getProjects()`.
6. `sitemap.ts` tidak mencantumkan `/projects/[slug]`.
7. Ukuran 3D lama ≈ 12 MB; hero GLB lama 3.2 MB.

## 7. Keputusan yang dibutuhkan

1. **Journey** saat experience kosong: (a) isi data lewat admin `/admin/experience` (disarankan), (b) pertahankan milestone sementara, atau (c) empty state saja.
2. **Rute `/about/detail`, `/about/skills`, `/about/docs`**: pertahankan sebagai halaman, atau jadikan redirect permanen ke `/about#bio`, `/about#stack`, `/about#documents` (sitemap disesuaikan).
3. **Tampilan admin**: diselaraskan dengan design system baru, atau dibiarkan (kelas CSS-nya dipisah ke file sendiri).
4. **Proyek unggulan** beranda: tetap 4 item pertama urutan API, atau aturan lain (mis. hanya yang punya case study).
5. **Email**: `farhanzulkarnaenhrp@gmail.com` ("naen") — konfirmasi.
