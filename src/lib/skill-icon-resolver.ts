import type { IconType } from "react-icons";

const SKILL_ICON_ALIASES: Record<string, string> = {
  bun: "SiBun",
  bunjs: "SiBun",
  bundotjs: "SiBun",
  express: "SiExpress",
  expressjs: "SiExpress",
  expressdotjs: "SiExpress",
  nest: "SiNestjs",
  nestjs: "SiNestjs",
  nestdotjs: "SiNestjs",
  next: "SiNextdotjs",
  nextjs: "SiNextdotjs",
  nextdotjs: "SiNextdotjs",
  node: "SiNodedotjs",
  nodejs: "SiNodedotjs",
  nodedotjs: "SiNodedotjs",
  nuxt: "SiNuxt",
  nuxtjs: "SiNuxt",
  nuxtdotjs: "SiNuxt",
  three: "SiThreedotjs",
  threejs: "SiThreedotjs",
  threedotjs: "SiThreedotjs",
  vue: "SiVuedotjs",
  vuejs: "SiVuedotjs",
  vuedotjs: "SiVuedotjs",
};

const normalizeSkillName = (value: string) =>
  value
    .toLowerCase()
    .replace(/\.js/g, "dotjs")
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

export function resolveSkillIconKey(
  value: string,
  icons: Record<string, IconType>,
): string {
  if (icons[value]) return value;

  const normalized = normalizeSkillName(value);
  const alias = SKILL_ICON_ALIASES[normalized];

  if (alias && icons[alias]) return alias;

  const candidates = [
    `Si${normalized}`,
    `Fa${normalized}`,
    `Lu${normalized}`,
    `Di${normalized}`,
    normalized,
  ];

  return (
    Object.keys(icons).find((key) =>
      candidates.some((candidate) => key.toLowerCase() === candidate.toLowerCase()),
    ) || ""
  );
}
