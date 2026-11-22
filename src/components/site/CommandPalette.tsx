"use client";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Copy,
  CornerDownLeft,
  FileText,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useCollection } from "@/hooks/useCollection";
import { getProjectSlug } from "@/lib/portfolio/projects";
import { profile } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Project } from "@/services/api";
import { useTheme } from "./ThemeProvider";
import { primaryLinks } from "./nav";

type Command = {
  id: string;
  group: "Pages" | "Projects" | "Links" | "Actions";
  label: string;
  keywords?: string;
  icon?: ReactNode;
  /** Internal route, external URL, or file download. */
  href?: string;
  external?: boolean;
  run?: () => void | Promise<void>;
  /** Keep the palette open after running (e.g. copy). */
  stay?: boolean;
};

const GROUPS: Command["group"][] = ["Pages", "Projects", "Links", "Actions"];

function Palette({
  dialog,
  cv,
}: {
  dialog: RefObject<HTMLDialogElement | null>;
  cv: string;
}) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const projects = useCollection<Project>("/api/portofolios");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState("");
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Command[]>(() => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    return [
      { id: "page-home", group: "Pages", label: "Home", href: "/" },
      ...primaryLinks.map((link) => ({
        id: `page-${link.href}`,
        group: "Pages" as const,
        label: link.label,
        href: link.href,
        keywords: link.label === "Journey" ? "experience" : undefined,
      })),
      ...projects.data.map((project) => ({
        id: `project-${project.id}`,
        group: "Projects" as const,
        label: project.title,
        keywords: [project.caseType, ...(project.tags ?? [])]
          .filter(Boolean)
          .join(" "),
        href: `/projects/${getProjectSlug(project)}`,
      })),
      {
        id: "link-cv",
        group: "Links",
        label: "Download CV",
        keywords: "resume curriculum vitae",
        icon: <FileText aria-hidden="true" />,
        href: cv,
        external: cv.startsWith("/api/"),
      },
      {
        id: "link-github",
        group: "Links",
        label: "GitHub",
        href: profile.github,
        external: true,
      },
      {
        id: "link-linkedin",
        group: "Links",
        label: "LinkedIn",
        href: profile.linkedin,
        external: true,
      },
      {
        id: "action-email",
        group: "Actions",
        label: "Copy email address",
        keywords: `mail contact ${profile.email}`,
        icon: <Copy aria-hidden="true" />,
        stay: true,
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.email);
            setStatus(`Email address copied: ${profile.email}`);
          } catch {
            setStatus(
              `Couldn't copy automatically. The address is ${profile.email}`,
            );
          }
        },
      },
      {
        id: "action-theme",
        group: "Actions",
        label: `Switch to ${nextTheme} theme`,
        keywords: "theme appearance dark light mode",
        icon:
          nextTheme === "dark" ? (
            <Moon aria-hidden="true" />
          ) : (
            <Sun aria-hidden="true" />
          ),
        run: toggleTheme,
      },
    ];
  }, [projects.data, cv, theme, toggleTheme]);

  const needle = query.trim().toLowerCase();
  const matches = needle
    ? commands.filter((command) =>
        `${command.label} ${command.keywords ?? ""}`
          .toLowerCase()
          .includes(needle),
      )
    : commands;
  // Keyboard order == visual order (grouped).
  const results = GROUPS.flatMap((group) =>
    matches.filter((command) => command.group === group),
  );
  const active = Math.min(selected, Math.max(results.length - 1, 0));

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  async function execute(command: Command) {
    if (command.run) await command.run();
    if (command.stay) return;
    dialog.current?.close();
    if (!command.href) return;
    if (command.external && command.href.startsWith("http"))
      window.open(command.href, "_blank", "noopener");
    else if (command.href.startsWith("/api/"))
      window.location.assign(command.href);
    else router.push(command.href);
  }

  const optionId = (index: number) => `${listId}-option-${index}`;

  return (
    <div className="flex max-h-[min(var(--palette-max-height),80dvh)] flex-col">
      <div className="flex items-center gap-3 border-b border-hairline px-4">
        <Search
          aria-hidden="true"
          className="size-(--icon-md) shrink-0 text-muted"
          strokeWidth={1.5}
        />
        <input
          role="combobox"
          aria-label="Search"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={results.length ? optionId(active) : undefined}
          autoFocus
          value={query}
          placeholder="Search pages and projects…"
          className="h-14 min-w-0 flex-1 bg-transparent text-copy text-ink outline-none placeholder:text-muted"
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
            setStatus("");
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (!results.length) return;
              const step = event.key === "ArrowDown" ? 1 : -1;
              setSelected((active + step + results.length) % results.length);
            } else if (event.key === "Home" && event.ctrlKey) {
              setSelected(0);
            } else if (event.key === "Enter" && results[active]) {
              event.preventDefault();
              void execute(results[active]);
            }
          }}
        />
        <button
          type="button"
          aria-label="Close search"
          onClick={() => dialog.current?.close()}
          className="inline-flex size-(--hit-area-min) shrink-0 items-center justify-center rounded-pill text-muted transition-colors duration-(--duration-fast) ease-standard hover:bg-surface hover:text-ink [&_svg]:size-(--icon-sm)"
        >
          <X aria-hidden="true" />
        </button>
      </div>
      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Results"
        className="flex-1 overflow-y-auto overscroll-contain p-2"
      >
        {GROUPS.map((group) => {
          const items = results.filter((command) => command.group === group);
          if (!items.length) return null;
          const headingId = `${listId}-${group}`;
          return (
            <div
              key={group}
              role="group"
              aria-labelledby={headingId}
              className="py-1"
            >
              <p
                id={headingId}
                role="presentation"
                className="px-3 pt-2 pb-1 font-meta text-label text-muted uppercase"
              >
                {group}
              </p>
              {items.map((command) => {
                const current = results.indexOf(command);
                return (
                  <div
                    key={command.id}
                    id={optionId(current)}
                    data-index={current}
                    role="option"
                    aria-selected={current === active}
                    onPointerMove={() =>
                      current !== active && setSelected(current)
                    }
                    onClick={() => void execute(command)}
                    className={cn(
                      "flex min-h-(--hit-area-min) cursor-pointer items-center gap-3 rounded-(--radius-control) px-3 text-small text-body",
                      "[&_svg]:size-(--icon-sm) [&_svg]:shrink-0 [&_svg]:text-muted",
                      current === active && "bg-surface text-ink",
                    )}
                  >
                    {command.icon}
                    <span className="min-w-0 flex-1 truncate">
                      {command.label}
                    </span>
                    {command.external && command.href?.startsWith("http") && (
                      <ArrowUpRight aria-hidden="true" />
                    )}
                    {current === active && (
                      <CornerDownLeft aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {!results.length && (
          <p className="px-3 py-6 text-small text-muted">
            No results for &ldquo;{query}&rdquo;.
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-hairline px-4 py-2.5 font-meta text-meta text-muted">
        <p aria-live="polite" className="min-w-0 truncate">
          {status}
        </p>
        <p className="shrink-0">↵ to open · esc to close</p>
      </div>
    </div>
  );
}

/** ⌘K / Ctrl+K palette on a modal <dialog> (focus returns to the opener on close). */
export function CommandPalette({
  dialog,
  cv,
  mountKey,
}: {
  dialog: RefObject<HTMLDialogElement | null>;
  cv: string;
  /** Changes on every open, so the query starts empty. 0 = not opened yet. */
  mountKey: number;
}) {
  return (
    <dialog
      ref={dialog}
      aria-label="Search and navigate"
      onClick={(event) => {
        if (event.target === dialog.current) dialog.current.close();
      }}
      className={cn(
        "site-scheme fixed inset-x-0 top-[12dvh] mx-auto mt-0 w-[calc(100%-2*var(--spacing-gutter))] max-w-(--palette-width)",
        "overflow-hidden rounded-(--card-radius) border border-hairline bg-raised p-0 text-body shadow-overlay",
        "backdrop:bg-scrim backdrop:backdrop-blur-(--overlay-blur)",
      )}
    >
      {mountKey > 0 && <Palette key={mountKey} dialog={dialog} cv={cv} />}
    </dialog>
  );
}
