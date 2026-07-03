import Navbar from "@/components/Navbar";
import MusicPlayer from "@/components/MusicPlayer";
import { HoverSoundController } from "@/hooks/useHoverSound";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <MusicPlayer />
      <HoverSoundController />
      
      <div className="relative z-10 min-h-screen bg-transparent">
        {children}
      </div>
    </>
  );
}
