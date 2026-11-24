"use client";
/**
 * Decorative skill icon (Fase 12.8). The icon map (react-icons, ±20 KB gzip) is loaded after mount,
 * once per page, instead of shipping in the first load of /, /about: the box keeps its size while
 * it loads (no layout shift) and the skill name next to it is the content.
 */
import { Code } from "lucide-react";
import { useEffect, useState } from "react";
import type { IconType } from "react-icons";
import { resolveSkillIconKey } from "@/lib/skill-icon-resolver";

type IconMap = Record<string, IconType>;
let cache: IconMap | null = null;
let pending: Promise<IconMap> | null = null;
const loadIcons = () =>
  (pending ??= import("@/lib/skill-icons").then((m) => (cache = m.skillIcons as IconMap)));

const box = "size-(--icon-sm) shrink-0 text-muted";

export function SkillIcon({ name }: { name: string }) {
  const [icons, setIcons] = useState<IconMap | null>(cache);
  useEffect(() => {
    if (icons) return;
    let alive = true;
    loadIcons().then((map) => alive && setIcons(map));
    return () => {
      alive = false;
    };
  }, [icons]);
  if (!icons) return <span aria-hidden="true" className={`inline-block ${box}`} />;
  const Icon = icons[resolveSkillIconKey(name, icons)];
  return Icon ? (
    <Icon aria-hidden="true" className={box} />
  ) : (
    <Code aria-hidden="true" className={box} strokeWidth={1.5} />
  );
}
