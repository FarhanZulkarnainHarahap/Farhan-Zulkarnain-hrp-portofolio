import CyberBackground from "@/components/CyberBackground";
import MusicPlayer from "@/components/MusicPlayer";
import Navbar from "@/components/Navbar";
import AboutSubNavigation from "@/components/navigation/AboutSubNavigation";

export default function AboutNestedShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <MusicPlayer />
      <main id="main-content" className="portfolio-bg relative min-h-screen overflow-x-clip text-white">
        <CyberBackground />
        <AboutSubNavigation />
        <div className="relative z-10 -mt-12">{children}</div>
      </main>
    </>
  );
}
