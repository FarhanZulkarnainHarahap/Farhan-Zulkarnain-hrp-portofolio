import Navbar from "@/components/Navbar";
import InteractiveCursor from "@/components/InteractiveCursor";
import EntranceScreen from "@/components/EntranceScreen";
import AntiGravity from "@/components/AntiGravity";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EntranceScreen />
      <AntiGravity />
      <InteractiveCursor />
      {/* Premium navbar */}
      <Navbar />
      
      <main className="relative z-10 min-h-screen bg-transparent">
        {children}
      </main>
    </>
  );
}
