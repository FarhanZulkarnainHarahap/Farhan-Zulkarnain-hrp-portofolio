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
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-32 pt-28 sm:px-8 lg:px-10 lg:pt-32 xl:px-12">
          <AboutSubNavigation />
          <div className="pt-12 sm:pt-14 lg:pt-18">{children}</div>
        </div>
      </main>
    </>
  );
}
