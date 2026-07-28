import { motionEase, motionTiming, stagger } from "./transitions";

export const maskRevealContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger.base,
    },
  },
};

export const maskRevealItem = {
  hidden: { y: "110%", opacity: 0 },
  show: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: motionTiming.base,
      ease: motionEase,
    },
  },
};

export const sectionReveal = {
  hidden: { opacity: 0, clipPath: "inset(12% 0 12% 0 round 18px)" },
  show: {
    opacity: 1,
    clipPath: "inset(0% 0 0% 0 round 0px)",
    transition: {
      duration: motionTiming.slow,
      ease: motionEase,
    },
  },
};
