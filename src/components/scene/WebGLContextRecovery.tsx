"use client";
/**
 * WebGLContextRecovery (Fase K4): keeps the page working when the GPU context goes away.
 *
 *  1. `webglcontextlost`: default prevented (so the context may be restored), rendering suspended,
 *     status "lost" → <html data-webgl="lost"> brings the static fallbacks back (WebGLFallback).
 *     DOM content and navigation are untouched: nothing in the page depends on the canvas.
 *  2. Recovery, bounded: wait for the browser's own `webglcontextrestored`; if it does not come,
 *     ask for it with WEBGL_lose_context.restoreContext() — at most MAX_RESTORE times, 1.5 s apart.
 *     Still lost → one full canvas remount (new context; `onRemount`). Still failing → status
 *     "failed": the fallback stays for this visit. No infinite loop.
 *  3. `webglcontextrestored`: three.js re-initialises its GL state and re-uploads geometry and
 *     textures on the next render; render targets (the baked environment map) are rebuilt because
 *     `recoveries` keys the EnvironmentController. Status "active", rendering resumes.
 *  4. Shader compilation errors are captured (renderer.debug.onShaderError) and reported, instead
 *     of three's console dump; the scene keeps rendering what still compiles.
 *
 * Tests and the lab lose the context on purpose through sceneController.loseContext().
 */
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { sceneController } from "@/lib/scene/controller";
import { captureShaderErrors } from "@/lib/scene/drivers";
import { sceneStore } from "@/lib/scene/store";
import { useRenderLoop } from "./RenderLoopController";

const MAX_RESTORE = 2;
const RETRY_MS = 1500;

export function WebGLContextRecovery({ onRemount }: { onRemount: () => boolean }) {
  const gl = useThree((s) => s.gl);
  const loop = useRenderLoop();

  useEffect(() => {
    const canvas = gl.domElement;
    const context = gl.getContext();
    const ext = context.getExtension("WEBGL_lose_context");
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const retry = () => {
      timer = setTimeout(() => {
        if (!context.isContextLost()) return;
        if (attempts < MAX_RESTORE && ext) {
          attempts++;
          sceneStore.set({ renderer: "restoring" });
          ext.restoreContext();
          retry();
        } else if (!onRemount()) {
          sceneStore.set({ renderer: "failed", rendererError: "WebGL context could not be restored" });
        }
      }, RETRY_MS);
    };

    const lost = (event: Event) => {
      event.preventDefault();
      loop.suspend();
      const s = sceneStore.get();
      sceneStore.set({ renderer: "lost", contextLosses: s.contextLosses + 1 });
      retry();
    };
    const restored = () => {
      if (timer) clearTimeout(timer);
      attempts = 0;
      const s = sceneStore.get();
      sceneStore.set({ renderer: "active", rendererError: null, recoveries: s.recoveries + 1 });
      loop.resume();
    };

    const restoreShaderErrors = captureShaderErrors(gl, context, (message) => sceneStore.set({ rendererError: `shader: ${message.slice(0, 160)}` }));

    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    sceneController.attachRenderer({
      loseContext: () => {
        if (!ext || context.isContextLost()) return false;
        ext.loseContext();
        return true;
      },
      restoreContext: () => {
        if (!ext || !context.isContextLost()) return false;
        ext.restoreContext();
        return true;
      },
    });
    return () => {
      if (timer) clearTimeout(timer);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      restoreShaderErrors();
      sceneController.attachRenderer(null);
    };
  }, [gl, loop, onRemount]);

  return null;
}
