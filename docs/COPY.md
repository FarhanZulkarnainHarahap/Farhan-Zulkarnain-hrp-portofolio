# Copy — Quiet Editorial

Static interface copy for the redesign. Text from the API (project titles, descriptions, case study
fields, features, tags, skill names, experience entries, document names) is **never rewritten**; it is
only presented (see DESIGN.md → Page Patterns). Status: **approved** (2026-11-22, with corrections).

## Voice and tone

- **Professional, clear, confident without hype.** Say what was built and why it matters. Let the
  projects carry the proof.
- **Short, declarative sentences.** One idea per sentence. No exclamation marks.
- **First person on personal pages** (About, Contact), neutral on navigation and labels.
- **Concrete over clever.** "Full-stack web applications" beats "Ideas, engineered into reality".
- **Banned vocabulary:** system, initialize, transmission, node, connection (as metaphor), trajectory,
  capability graph, kinetic, archive, vault, FZH-001, FIG. 001, any sci-fi or terminal metaphor.
- **Sentence case** everywhere; mono `label-caps` eyebrows are the only uppercase text.
- **Arrows:** "↗" only for external links; internal links use no arrow or "→".
- **No unverifiable claims** (years of experience, client counts, response times). Availability is
  stated only as approved below.

## Global

| Halaman | Teks lama | Teks baru |
|---|---|---|
| Meta · default title | Farhan Zulkarnain Harahap — Full-Stack Engineer \| Kinetic Systems | Farhan Zulkarnain Harahap — Full-Stack Engineer |
| Meta · title template | %s \| Farhan Zulkarnain | %s · Farhan Zulkarnain Harahap |
| Meta · description | Explore Farhan Zulkarnain Harahap's portfolio: full-stack web apps, modern UI/UX design, Next.js projects, admin dashboards, API integration, certificates, and creative digital experiences. | Full-stack engineer in Medan, Indonesia, building web applications end to end with Next.js, React, TypeScript, Node.js, and PostgreSQL. Selected projects, case studies, and CV. |
| Meta · OpenGraph title / Twitter title | Farhan Zulkarnain Harahap — Full-Stack Engineer \| Kinetic Systems | Farhan Zulkarnain Harahap — Full-Stack Engineer |
| Meta · OpenGraph description | Kinetic Systems: full-stack applications, system architecture, and interactive digital experiences by Farhan Zulkarnain Harahap. | Web applications built end to end, from interface to database. Projects, case studies, and CV. |
| Meta · OG image alt | Farhan — Kinetic Systems | Farhan Zulkarnain Harahap, Full-Stack Engineer |
| Meta · JSON-LD WebSite description | Interactive portfolio for Farhan Zulkarnain Harahap, a Full-Stack Web Developer and UI Developer based in Medan, Indonesia. | Portfolio of Farhan Zulkarnain Harahap, a full-stack engineer based in Medan, Indonesia. |
| Navbar · brand | FARHAN / KINETIC SYSTEMS | Farhan Zulkarnain |
| Navbar · links | Index · About · Journey · Work · Contact | Projects · About · Journey · Contact (the name links home) |
| Navbar · CV link | CV | CV ↗ |
| Navbar · skip link | Skip to content | Skip to content |
| Navbar · palette trigger (aria) | Open command palette | Search and navigate (⌘K) |
| Navbar · theme toggle (aria, new) | — | Switch to dark theme / Switch to light theme |
| Command palette · placeholder | Where would you like to go? | Search pages and projects… |
| Command palette · empty | No matching commands. | No results for "{query}". |
| Command palette · hints | ↵ Open · esc Close | ↵ to open · esc to close |
| Command palette · aria | Search commands · Navigation commands · Close commands | Search · Results · Close search |
| Footer · name | FARHAN ZULKARNAIN HARAHAP / Full-Stack Engineer · Software Engineer | Farhan Zulkarnain Harahap / Full-stack engineer based in Medan, Indonesia. |
| Footer · links | GitHub ↗ · LinkedIn ↗ · Email ↗ | GitHub ↗ · LinkedIn ↗ · Email |
| Footer · bottom line | © {year} FARHAN / KINETIC SYSTEMS · {live clock} WIB | © {year} Farhan Zulkarnain Harahap. Built with Next.js. (clock removed) |
| 404 · eyebrow | ERROR / 404 | 404 |
| 404 · heading | Node not found. | This page doesn't exist. |
| 404 · body | This connection doesn't lead to a page. Let's get you back to the system. | The link may be outdated or mistyped. |
| 404 · actions | Back home ↗ | Back to home · Browse projects |
| Error · eyebrow | CONNECTION INTERRUPTED | Something went wrong |
| Error · heading | Unable to load this page. | This page couldn't be loaded. |
| Error · body | The data service may be unavailable. Please try again. | The content service may be temporarily unavailable. Please try again in a moment. |
| Error · actions | Retry connection ↗ · Back home | Try again · Back to home |
| Generic loading (sr-only) | Loading capability matrix… / Loading project preview… | Loading… (visual skeletons instead of text) |
| Media fallback | Preview unavailable | Image unavailable |
| Section eyebrow pattern | 04 / SELECTED WORK, FARHAN — KINETIC SYSTEMS / ABOUT | Plain label only, e.g. "Selected work" (no numbering, no brand prefix) |

## Home `/`

| Halaman | Teks lama | Teks baru |
|---|---|---|
| Hero · eyebrow | INDEPENDENT ENGINEER / MEDAN, ID | Full-stack engineer · Medan, Indonesia |
| Hero · role line | FULL-STACK ENGINEER & CREATIVE DEVELOPER | (merged into eyebrow) |
| Hero · heading (h1) | FARHAN / ZULKARNAIN / HARAHAP. | Farhan Zulkarnain Harahap |
| Hero · positioning | Thoughtful interfaces. Connected systems. Built to work together. | I build web applications end to end, from a clear interface to the API and database behind it. |
| Hero · description | Software engineer turning complex ideas into clear digital experiences — from the first interaction to the architecture underneath. | (merged into positioning) |
| Hero · CTAs | — | View projects · Get in touch |
| Hero · proof line (new, from API counts) | — | {n} projects · {n} technologies · Next.js, TypeScript, PostgreSQL (top stack from API) |
| Hero · status (new) | — | Open to full-time roles and freelance projects |
| Selected work · eyebrow | 04 / SELECTED WORK | Selected work |
| Selected work · heading | Ideas, engineered into reality. | Projects with the full story. |
| Selected work · description | A closer look at the interfaces, systems, and decisions behind my work. | Each one covers the problem, the approach, and the result. |
| Selected work · link | View all projects ↗ | View all projects → |
| Project card · CTA | Explore project ↗ | View case study |
| Project card · overflow chip | — | +{n} (aria: "{n} more technologies") |
| Stack · eyebrow | CAPABILITY GRAPH | Stack |
| Stack · heading | One stack. Many connections. | Tools I work with every day. |
| Stack · description | From what you see to what makes it work. Explore the technologies across each layer. | Grouped by where they sit in a product: frontend, backend, tooling, and the rest. |
| Stack · category labels | (API: FRONTEND, BACKEND, TOOLS, OTHERS) | Frontend · Backend · Tools · Other (display labels; API values unchanged) |
| Stack · link | Capability graph ↗ | Full stack on About → |
| Journey preview · eyebrow | TRAJECTORY MAP | Journey |
| Journey preview · heading | Every step adds a dimension. | Where I've worked and learned. |
| Journey preview · link | — | Full journey → |
| Journey preview · empty | (5 hardcoded milestones) | Section hidden when there are no experiences |
| Principles · eyebrow | ENGINEERING PRINCIPLES | How I work |
| Principles · heading | Intent in every layer. | Three habits behind every project. |
| Principles · item 1 | Clarity first. — A useful interface makes the next step obvious. I start with the people and the problem. | Start with the problem. — I begin with the people who will use the product and what they need to get done. |
| Principles · item 2 | Connected by design. — Interfaces, APIs, and data should share a clear structure, with each part doing its job well. | One clear structure. — Interface, API, and data model are designed together, so each part stays simple. |
| Principles · item 3 | Built to evolve. — Reusable components, maintainable code, and responsive layouts leave room for what comes next. | Built to be maintained. — Reusable components, typed code, and responsive layouts make the next change easy. |
| Contact band · heading | — | Have a role or a project in mind? |
| Contact band · body | — | Tell me about it. (no response-time promise) |
| Contact band · CTA | — | Get in touch |

## About `/about`

| Halaman | Teks lama | Teks baru |
|---|---|---|
| Meta · title | About Me | About |
| Meta · description | About Farhan Zulkarnain Harahap, a Full-Stack Web Developer from Medan focused on modern web applications, responsive UI, APIs, and deployment. | About Farhan Zulkarnain Harahap, a full-stack engineer in Medan: background, approach, full stack, CV, and certificates. |
| Page eyebrow | FARHAN — KINETIC SYSTEMS / ABOUT | About |
| Page heading (h1) | Inside the system. | Engineer, from interface to database. |
| Profile · eyebrow | IDENTITY · PROFILE / FZH—001 | Profile (`#profile`) |
| Profile · heading | The person behind the system. | Hi, I'm Farhan. |
| Profile · lead | I connect design with engineering. | I connect product design with solid engineering. |
| Profile · body | I'm Farhan, a full-stack developer based in Medan, Indonesia. I build web products from interface to deployment, bringing the frontend, backend, and data into one coherent experience. | I'm a full-stack engineer based in Medan, Indonesia. I build web products from the first interface sketch to deployment, keeping the frontend, the API, and the data model consistent with each other. |
| Profile · facts | Full-stack applications & thoughtful interfaces / Clear structure. Reusable code. Useful details. / CURRENT DIRECTION: API architecture, dashboards & product delivery | Focus: full-stack web applications · Approach: clear structure, reusable code, careful details · Currently: API design, admin dashboards, and product delivery |
| Profile · links | CV & credentials ↗ · Explore my profile ↗ · Capability graph ↗ | Download CV · See the stack ↓ · Documents ↓ |
| Principles | (same as Home) | (same as Home, longer version allowed) |
| Stack · eyebrow / heading | CAPABILITY GRAPH / One stack. Many connections. | Stack (`#stack`) / The full toolkit. |
| Stack · description | From what you see to what makes it work… | Every technology I use, grouped by category. Database and DevOps tools are listed separately. |
| Documents · eyebrow | CREDENTIAL ARCHIVE | Documents (`#documents`) |
| Documents · heading | The work behind the work. | CV and certificates. |
| Documents · description | CV, education, and professional certificates. | Download my CV or view education and professional certificates. |
| Documents · action | Download document ↓ | Download ({size}) / View |
| Documents · empty (new) | — | Documents will be listed here soon. |
| Next step | — | Next: see the journey → · Get in touch |

## Journey `/journey`

| Halaman | Teks lama | Teks baru |
|---|---|---|
| Meta · description | Farhan Zulkarnain Harahap's development journey, bootcamp, training, internship, and full-stack project milestones. | Work experience and learning path of Farhan Zulkarnain Harahap, full-stack engineer. |
| Page eyebrow | FARHAN — KINETIC SYSTEMS / JOURNEY | Journey |
| Page heading (h1) | A path in progress. | Experience & learning (menu label stays "Journey") |
| Lead | A path through learning, professional practice, and building real products. | Roles, training, and projects that shaped how I build software. |
| Timeline labels | FOUNDATION · STRUCTURED LEARNING · BACKEND EXPANSION · PROFESSIONAL PRACTICE · CURRENT FOCUS | (removed; date range from API, "Present" when `current`) |
| Hardcoded milestones | Independent Web Development · Full-Stack Bootcamp (Purwadhika) · Laravel Training · Data-entry Internship (PT Tokio Marine Indonesia) · Full-Stack Product Builds | **Removed** (decision §8.1). Enter real entries via /admin/experience. |
| Footnote | PROFILE MILESTONES / DATED EXPERIENCE ENTRIES NOT YET PUBLISHED | (removed) |
| Empty state (new) | — | Heading: "Experience entries are on their way." Body: "In the meantime, the projects show what I've been building." Action: "Browse projects" |
| Entry · technologies label | — | Stack |
| Next step | — | Next: see the projects → |

## Projects `/projects`

| Halaman | Teks lama | Teks baru |
|---|---|---|
| Meta · description | Selected full-stack projects by Farhan Zulkarnain Harahap, including case studies, live demos, source code, and technology stacks. | Full-stack projects by Farhan Zulkarnain Harahap, with case studies, live demos, source code, and stacks. |
| Page eyebrow | FARHAN — KINETIC SYSTEMS / PROJECTS / PROJECT EXPLORER | Projects |
| Page heading (h1) | Built with intent. | Projects |
| Lead | A closer look at the interfaces, systems, and decisions behind my work. | Web applications I've designed and built, from storefronts to admin dashboards. Each project links to its case study. |
| Filters (new) | — | All · {case types from API} · Stack: {technologies} · Clear filters |
| Filter result (new, aria-live) | — | Showing {n} of {total} projects |
| Filter empty (new) | — | No projects match these filters. Clear filters |
| Vault navigation | ← Previous · Next → · Select a project | (removed with the 3D vault) |
| Loading | Loading project preview… | (skeleton cards) |

## Case study `/projects/[slug]`

| Halaman | Teks lama | Teks baru |
|---|---|---|
| Meta · not found | Project not found | Project not found |
| Breadcrumb (new) | — | Projects / {title} |
| Links · eyebrow | PROJECT LINKS | Links |
| Links · actions | Live website ↗ · Source code ↗ | Visit live site ↗ · View source ↗ |
| Aside labels (new) | — | Type · Stack · Links |
| Chapter labels (new) | — | 01 Problem · 02 Solution · 03 Result |
| Missing chapter (new) | — | (chapter hidden when the API field is empty) |
| Features · heading | Features | Key features |
| Features · toggle (new) | — | Show all {n} features · Show fewer |
| Prev / next (new) | — | Previous project · Next project |
| Closing CTA (new) | — | Interested in something similar? · Get in touch |

## Contact `/contact`

| Halaman | Teks lama | Teks baru |
|---|---|---|
| Meta · description | Contact Farhan Zulkarnain Harahap for full-stack developer roles, freelance projects, collaboration, and web application work. | Contact Farhan Zulkarnain Harahap about full-time roles, freelance projects, or collaboration. |
| Page eyebrow | FARHAN — KINETIC SYSTEMS / CONTACT · TRANSMISSION INTERFACE | Contact |
| Page heading (h1) | Start a connection. / Let's build what's next. | Let's talk. |
| Lead | Have an idea, a role, or a challenge? I'd love to hear about it. | Whether it's a role, a project, or a question, send a message and I'll reply by email. |
| Form · title | NEW TRANSMISSION | Send a message |
| Form · labels | Your name · Email address · Subject · Your message | Name · Email · Subject · Message |
| Form · placeholders | How should I call you? · you@example.com · A project, a role, an idea… · Tell me a little about what you have in mind. | Your full name · you@company.com · e.g. Frontend role at Acme · What are you working on, and how can I help? |
| Form · submit | Send message ↗ / Sending… | Send message / Sending… |
| Form · validation | Please complete every field before sending. | Per field: "Please enter your name." · "Please enter a valid email address." · "Please add a subject." · "Please write a message." Summary: "Please fix {n} fields before sending." |
| Form · success | Message sent. Thank you — I'll get back to you soon. | Thanks, your message has been sent. I'll reply to {email} soon. |
| Form · error | Your message could not be sent. Please try again or use email. | Your message couldn't be sent. Please try again, or email me directly at {email}. |
| Form · timeout | Connection timed out. Please try again or use email. | The request took too long. Please try again, or email me directly. |
| Direct links | GitHub ↗ · LinkedIn ↗ | Email · GitHub ↗ · LinkedIn ↗ |
| Info line (new) | — | Based in Medan, Indonesia (WIB, UTC+7) |

The payload format sent to `/api/contact` (`message: "Subject: …\n\n…"`) stays unchanged.

## Auth `/auth/*` (appearance only; logic unchanged)

| Halaman | Teks lama | Teks baru |
|---|---|---|
| Login · brand | FZ Dev | Farhan Zulkarnain |
| Login · heading | Access System | Sign in |
| Login · subheading | Kinetic Systems / Admin | Admin access |
| Login · placeholders/labels | Email Address · Password | Email · Password (visible labels) |
| Login · password toggle (aria) | Show password / Hide password | Show password / Hide password |
| Login · errors | Login failed · Connection error. Please try again. | (API message kept) · "Couldn't reach the server. Please try again." |
| Login · footer | New here? Create Account | Need an account? Create one |
| Register · heading | Register | Create an account |
| Register · subheading | Kinetic Systems / Account | Member access |
| Register · labels | Full Name · Email Address · Password | Full name · Email · Password |
| Register · errors | Registration failed · Server connection issue. Please retry. | (API message kept) · "Couldn't reach the server. Please try again." |
| Register · footer | Login | Already have an account? Sign in |

## Out of scope

- Dashboard copy (`/dashboard/*`, `/admin/*`) stays as is, per CLAUDE.md, with one approved
  exception below; the rest of the dashboard look stays frozen.

| Halaman | Teks lama | Teks baru |
|---|---|---|
| `/dashboard/user` · eyebrow | KINETIC SYSTEMS / MEMBER | Member area (done in Fase 3; screenshot baseline updated) |
- Internal identifiers (CSS classes, GLB names such as `FZH_*`, storage key `fzh-3d-motion`) are not
  user-facing and disappear with the legacy 3D in Fase 11.
