"use client";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ServerCollection,
  type CollectionState,
} from "@/components/site/ServerCollection";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input, Label } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  EMPTY_FILTERS,
  filterOptions,
  filterProjects,
  type ProjectFilters,
} from "@/lib/display/projects";
import type { Loaded } from "@/lib/server/content";
import { Flip } from "gsap/Flip";
import { gsap, prefersMotion, setupGsap, tokens, useGSAP } from "@/lib/gsap";

if (typeof window !== "undefined") {
  setupGsap();
  gsap.registerPlugin(Flip);
}
import { cn } from "@/lib/utils";
import type { Project } from "@/services/api";
import { ProjectCard } from "./ProjectCard";

const selectClass =
  "h-(--field-height) w-full appearance-none rounded-(--field-radius) border border-(color:--field-border) bg-(--field-bg) px-3.5 pr-9 font-body text-copy text-(color:--field-text) " +
  "transition-colors duration-(--duration-fast) ease-standard focus-visible:border-(color:--field-border-focus)";

function toQuery(filters: ProjectFilters) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.stack) params.set("stack", filters.stack);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  const query = params.toString();
  return query ? `?${query}` : "";
}

function ExplorerView({
  state,
  initialFilters,
}: {
  state: CollectionState<Project>;
  initialFilters: ProjectFilters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const ids = { type: useId(), stack: useId(), q: useId() };
  const [filters, setFilters] = useState<ProjectFilters>(initialFilters);
  const options = useMemo(() => filterOptions(state.data), [state.data]);
  const results = useMemo(
    () => filterProjects(state.data, filters),
    [state.data, filters],
  );
  const active = Boolean(filters.type || filters.stack || filters.q.trim());

  // Keep the URL in sync (shareable, back button friendly) without scrolling or re-fetching.
  useEffect(() => {
    const next = `${pathname}${toQuery(filters)}`;
    if (next !== `${window.location.pathname}${window.location.search}`)
      router.replace(next, { scroll: false });
  }, [filters, pathname, router]);

  // Flip (Fase 8): remember where the cards are just before the filter changes, then animate them
  // to their new places after render. Interruptible: a new change kills the running animation.
  const gridRef = useRef<HTMLUListElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const flipTween = useRef<gsap.core.Timeline | null>(null);
  const capture = () => {
    if (gridRef.current && prefersMotion())
      flipState.current = Flip.getState(
        gridRef.current.querySelectorAll("[data-flip-id]"),
      );
  };
  const resultsKey = results.map((project) => project.id).join("|");
  useGSAP(
    () => {
      const state = flipState.current;
      flipState.current = null;
      const grid = gridRef.current;
      if (!state || !grid) return;
      flipTween.current?.kill();
      const t = tokens();
      flipTween.current = Flip.from(state, {
        targets: grid.querySelectorAll("[data-flip-id]"),
        duration: t.base,
        ease: "standard",
        onEnter: (entering) =>
          gsap.fromTo(
            entering,
            { opacity: 0, scale: 0.98 },
            { opacity: 1, scale: 1, duration: t.base, ease: "enter" },
          ),
      });
    },
    { dependencies: [resultsKey], scope: gridRef },
  );

  const update = (patch: Partial<ProjectFilters>) => {
    capture();
    setFilters((current) => ({ ...current, ...patch }));
  };
  const clear = () => {
    capture();
    setFilters(EMPTY_FILTERS);
  };

  if (state.loading)
    return (
      <div
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        aria-busy="true"
        aria-label="Loading projects"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full" />
        ))}
      </div>
    );
  if (state.error)
    return (
      <ErrorState
        title="Projects couldn't be loaded."
        description={state.error}
        onRetry={state.retry}
      />
    );
  if (state.data.length === 0)
    return (
      <EmptyState
        headingLevel="h2"
        title="Projects will appear here soon."
        description="New work is being written up as case studies."
      />
    );

  return (
    <div className="flex flex-col gap-8">
      <form
        role="search"
        aria-label="Filter projects"
        onSubmit={(event) => event.preventDefault()}
        className="grid gap-4 rounded-(--card-radius) border border-hairline bg-surface p-4 md:grid-cols-12 md:items-end"
      >
        <div className="flex flex-col gap-2 md:col-span-5">
          <Label htmlFor={ids.q}>Search by title</Label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-(--icon-sm) -translate-y-1/2 text-muted"
            />
            <Input
              id={ids.q}
              type="search"
              value={filters.q}
              placeholder="e.g. Kasirku"
              autoComplete="off"
              className="pl-10"
              onChange={(event) => update({ q: event.target.value })}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 md:col-span-3">
          <Label htmlFor={ids.type}>Type</Label>
          <div className="relative">
            <select
              id={ids.type}
              className={selectClass}
              value={filters.type}
              onChange={(event) => update({ type: event.target.value })}
            >
              <option value="">All types</option>
              {options.types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3.5 size-(--icon-sm) -translate-y-1/2 text-muted"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 md:col-span-3">
          <Label htmlFor={ids.stack}>Stack</Label>
          <div className="relative">
            <select
              id={ids.stack}
              className={selectClass}
              value={filters.stack}
              onChange={(event) => update({ stack: event.target.value })}
            >
              <option value="">All technologies</option>
              {options.stacks.map((stack) => (
                <option key={stack} value={stack}>
                  {stack}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3.5 size-(--icon-sm) -translate-y-1/2 text-muted"
            />
          </div>
        </div>
        <div className="md:col-span-1">
          <Button
            variant="ghost"
            className={cn("w-full", !active && "invisible")}
            onClick={clear}
            aria-hidden={!active}
            tabIndex={active ? 0 : -1}
            icon={<X aria-hidden="true" />}
          >
            Clear
          </Button>
        </div>
      </form>

      <p
        role="status"
        aria-live="polite"
        className="font-meta text-meta text-muted"
      >
        Showing {results.length} of {state.data.length} projects
      </p>

      {results.length === 0 ? (
        <EmptyState
          headingLevel="h2"
          title="No projects match these filters."
          action={
            <Button variant="secondary" onClick={clear}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <ul ref={gridRef} className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {results.map((project, index) => (
            <li key={project.id} data-flip-id={project.id} className="flex min-w-0">
              <ProjectCard
                project={project}
                headingLevel="h2"
                priority={index < 2}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** All projects with type / stack / title filters synced to ?type=&stack=&q=. */
export function ProjectsExplorer({
  initial,
  initialFilters,
}: {
  initial: Loaded<Project>;
  initialFilters: ProjectFilters;
}) {
  return (
    <section aria-label="All projects" className="pb-section">
      <Container size="wide">
        <ServerCollection initial={initial} path="/api/portofolios">
          {(state) => (
            <ExplorerView state={state} initialFilters={initialFilters} />
          )}
        </ServerCollection>
      </Container>
    </section>
  );
}
