"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Menu, X, ArrowUpRight } from "lucide-react";
import { profile, useCollection } from "./kinetic/data";
import type { Document } from "@/services/api";
import { getDocumentSlug } from "@/lib/portfolio/documents";
const links = [
  { href: "/", label: "Index" },
  { href: "/about", label: "About" },
  { href: "/journey", label: "Journey" },
  { href: "/projects", label: "Work" },
  { href: "/contact", label: "Contact" },
];
function Palette({
  dialog,
}: {
  dialog: React.RefObject<HTMLDialogElement | null>;
}) {
  const router = useRouter();
  const { data } = useCollection<Document>("/api/documents");
  const cv = data.find((doc) =>
    /cv|resume|curriculum|curiculum/i.test(`${doc.name} ${doc.category}`),
  );
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const commands = [
    ...links.map((link) => ({
      ...link,
      label:
        link.label === "Index"
          ? "Home"
          : link.label === "Work"
            ? "Projects"
            : link.label,
    })),
    { label: "GitHub", href: profile.github },
    { label: "LinkedIn", href: profile.linkedin },
    {
      label: "CV",
      href: cv
        ? `/api/documents/${getDocumentSlug(cv)}/download`
        : "/about/docs",
    },
  ].filter((link) => link.label.toLowerCase().includes(query.toLowerCase()));
  function navigate(href: string) {
    dialog.current?.close();
    if (href.startsWith("http") || href.startsWith("/api/"))
      window.location.assign(href);
    else router.push(href);
  }
  return (
    <>
      <div className="command-search">
        <Search size={20} />
        <input
          aria-label="Search commands"
          role="combobox"
          aria-expanded="true"
          aria-controls="commands"
          aria-activedescendant={
            commands.length ? `command-${selected}` : undefined
          }
          value={query}
          placeholder="Where would you like to go?"
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setSelected((value) =>
                commands.length
                  ? (value +
                      (event.key === "ArrowDown" ? 1 : -1) +
                      commands.length) %
                    commands.length
                  : 0,
              );
            }
            if (event.key === "Enter" && commands[selected]) {
              event.preventDefault();
              navigate(commands[selected].href);
            }
          }}
          autoFocus
        />
        <button
          aria-label="Close commands"
          onClick={() => dialog.current?.close()}
        >
          <X size={18} />
        </button>
      </div>
      <div id="commands" role="listbox" aria-label="Navigation commands">
        {commands.map((command, index) => (
          <button
            id={`command-${index}`}
            role="option"
            aria-selected={index === selected}
            key={command.label}
            onMouseEnter={() => setSelected(index)}
            onClick={() => navigate(command.href)}
          >
            <span>{command.label}</span>
            <ArrowUpRight size={16} />
          </button>
        ))}
        {commands.length === 0 && (
          <p className="collection-state">No matching commands.</p>
        )}
      </div>
      <p className="command-hint">
        ↑ ↓ Navigate <span>↵ Open</span>
        <span>esc Close</span>
      </p>
    </>
  );
}
export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [paletteMounted, setPaletteMounted] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  const showCommands = () => {
    setPaletteMounted(true);
    dialog.current?.showModal();
  };
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteMounted(true);
        if (dialog.current?.open) dialog.current.close();
        else dialog.current?.showModal();
      }
      if (event.key === "Escape" && !dialog.current?.open && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menu.current?.querySelector("a")?.focus();
    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Farhan, home">
          <span className="brand-mark">
            FZ<span>↗</span>
          </span>
          <span className="brand-name">
            FARHAN<span>KINETIC SYSTEMS</span>
          </span>
        </Link>
        <nav
          aria-label="Main navigation"
          ref={menu}
          id="main-navigation"
          className={open ? "main-nav open" : "main-nav"}
          onKeyDown={(event) => {
            if (open && event.key === "Tab") {
              const last = menu.current?.querySelector("a:last-child");
              const first = menu.current?.querySelector("a");
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                menuButton.current?.focus();
              }
              if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                menuButton.current?.focus();
              }
            }
          }}
        >
          {links.map((link, i) => (
            <Link
              href={link.href}
              key={link.href}
              aria-current={
                (
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href)
                )
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              <span>0{i + 1}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-tools">
          <button
            className="command-trigger"
            onClick={showCommands}
            aria-label="Open command palette"
          >
            <Search size={16} />
            <kbd>⌘ K</kbd>
          </button>
          <button
            ref={menuButton}
            className="menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="main-navigation"
            onClick={() => setOpen((value) => !value)}
            onKeyDown={(event) => {
              if (open && event.key === "Tab") {
                event.preventDefault();
                menu.current
                  ?.querySelector<HTMLAnchorElement>(
                    event.shiftKey ? "a:last-child" : "a",
                  )
                  ?.focus();
              }
            }}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <dialog
        ref={dialog}
        className="command-dialog"
        aria-label="Quick navigation"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
      >
        {paletteMounted && <Palette dialog={dialog} />}
      </dialog>
    </>
  );
}
