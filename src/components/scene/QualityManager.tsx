"use client";
/**
 * QualityManager (Fase K4): applies the quality tier to the persistent canvas.
 *
 * Starts at the capability ceiling (lib/scene/quality.ts: WebGL probe + device signals), then
 * follows the measured frame time of continuous frames with hysteresis (no flapping). The tier
 * sets the DPR range here; geometry detail, shadows and environment resolution read
 * `sceneStore.quality` in the scenes. The lab can pin a tier (sceneController.pinQuality).
 * It is NOT mirrored into the K3 animation store: smooth scrolling depends on the CPU-side tier.
 */
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { QualityTier } from "@/lib/animation/config";
import { adaptiveDpr } from "@/lib/animation/quality";
import { sceneController } from "@/lib/scene/controller";
import { createFrameMonitor } from "@/lib/scene/quality";
import { sceneStore } from "@/lib/scene/store";
import { useRenderLoop } from "./RenderLoopController";

export function QualityManager({ ceiling, reasons }: { ceiling: QualityTier; reasons: readonly string[] }) {
  const setDpr = useThree((s) => s.setDpr);
  const loop = useRenderLoop();

  useEffect(() => {
    const apply = (tier: QualityTier, why: readonly string[]) => {
      // Canvas only: smooth scrolling (K3) keeps its own CPU-based tier — a software GPU must not
      // turn Lenis off.
      sceneStore.set({ quality: tier, qualityReasons: why });
      setDpr(adaptiveDpr(tier));
      monitor.settle();
      loop.invalidate(2);
    };
    const monitor = createFrameMonitor({
      ceiling,
      initial: ceiling,
      onChange: (tier, why) => {
        if (!sceneStore.get().qualityPinned) apply(tier, [...reasons, why]);
      },
    });
    apply(ceiling, reasons);
    const off = loop.onFrameTime((ms) => monitor.sample(ms));
    sceneController.attachQuality((tier) => apply(tier ?? ceiling, tier ? ["pinned in the lab"] : reasons));
    return () => {
      off();
      sceneController.attachQuality(null);
    };
  }, [ceiling, reasons, setDpr, loop]);

  return null;
}
