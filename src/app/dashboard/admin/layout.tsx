"use client";

import { useState, useEffect } from "react"; // Tambahkan useEffect
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Tambahkan useRouter
import { 
  LuMenu, 
  LuChevronRight, 
  LuSettings, 
  LuLayoutDashboard, 
  LuZap, 
  LuFolder, 
  LuFileText, 
  LuPlus, 
  LuSettings2,
  LuCircleUser,
  LuLogOut,
  LuRefreshCw
} from "react-icons/lu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true); // State loading untuk cek session
  const [user, setUser] = useState<any>(null); // State simpan data user
  const pathname = usePathname();
  const router = useRouter();

  // 1. LOGIKA CEK SESSION SAAT REFRESH
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include", // WAJIB: Agar cookie accessToken terkirim saat refresh
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setUser(data.user);
        } else {
          router.push("/auth/login");
        }
      } catch (err) {
        console.error("Session Check Error:", err);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [router]);

  // 2. LOGIKA LOGOUT
  const handleLogout = async () => {
    // Anda bisa tambahkan panggil API logout di sini jika ada
    router.push("/auth/login");
  };

  const menuItems = [
    { name: "Home", href: "/admin/home", icon: <LuLayoutDashboard size={20} /> },
    { 
      name: "Skill", 
      href: "/admin/skill", 
      icon: <LuZap size={20} />,
      subName: "Manage Skill",
      subHref: "/admin/skill/manage",
      subIcon: <LuSettings2 size={16} />
    },
    { 
      name: "Portofolio", 
      href: "/admin/portofolio", 
      icon: <LuFolder size={20} />,
      subName: "Upload Porto",
      subHref: "/admin/portofolio/upload",
      subIcon: <LuPlus size={16} />
    },
    { 
      name: "Document", 
      href: "/admin/document", 
      icon: <LuFileText size={20} />,
      subName: "Upload Doc",
      subHref: "/admin/document/upload",
      subIcon: <LuPlus size={16} />
    },
  ];

  const getActiveLabel = () => {
    const activeMenu = menuItems.find(item => pathname.includes(item.href));
    if (!activeMenu) return "Dashboard";
    if (pathname === activeMenu.subHref) return activeMenu.subName;
    return activeMenu.name;
  };

  // Jika sedang loading session, tampilkan spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <LuRefreshCw className="text-indigo-500 animate-spin" size={40} />
        <p className="text-white text-[10px] font-black uppercase tracking-widest">Verifying Session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f7fe]">
      {/* SIDEBAR */}
      <aside 
        className={`bg-[#343a40] text-gray-300 transition-all duration-300 flex flex-col fixed h-full z-30 shadow-2xl 
        ${isOpen ? "w-64" : "w-0 -left-64 md:left-0 md:w-20"}`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-700 whitespace-nowrap overflow-hidden">
          <div className="min-w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold italic mr-3">
            N
          </div>
          <span className={`text-xl font-semibold text-white transition-opacity duration-300 ${!isOpen && "opacity-0"}`}>
            Nexxuswebdev
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
          <p className={`text-[10px] uppercase font-bold text-gray-400 px-2 mb-4 tracking-widest ${!isOpen && "hidden"}`}>
            Menu Utama
          </p>
          
          {menuItems.map((item) => {
            const isActive = pathname.includes(item.href);
            return (
              <div key={item.name} className="space-y-1">
                <Link 
                  href={item.href} 
                  className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all group
                  ${isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "hover:bg-white/5 text-gray-400 hover:text-white"}`}
                >
                  <div className="shrink-0">{item.icon}</div>
                  <span className={`text-sm font-medium transition-opacity duration-300 ${!isOpen && "hidden"}`}>
                    {item.name}
                  </span>
                </Link>

                {item.subHref && isActive && isOpen && (
                  <div className="ml-7 mt-1 border-l-2 border-gray-700/50">
                    <Link 
                      href={item.subHref}
                      className={`flex items-center gap-3 ml-4 py-2.5 px-3 rounded-xl text-[13px] transition-all group/sub
                      ${pathname === item.subHref ? "text-white bg-white/5 font-bold" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                    >
                      <span className={`transition-colors ${pathname === item.subHref ? "text-indigo-400" : "text-gray-600 group-hover/sub:text-gray-400"}`}>
                        {item.subIcon}
                      </span>
                      {item.subName}
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 w-full text-gray-500 hover:text-red-400 transition-colors group"
          >
            <LuLogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className={`text-sm font-medium ${!isOpen && "hidden"}`}>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? "md:ml-64" : "md:ml-20"}`}>
        <header className="h-16 bg-[#6f42c1] flex items-center justify-between px-6 shadow-lg sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 rounded-lg hover:bg-white/20 transition-colors">
              <LuMenu size={24} />
            </button>
            <div className="flex items-center gap-2 text-white/70 text-sm font-medium select-none">
               <Link href="/admin/home" className="hover:text-white transition-colors">Management Admin</Link>
               <LuChevronRight size={14} className="text-white/40" />
               <span className="text-white font-bold tracking-tight">{getActiveLabel()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5 text-white font-sans">
            <LuSettings size={20} className="cursor-pointer opacity-70 hover:opacity-100" />
            <div className="flex items-center gap-3 pl-5 border-l border-white/20">
               <div className="text-right hidden sm:block">
                  {/* Tampilkan Nama User Asli dari Database */}
                  <p className="text-[11px] font-bold leading-none uppercase">{user?.name || "Admin Account"}</p>
                  <p className="text-[10px] text-white/60 mt-1 uppercase italic">{user?.role || "Developer"}</p>
               </div>
               <LuCircleUser size={32} className="opacity-90 cursor-pointer hover:scale-110 transition-transform" />
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-10">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm min-h-[calc(100vh-140px)] overflow-hidden p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
