import { Section } from "@/components/ui/section";

const principles = [
  {
    title: "Start with the problem.",
    body: "I begin with the people who will use the product and what they need to get done.",
  },
  {
    title: "One clear structure.",
    body: "Interface, API, and data model are designed together, so each part stays simple.",
  },
  {
    title: "Built to be maintained.",
    body: "Reusable components, typed code, and responsive layouts make the next change easy.",
  },
];

export function HowIWork() {
  return (
    <Section
      size="wide"
      id="how-i-work"
      eyebrow="How I work"
      title="Three habits behind every project."
      className="border-t border-hairline"
    >
      <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
        {principles.map((item, index) => (
          <li key={item.title} className="flex flex-col gap-3">
            <span className="font-meta text-label text-accent tabular-nums">
              0{index + 1}
            </span>
            <h3 className="font-heading text-title text-ink">{item.title}</h3>
            <p className="text-copy text-body text-pretty">{item.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
