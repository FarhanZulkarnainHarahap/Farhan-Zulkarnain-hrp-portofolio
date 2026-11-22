/** Static site/profile constants (not API data). */
export const profile = {
  name: "Farhan Zulkarnain Harahap",
  email: "farhanzulkarnaenhrp@gmail.com",
  github: "https://github.com/FarhanZulkarnainHarahap",
  linkedin: "https://www.linkedin.com/in/farhan-zulkarnain-71801a347",
  image:
    "https://res.cloudinary.com/dpanr1qqp/image/upload/v1765874955/bake-bliss/b1v5qdy9whqszyqohdjb.jpg",
};
export function safeHref(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
