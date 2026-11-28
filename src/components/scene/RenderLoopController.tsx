"use client";
/**
 * RenderLoopController (Fase K4): binds the render loop (lib/scene/render-loop.ts) to this R3F
 * root. <Canvas frameloop="never"> never draws by itself; frames come only from the shared ticker
 * when the loop asks for them (continuous reasons or on-demand invalidations).
 *
 * Also the "what changed?" sources for on-demand frames: canvas resize, theme switch and quality
 * changes invalidate here; scroll and pointer invalidate in ScrollSceneController / CameraController.
 * After each frame the renderer statistics (draw calls, triangles, textures, geometries, programs,
 * frame time, fps) are written to the scene store frame for the debug panel and tests.
 */
import { useThree } from "@react-three/fiber";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { sceneController } from "@/lib/scene/controller";
import { createRenderLoop, type RenderLoop } from "@/lib/scene/render-loop";
import { sceneStore } from "@/lib/scene/store";

const LoopContext = createContext<RenderLoop | null>(null);

export function useRenderLoop(): RenderLoop {
  const loop = useContext(LoopContext);
  if (!loop) throw new Error("useRenderLoop outside <RenderLoopController>");
  return loop;
}

function writeStats(gl: { info: { render: { calls: number; triangles: number }; memory: { textures: number; geometries: number }; programs: unknown[] | null } }, realMs: number) {
  const r = sceneStore.frame.renderer;
  r.calls = gl.info.render.calls;
  r.triangles = gl.info.render.triangles;
  r.textures = gl.info.memory.textures;
  r.geometries = gl.info.memory.geometries;
  r.programs = gl.info.programs?.length ?? 0;
  r.frames++;
  if (realMs > 0) {
    r.frameTime = r.frameTime ? r.frameTime * 0.9 + realMs * 0.1 : realMs;
    r.fps = Math.round(1000 / r.frameTime);
  }
}

export function RenderLoopController({ children }: { children: ReactNode }) {
  const advance = useThree((s) => s.advance);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const [loop] = useState(() =>
    createRenderLoop({
      advance: (seconds) => advance(seconds),
      afterFrame: (realMs) => writeStats(gl as never, realMs),
    }),
  );

  useEffect(() => {
    sceneController.attachLoop(loop);
    loop.invalidate(2);
    return () => {
      sceneController.attachLoop(null);
      loop.dispose();
    };
  }, [loop]);

  // Resize: R3F updates the camera aspect; draw the new size.
  useEffect(() => {
    loop.invalidate(2);
  }, [loop, size.width, size.height]);

  return <LoopContext.Provider value={loop}>{children}</LoopContext.Provider>;
}
