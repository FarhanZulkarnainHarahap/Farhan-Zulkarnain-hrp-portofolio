import type { Metadata } from "next";
import CyberCursor from "@/components/CyberCursor";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://farhanzulkarnainhrp.com"),
  title: {
    default: "Farhan Z. | Full-Stack Web Developer & UI/UX Designer",
    template: "%s | Farhan Zulkarnain",
  },
  description:
    "Explore Farhan Zulkarnain Harahap's portfolio: modern web apps, polished UI/UX design, Next.js projects, creative interfaces, and selected digital experiences.",
  keywords: [
    "Farhan Zulkarnain Harahap",
    "Farhan Zulkarnain portfolio",
    "Farhan Z portfolio",
    "Full-stack Developer Jakarta",
    "Creative Web Developer",
    "UI/UX Designer",
    "Frontend Developer",
    "Full-Stack Developer",
    "Next.js Developer",
    "React Developer",
    "TypeScript Developer",
    "Tailwind CSS",
    "Node.js",
    "PostgreSQL",
    "Portfolio Website",
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
      "A cinematic dark-tech portfolio showcasing full-stack web applications, clean UI/UX design, creative interactions, skills, documents, and selected project work by Farhan Zulkarnain Harahap.",
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
        {children}
        <CyberCursor />
      </body>
    </html>
  );
}
