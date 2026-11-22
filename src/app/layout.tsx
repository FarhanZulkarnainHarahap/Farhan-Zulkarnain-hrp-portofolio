import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
// TEMPORARY: styles for the not-yet-redesigned Kinetic pages, scoped to .legacy-root.
// Remove with the legacy components in Fase 11.
import "@/styles/legacy-kinetic.css";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { profile } from "@/lib/site";

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

// Motion (Fase 8): pre-hide animated elements only when JS runs and motion is allowed. If GSAP is
// not ready within 2.5 s, drop the class so everything shows (no content is ever stuck hidden).
const motionScript = `try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: no-preference)").matches){d.classList.add("js-motion");setTimeout(function(){if(!d.classList.contains("motion-ready"))d.classList.remove("js-motion")},2500)}}catch(e){}`;

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Farhan Zulkarnain Harahap",
    url: "https://farhanzulkarnainhrp.com",
    jobTitle: "Full-Stack Engineer",
    email: `mailto:${profile.email}`,
    image: profile.image,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Medan",
      addressCountry: "ID",
    },
    sameAs: [profile.github, profile.linkedin],
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
      "Portfolio of Farhan Zulkarnain Harahap, a full-stack engineer based in Medan, Indonesia.",
  },
];

export const metadata: Metadata = {
  metadataBase: new URL("https://farhanzulkarnainhrp.com"),
  title: {
    default: "Farhan Zulkarnain Harahap — Full-Stack Engineer",
    template: "%s · Farhan Zulkarnain Harahap",
  },
  description:
    "Full-stack engineer in Medan, Indonesia, building web applications end to end with Next.js, React, TypeScript, Node.js, and PostgreSQL. Selected projects, case studies, and CV.",
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
    images: [
      {
        url: "/fz-logo.png",
        alt: "Farhan Zulkarnain Harahap, Full-Stack Engineer",
      },
    ],
    locale: "en_US",
    url: "https://farhanzulkarnainhrp.com",
    siteName: "Farhan Zulkarnain Portfolio",
    title: "Farhan Zulkarnain Harahap — Full-Stack Engineer",
    description:
      "Web applications built end to end, from interface to database. Projects, case studies, and CV.",
  },
  twitter: {
    card: "summary",
    title: "Farhan Zulkarnain Harahap — Full-Stack Engineer",
    description:
      "Web applications built end to end, from interface to database. Projects, case studies, and CV.",
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
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
        <link rel="dns-prefetch" href="https://api.farhanzulkarnainhrp.com" />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
