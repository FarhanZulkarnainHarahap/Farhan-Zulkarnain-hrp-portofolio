import Navbar from "@/components/Navbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      
      <main className="relative z-10 min-h-screen bg-transparent">
        {children}
      </main>
    </>
  );
}
