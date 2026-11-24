/**
 * GSAP Flip for the /projects filters (Fase 12.8): imported on demand by ProjectsExplorer the first
 * time the visitor reaches the filters, so GSAP is not part of the page's first load.
 */
import { Flip } from "gsap/Flip";
import { gsap, prefersMotion, setupGsap, tokens } from "@/lib/gsap";

setupGsap();
gsap.registerPlugin(Flip);

export { Flip, gsap, prefersMotion, tokens };
