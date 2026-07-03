import Navbar from "@/components/Navbar";
import { HoverSoundController } from "@/hooks/useHoverSound";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <HoverSoundController />
      
      <div className="relative z-10 min-h-screen bg-transparent">
        {children}
      </div>
    </>
  );
}
