import type { Project } from "@/services/api";

export type ProjectLike = Pick<
  Project,
  | "id"
  | "title"
  | "description"
  | "imageUrl"
  | "demoUrl"
  | "repoUrl"
  | "caseType"
  | "caseProblem"
  | "caseSolution"
  | "caseResult"
  | "tags"
  | "features"
  | "createdAt"
>;

export function slugifyProject(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function getProjectSlug(project: Pick<ProjectLike, "title" | "id">) {
  const titleSlug = slugifyProject(project.title);
  return titleSlug || project.id;
}

export function splitListValue(value?: string[] | string | null) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);

  return value
    .split(/[,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function firstText(...values: Array<string | null | undefined>) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0)?.trim();
}

export function getProjectCategory(project: {
  caseType?: string | null;
  type?: string | null;
  category?: string | null;
}) {
  return firstText(project.caseType, project.type, project.category) ?? "Web Application";
}

export function inferProjectDetails(project: ProjectLike) {
  const text = `${project.title} ${project.description}`.toLowerCase();
  let details = {
    type: "Web Application",
    tags: ["Responsive UI", "Modern Web", "Scalable", "API Ready"],
    problem:
      "Digital products need a clean interface, clear user flow, and a codebase that can grow without becoming messy.",
    solution:
      "Built a polished web application experience with reusable UI patterns, structured layout, and performance-minded presentation.",
    result:
      "A modern project that communicates the product idea clearly and gives the codebase room to scale.",
    features: ["Responsive layout", "Reusable components", "Clean navigation", "Modern visual system"],
  };

  if (text.includes("market") || text.includes("grocery")) {
    details = {
      type: "Grocery App",
      tags: ["Product Catalog", "Cart Flow", "Responsive UI", "Order Ready"],
      problem:
        "Users need a clean grocery interface that makes product discovery, cart management, and checkout feel quick on mobile.",
      solution:
        "Built a structured shopping experience with clear product grouping, focused navigation, and a modern storefront layout.",
      result:
        "A practical commerce-style interface that is easier to scan, faster to use, and ready to scale into real order workflows.",
      features: ["Product browsing", "Category layout", "Cart-oriented flow", "Mobile-first presentation"],
    };
  }

  if (text.includes("calendar") || text.includes("callender")) {
    details = {
      type: "Productivity App",
      tags: ["Schedule UI", "Task Flow", "Cards", "Clean Dashboard"],
      problem:
        "A productivity interface needs to organize schedules and notes without making the screen feel crowded.",
      solution:
        "Designed a compact calendar dashboard with card-based information, readable hierarchy, and smooth visual states.",
      result:
        "A sharper planning experience with a focused layout for daily schedules, reminders, and task context.",
      features: ["Calendar layout", "Schedule cards", "Workflow buttons", "Dark productivity UI"],
    };
  }

  if (text.includes("nexxora") || text.includes("store") || text.includes("e-commerce")) {
    details = {
      type: "E-Commerce Platform",
      tags: ["Storefront", "Checkout", "Admin", "User Profile"],
      problem:
        "An online store needs a premium storefront while still supporting product, user, order, and admin flows.",
      solution:
        "Created a polished e-commerce experience with product catalog structure, shopping actions, and dashboard-ready architecture.",
      result:
        "A scalable commerce foundation that balances visual quality with practical full-stack product management.",
      features: ["Product catalog", "Checkout flow", "User profile", "Admin dashboard"],
    };
  }

  if (text.includes("talk") || text.includes("chat")) {
    details = {
      type: "Chat Application",
      tags: ["Authentication", "Realtime UI", "User List", "Clean Chat"],
      problem:
        "Messaging apps need fast context switching while keeping conversations readable and secure.",
      solution:
        "Built a focused chat interface with authentication-minded structure, user list, and clear conversation hierarchy.",
      result:
        "A clean communication product concept that feels modern, responsive, and easy to extend.",
      features: ["Conversation layout", "User list", "Authentication flow", "Realtime-ready UI"],
    };
  }

  const tags = splitListValue(project.tags);
  const features = splitListValue(project.features);

  return {
    ...details,
    type: project.caseType ?? details.type,
    tags: tags.length ? tags : details.tags,
    problem: firstText(project.caseProblem) ?? details.problem,
    solution: firstText(project.caseSolution) ?? details.solution,
    result: firstText(project.caseResult) ?? details.result,
    features: features.length ? features : details.features,
  };
}

export function findProjectBySlug(projects: ProjectLike[], slug: string) {
  return projects.find((project) => getProjectSlug(project) === slug || project.id === slug);
}
