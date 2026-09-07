"use client";
import { ConfirmationProvider } from "@/components/kinetic/Confirmation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  ArrowUpRight,
  LayoutDashboard,
  Layers,
  Folder,
  FileText,
  Route,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
const navigation = [
  { name: "Overview", href: "/admin/home", icon: LayoutDashboard },
  { name: "Projects", href: "/admin/portofolio", icon: Folder },
  { name: "Capabilities", href: "/admin/skill", icon: Layers },
  { name: "Experience", href: "/dashboard/admin/experience", icon: Route },
  { name: "Documents", href: "/admin/document", icon: FileText },
];
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const controller = new AbortController();
    async function verify() {
      try {
        const res = await apiFetch("/api/users/profile", {
          signal: controller.signal,
        });
        if (res.status === 401 || res.status === 403) {
          router.replace("/auth/login");
          return;
        }
        const result = await res.json();
        if (!res.ok || !result.success)
          throw new Error("Session could not be verified. Please retry.");
        if (result.data.role !== "ADMIN") {
          router.replace("/dashboard/user");
          return;
        }
        setUser(result.data);
      } catch {
        if (!controller.signal.aborted)
          setError("Session service is unavailable. Please retry.");
      }
    }
    void verify();
    return () => controller.abort();
  }, [router, retry]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  async function logout() {
    setLoggingOut(true);
    setError("");
    try {
      const response = await apiFetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/auth/login");
      router.refresh();
    } catch {
      setError("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }
  if (!user)
    return (
      <div className="admin-gate">
        <p className="eyebrow">KINETIC SYSTEMS / ADMIN</p>
        <h1>{error ? "Connection interrupted." : "Verifying your session…"}</h1>
        {error && (
          <>
            <p role="alert">{error}</p>
            <button
              className="button"
              onClick={() => {
                setError("");
                setRetry((value) => value + 1);
              }}
            >
              Retry
            </button>
          </>
        )}
        <Link className="text-link" href="/">
          ← Return to portfolio
        </Link>
      </div>
    );
  const normalized = pathname.replace("/dashboard/admin/", "/admin/");
  const current = navigation.find((item) =>
    normalized.startsWith(item.href.replace("/dashboard/admin/", "/admin/")),
  );
  return (
    <div className="admin-shell">
      {open && (
        <button
          className="admin-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <Link href="/admin/home" className="brand">
          <span className="brand-mark">
            FZ<span>↗</span>
          </span>
          <span className="brand-name">
            KINETIC SYSTEMS<span>CONTENT WORKSPACE</span>
          </span>
        </Link>
        <p className="eyebrow">MANAGE YOUR PORTFOLIO</p>
        <nav aria-label="Admin navigation">
          {navigation.map(({ name, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={current?.href === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <Icon size={17} />
              {name}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <Link href="/">
            View portfolio <ArrowUpRight size={16} />
          </Link>
          <button onClick={logout} disabled={loggingOut}>
            <LogOut size={16} />
            {loggingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            className="admin-menu-button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div>
            <p className="eyebrow">WORKSPACE / {current?.name || "ADMIN"}</p>
            <span>Portfolio control room</span>
          </div>
          <div className="admin-user">
            <span className="status-dot" />
            <span>
              {user.name}
              <small>{user.role}</small>
            </span>
          </div>
        </header>
        {error && (
          <p className="admin-alert" role="alert">
            {error}
          </p>
        )}
        <main id="main-content" className="admin-content">
          <ConfirmationProvider>{children}</ConfirmationProvider>
        </main>
      </div>
    </div>
  );
}
