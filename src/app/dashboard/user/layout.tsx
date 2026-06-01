import Navbar from "@/components/Navbar";
import InteractiveCursor from "@/components/InteractiveCursor";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <InteractiveCursor />
      {/* Memasang Navbar premium yang kamu buat tadi */}
      <Navbar />
      
      {/* Memberikan padding top agar konten tidak tertutup Navbar yang posisinya 'fixed' */}
      <main className="pt-24 min-h-screen bg-[#030406]">
        {children}
      </main>
    </section>
  );
}
