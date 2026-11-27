/**
 * GSAP Flip for the /projects filters (Fase 12.8): imported on demand by ProjectsExplorer the first
 * time the visitor reaches the filters, so GSAP is not part of the page's first load. Flip itself
 * is registered centrally by setupGsap() (Fase K3).
 */
import { Flip, gsap, prefersMotion, setupGsap, tokens } from "@/lib/gsap";

setupGsap();

export { Flip, gsap, prefersMotion, tokens };
