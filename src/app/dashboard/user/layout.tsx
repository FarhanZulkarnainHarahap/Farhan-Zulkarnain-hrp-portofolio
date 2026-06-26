import UserChrome from "@/components/UserChrome";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UserChrome />
      
      <main className="relative z-10 min-h-screen bg-transparent">
        {children}
      </main>
    </>
  );
}
