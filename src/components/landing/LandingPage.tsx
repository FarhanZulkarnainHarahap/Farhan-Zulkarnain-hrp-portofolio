import MusicPlayerLoader from "@/components/MusicPlayerLoader";
import ImmersiveExperience from "@/components/immersive/ImmersiveExperience";
import LandingScrollManager from "@/components/landing/LandingScrollManager";

type LandingSection = "home" | "about" | "projects" | "journey" | "contact";

export default function LandingPage({
  initialSection = "home",
}: {
  initialSection?: LandingSection;
}) {
  return (
    <>
      <LandingScrollManager initialSection={initialSection} />
      <MusicPlayerLoader />
      <ImmersiveExperience />
    </>
  );
}
