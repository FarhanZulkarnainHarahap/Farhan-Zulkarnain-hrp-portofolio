import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
// TEMPORARY: styles for the not-yet-redesigned Kinetic pages, scoped to .legacy-root.
// Remove with the legacy components in Fase 11.
import "@/styles/legacy-kinetic.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-newsreader",
});
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

// Runs before first paint: pins a stored theme choice. Without a stored choice (or without
// JS) the CSS follows prefers-color-scheme, so there is no flash either way.
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Farhan Zulkarnain Harahap",
    url: "https://farhanzulkarnainhrp.com",
    jobTitle: "Full-Stack Engineer / Software Engineer",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Medan",
      addressCountry: "ID",
    },
    sameAs: [
      "https://github.com/FarhanZulkarnainHarahap",
      "https://www.linkedin.com/in/farhan-zulkarnain-71801a347",
    ],
    knowsAbout: [
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "Express.js",
      "UI Development",
      "Full-Stack Web Development",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Farhan Zulkarnain Portfolio",
    url: "https://farhanzulkarnainhrp.com",
    description:
      "Interactive portfolio for Farhan Zulkarnain Harahap, a Full-Stack Web Developer and UI Developer based in Medan, Indonesia.",
  },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://farhanzulkarnainhrp.com"),
  title: {
    default:
      "Farhan Zulkarnain Harahap — Full-Stack Engineer | Kinetic Systems",
    template: "%s | Farhan Zulkarnain",
  },
  description:
    "Explore Farhan Zulkarnain Harahap's portfolio: full-stack web apps, modern UI/UX design, Next.js projects, admin dashboards, API integration, certificates, and creative digital experiences.",
  keywords: [
    "Farhan Zulkarnain Harahap",
    "Farhan Zulkarnain portfolio",
    "Farhan Z portfolio",
    "Full-Stack Engineer Medan",
    "Creative Web Developer",
    "UI/UX Designer",
    "Frontend Developer",
    "Backend Developer",
    "Next.js Developer",
    "React Developer",
    "TypeScript Developer",
    "Tailwind CSS",
    "Node.js",
    "Express.js",
    "PostgreSQL",
    "Prisma",
    "Portfolio Website",
    "Admin Dashboard",
    "Web Application",
  ],
  authors: [
    {
      name: "Farhan Zulkarnain Harahap",
      url: "https://farhanzulkarnainhrp.com",
    },
  ],
  creator: "Farhan Zulkarnain Harahap",
  publisher: "Farhan Zulkarnain Harahap",
  applicationName: "Farhan Zulkarnain Portfolio",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    images: [{ url: "/fz-logo.png", alt: "Farhan — Kinetic Systems" }],
    locale: "en_US",
    url: "https://farhanzulkarnainhrp.com",
    siteName: "Farhan Zulkarnain Portfolio",
    title: "Farhan Zulkarnain Harahap — Full-Stack Engineer | Kinetic Systems",
    description:
      "Kinetic Systems: full-stack applications, system architecture, and interactive digital experiences by Farhan Zulkarnain Harahap.",
  },
  twitter: {
    card: "summary",
    title: "Farhan Zulkarnain Harahap — Full-Stack Engineer | Kinetic Systems",
    description:
      "Full-stack web portfolio featuring Next.js projects, UI/UX design, dashboards, certificates, and creative digital experiences.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="dns-prefetch" href="https://api.farhanzulkarnainhrp.com" />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
