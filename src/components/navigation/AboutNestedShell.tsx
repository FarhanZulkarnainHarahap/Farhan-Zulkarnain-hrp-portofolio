import MusicPlayerLoader from "@/components/MusicPlayerLoader";
import Navbar from "@/components/Navbar";
import ThreeBackgroundLoader from "@/components/landing/ThreeBackgroundLoader";
import AboutSubNavigation from "@/components/navigation/AboutSubNavigation";

export default function AboutNestedShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <MusicPlayerLoader />
      <main id="main-content" className="portfolio-bg relative min-h-screen overflow-x-clip text-white">
        <ThreeBackgroundLoader />
        <div className="relative z-10 mx-auto w-full max-w-[1440px] overflow-hidden px-5 pb-32 pt-28 sm:px-8 lg:px-12 lg:pt-32 xl:px-16">
          <AboutSubNavigation />
          <div className="pt-16 sm:pt-18 lg:pt-24">{children}</div>
        </div>
      </main>
    </>
  );
}
