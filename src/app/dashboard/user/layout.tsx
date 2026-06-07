import Navbar from "@/components/Navbar";
import InteractiveCursor from "@/components/InteractiveCursor";
import EntranceScreen from "@/components/EntranceScreen";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <EntranceScreen />
      <InteractiveCursor />
      {/* Premium navbar */}
      <Navbar />
      
      {/* Top padding keeps content clear of the fixed navbar */}
      <main className="pt-24 min-h-screen bg-[#030406]">
        {children}
      </main>
    </section>
  );
}
