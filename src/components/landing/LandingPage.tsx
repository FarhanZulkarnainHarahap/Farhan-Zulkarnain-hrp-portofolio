import Shell from "@/components/kinetic/Shell";
import Hero from "@/components/kinetic/Hero";
import Profile, { Principles } from "@/components/kinetic/Profile";
import Capabilities from "@/components/kinetic/Capabilities";
import Trajectory from "@/components/kinetic/Trajectory";
import Projects from "@/components/kinetic/Projects";
import Contact from "@/components/kinetic/Contact";
type LandingSection = "home" | "about" | "projects" | "journey" | "contact";
export default function LandingPage({
  initialSection = "home",
}: {
  initialSection?: LandingSection;
}) {
  const home = initialSection === "home";
  return (
    <Shell>
      {home ? (
        <Hero />
      ) : (
        <div className="route-intro">
          <p className="eyebrow">
            FARHAN — KINETIC SYSTEMS / {initialSection.toUpperCase()}
          </p>
          <h1>
            {
              {
                about: "Inside the system.",
                projects: "Built with intent.",
                journey: "A path in progress.",
                contact: "Start a connection.",
                home: "",
              }[initialSection]
            }
          </h1>
        </div>
      )}
      {(home || initialSection === "about") && (
        <>
          <Profile />
          <Capabilities />
        </>
      )}
      {(home || initialSection === "journey") && <Trajectory />}
      {(home || initialSection === "projects") && (
        <Projects selectedOnly={home} />
      )}
      {(home || initialSection === "about") && <Principles />}
      {(home || initialSection === "contact") && <Contact />}
    </Shell>
  );
}
