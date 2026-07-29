import type { Metadata } from "next";
import CyberCursorLoader from "@/components/CyberCursorLoader";
import EntranceIntroLoader from "@/components/layout/EntranceIntroLoader";
import PageTransitionLoader from "@/components/layout/PageTransitionLoader";
import "./globals.css";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Farhan Zulkarnain Harahap",
    url: "https://farhanzulkarnainhrp.com",
    jobTitle: "Full-Stack Web Developer",
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
    default: "Farhan Z. | Full-Stack Web Developer & UI/UX Designer",
    template: "%s | Farhan Zulkarnain",
  },
  description:
    "Explore Farhan Zulkarnain Harahap's portfolio: full-stack web apps, modern UI/UX design, Next.js projects, admin dashboards, API integration, certificates, and creative digital experiences.",
  keywords: [
    "Farhan Zulkarnain Harahap",
    "Farhan Zulkarnain portfolio",
    "Farhan Z portfolio",
    "Full-stack Developer Jakarta",
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
  authors: [{ name: "Farhan Zulkarnain Harahap", url: "https://farhanzulkarnainhrp.com" }],
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
    locale: "en_US",
    url: "https://farhanzulkarnainhrp.com",
    siteName: "Farhan Zulkarnain Portfolio",
    title: "Farhan Z. | Full-Stack Web Developer & UI/UX Designer",
    description:
      "A dark-tech portfolio showcasing full-stack web applications, clean UI/UX design, API integrations, dashboards, skills, documents, and selected project work by Farhan Zulkarnain Harahap.",
  },
  twitter: {
    card: "summary",
    title: "Farhan Z. | Full-Stack Web Developer & UI/UX Designer",
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
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="dns-prefetch" href="https://api2.farhanzulkarnainhrp.com" />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <EntranceIntroLoader />
        <PageTransitionLoader />
        <CyberCursorLoader />
      </body>
    </html>
  );
}
