import type { Metadata } from "next";
import CyberBackground from "@/components/CyberBackground";
import MusicPlayer from "@/components/MusicPlayer";
import Navbar from "@/components/Navbar";
import ContactSection from "@/components/sections/contact/ContactSection";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Farhan Zulkarnain Harahap for full-stack developer roles, freelance projects, collaboration, and web application work.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <MusicPlayer />
      <main id="main-content" className="portfolio-bg relative min-h-screen overflow-x-clip pt-16 text-white lg:pt-24">
        <CyberBackground />
        <ContactSection />
      </main>
    </>
  );
}
