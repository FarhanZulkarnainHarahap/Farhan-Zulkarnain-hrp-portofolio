"use client";
/**
 * Lab section 13–14 (Fase K4, development only): the persistent global canvas and its scene
 * manager, driven from the DOM. The stage below is the "lab" scene slot
 * (`data-scene-anchor="lab any"`): any scene forced here renders inside it.
 *
 * 13 Persistent canvas & scene manager: scene switching, camera / lighting presets, quality pin,
 *    keyboard alternative for every 3D object (activate / focus), context loss and restore, an
 *    asset that fails to load, a shader that fails to compile, render-loop state.
 * 14 3D masking prototype: world-space clipping plane, bottom-to-top, scroll-driven and reversible.
 */
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { useTheatreObject } from "@/components/animation/TheatreProvider";
import { useSceneState } from "@/components/scene/hooks";
import { labControls } from "@/components/scene/scenes/lab-controls";
import type { QualityTier } from "@/lib/animation/config";
import { addTick } from "@/lib/animation/ticker";
import { assetManager } from "@/lib/scene/assets";
import { sceneController } from "@/lib/scene/controller";
import { objectRegistry } from "@/lib/scene/objects";
import { CAMERA_PRESETS, LIGHTING_PRESETS, SCENES, type CameraPresetId, type LightingPresetId } from "@/lib/scene/presets";
import { sceneStore } from "@/lib/scene/store";
import type { SceneId } from "@/lib/scene/types";

const button =
  "inline-flex min-h-(--hit-area-min) items-center border border-hairline px-3 text-small text-ink hover:border-hairline-strong aria-pressed:border-accent aria-pressed:text-accent";
const status = "font-meta text-meta text-body";

function useLive(ref: RefObject<HTMLElement | null>, read: () => string) {
  const reader = useRef(read);
  useEffect(() => {
    reader.current = read;
  });
  useEffect(() => {
    let last = 0;
    return addTick("render", (_t, _d, now) => {
      if (now - last < 100 || !ref.current) return;
      last = now;
      ref.current.textContent = reader.current();
    });
  }, [ref]);
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-meta text-label text-muted uppercase">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/**
 * Theatre → scene manager bridge (Fase 5 readiness): while enabled, the "Global Camera" and
 * "Lighting" sheet objects drive the persistent canvas through sceneStore.frame.theatre (values
 * copied each frame from the Theatre subscription refs; no React state). Off → presets again.
 */
function TheatreBridge({ camera, lights }: { camera: boolean; lights: boolean }) {
  const cam = useTheatreObject("camera", "Camera");
  const key = useTheatreObject("lighting", "Key Light");
  const rim = useTheatreObject("lighting", "Rim Light");
  const env = useTheatreObject("lighting", "Environment");
  useEffect(() => {
    if (!camera && !lights) return;
    const remove = addTick("render", () => {
      const t = sceneStore.frame.theatre;
      const c = cam.values.current;
      t.camera = camera && c ? { position: [c.position.x, c.position.y, c.position.z], target: [c.target.x, c.target.y, c.target.z], fov: c.fov } : null;
      const k = key.values.current;
      const r = rim.values.current;
      const e = env.values.current;
      t.lights = lights && k && r && e ? { key: k.intensity, rim: r.intensity, environment: e.intensity } : null;
      sceneController.invalidate(1);
    });
    return () => {
      remove();
      sceneStore.frame.theatre.camera = null;
      sceneStore.frame.theatre.lights = null;
      sceneController.invalidate(2);
    };
  }, [camera, lights, cam, key, rim, env]);
  return null;
}

function useObjects() {
  useSyncExternalStore(objectRegistry.subscribe, objectRegistry.version, () => 0);
  return objectRegistry.list();
}

export function CanvasLab() {
  const s = useSceneState((x) => x);
  const objects = useObjects();
  const lab = useSyncExternalStore(labControls.subscribe, labControls.get, labControls.get);
  const [asset, setAsset] = useState("–");
  const [theatre, setTheatre] = useState({ camera: false, lights: false });
  const loop = useRef<HTMLParagraphElement>(null);
  const mask = useRef<HTMLParagraphElement>(null);
  const orbit = useRef<HTMLParagraphElement>(null);

  useLive(loop, () => {
    const debug = (window as unknown as { __kinetic?: { scene?: { loop: () => { reasons: string[]; attached: boolean } } } }).__kinetic?.scene?.loop();
    return `Render loop: ${sceneStore.get().renderMode} · ${debug?.attached ? "drawing" : "idle"} · reasons ${debug?.reasons.join(", ") || "none"}`;
  });
  useLive(mask, () => {
    const p = sceneStore.frame.probes;
    const revealed = Number(p["lab:mask:revealed"] ?? 0);
    return `Mask: progress ${Number(p["lab:mask:progress"] ?? 0).toFixed(3)} · plane y ${Number(p["lab:mask:plane"] ?? 0).toFixed(3)} · revealed ${(revealed * 100).toFixed(1)}%`;
  });
  useLive(orbit, () => {
    const p = sceneStore.frame.probes["lab:node0"];
    return Array.isArray(p) ? `Orbit node 0 at ${p.map((v) => v.toFixed(3)).join(", ")}` : "Orbit node 0: –";
  });

  const loadMissing = () => {
    setAsset("loading…");
    assetManager.gltf("/3d/k4-missing-asset.glb").then(
      () => setAsset("loaded (unexpected)"),
      (error: unknown) => {
        assetManager.release("/3d/k4-missing-asset.glb");
        setAsset(`failed as expected: ${error instanceof Error ? error.message.slice(0, 80) : "error"} — scene keeps its procedural fallback`);
      },
    );
  };

  return (
    <>
      <section id="lab-k4" data-section="lab-k4" aria-labelledby="lab-k4-title" className="border-t border-hairline py-12 lg:col-span-12">
        <p className="font-meta text-label text-muted uppercase">13 · three + r3f + drei + maath · persistent global canvas (Fase K4)</p>
        <h2 id="lab-k4-title" className="mt-3 font-display text-headline text-ink uppercase">
          Persistent canvas & scene manager
        </h2>
        <p className="mt-3 max-w-reading text-small text-body">
          One canvas for every public page (mounted {s.mountCount}× this visit). The stage on the right is the lab scene&apos;s DOM slot: the scene manager projects it into the
          canvas, so whatever scene is forced here renders inside it. 3D objects react only while the pointer is over the stage.
        </p>
        <p data-testid="k4-status" className={`${status} mt-4`}>
          {`Renderer: ${s.renderer} · scene: ${s.activeScene ?? "none"} (${s.activeScene ? (s.scenes[s.activeScene] ?? "–") : "–"}) · mounts: ${s.mountCount} · mode: ${s.renderMode} · quality: ${s.quality}`}
        </p>
        <p ref={loop} data-testid="k4-loop" className={status}>
          Render loop: –
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-5">
            <Group label="Scene">
              {(Object.keys(SCENES) as SceneId[]).map((id) => (
                <button key={id} type="button" className={button} aria-pressed={s.activeScene === id} data-testid={`k4-scene-${id}`} onClick={() => sceneController.forceScene(id)}>
                  {id}
                </button>
              ))}
              <button type="button" className={button} aria-pressed={!s.forcedScene} data-testid="k4-scene-route" onClick={() => sceneController.forceScene(null)}>
                follow route
              </button>
            </Group>
            <Group label="Camera preset">
              {(Object.keys(CAMERA_PRESETS) as CameraPresetId[]).map((id) => (
                <button key={id} type="button" className={button} aria-pressed={s.cameraPreset === id} data-testid={`k4-camera-${id}`} onClick={() => sceneController.setCameraPreset(id)}>
                  {id}
                </button>
              ))}
              <button type="button" className={button} aria-pressed={!s.cameraPreset} data-testid="k4-camera-reset" onClick={() => sceneController.resetCamera()}>
                reset camera
              </button>
            </Group>
            <Group label="Lighting preset">
              {(Object.keys(LIGHTING_PRESETS) as LightingPresetId[]).map((id) => (
                <button key={id} type="button" className={button} aria-pressed={s.lightingPreset === id} data-testid={`k4-light-${id}`} onClick={() => sceneController.setLightingPreset(id)}>
                  {id}
                </button>
              ))}
              <button type="button" className={button} aria-pressed={!s.lightingPreset} onClick={() => sceneController.setLightingPreset(null)}>
                scene default
              </button>
            </Group>
            <Group label="Theatre.js → scene manager">
              <button type="button" className={button} aria-pressed={theatre.camera} data-testid="k4-theatre-camera" onClick={() => setTheatre((t) => ({ ...t, camera: !t.camera }))}>
                camera from Theatre
              </button>
              <button type="button" className={button} aria-pressed={theatre.lights} data-testid="k4-theatre-lights" onClick={() => setTheatre((t) => ({ ...t, lights: !t.lights }))}>
                lights from Theatre
              </button>
            </Group>
            <TheatreBridge camera={theatre.camera} lights={theatre.lights} />
            <Group label="Quality">
              {(["high", "medium", "low"] as QualityTier[]).map((tier) => (
                <button key={tier} type="button" className={button} aria-pressed={s.qualityPinned && s.quality === tier} data-testid={`k4-quality-${tier}`} onClick={() => sceneController.pinQuality(tier)}>
                  {tier}
                </button>
              ))}
              <button type="button" className={button} aria-pressed={!s.qualityPinned} data-testid="k4-quality-auto" onClick={() => sceneController.pinQuality(null)}>
                auto
              </button>
            </Group>
            <Group label="Objects (keyboard / touch alternative)">
              {objects
                .filter((o) => !o.id.includes(":node:"))
                .map((o) => (
                  <button key={o.id} type="button" className={button} aria-pressed={s.selectedObject === o.id} data-testid={`k4-object-${o.id}`} onClick={() => sceneController.activate(o.id)}>
                    {o.label}
                  </button>
                ))}
              <button type="button" className={button} data-testid="k4-focus" disabled={!s.selectedObject} onClick={() => sceneController.focus(s.selectedObject)}>
                focus selected
              </button>
            </Group>
            <Group label="Failure handling">
              <button type="button" className={button} data-testid="k4-lose" onClick={() => sceneController.loseContext()}>
                lose WebGL context
              </button>
              <button type="button" className={button} data-testid="k4-restore" onClick={() => sceneController.restoreContext()}>
                restore now
              </button>
              <button type="button" className={button} data-testid="k4-asset-fail" onClick={loadMissing}>
                load a missing GLB
              </button>
              <button type="button" className={button} aria-pressed={lab.brokenShader} data-testid="k4-shader" onClick={() => labControls.set({ brokenShader: !lab.brokenShader })}>
                {lab.brokenShader ? "remove broken shader" : "compile a broken shader"}
              </button>
            </Group>
            <p data-testid="k4-asset" className={status}>{`Asset: ${asset}`}</p>
            <p data-testid="k4-error" className={status}>{`Renderer error: ${s.rendererError ?? "none"} · context: ${s.contextLosses} lost / ${s.recoveries} recovered`}</p>
            <p ref={orbit} data-testid="k4-orbit" className={status}>
              Orbit node 0: –
            </p>
          </div>
          <div className="lg:col-span-7">
            <div
              data-scene-anchor="lab any"
              data-scene-interactive
              data-testid="k4-stage"
              className="relative aspect-square w-full border border-hairline"
            >
              <span className="absolute top-3 left-3 font-meta text-label text-muted uppercase">Scene slot · {s.activeScene ?? "–"}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="lab-k4-mask" data-section="lab-k4-mask" aria-labelledby="lab-k4-mask-title" className="min-h-[60svh] border-t border-hairline py-12 lg:col-span-12">
        <p className="font-meta text-label text-muted uppercase">14 · three clipping plane + glsl · masking prototype (Fase K4)</p>
        <h2 id="lab-k4-mask-title" className="mt-3 font-display text-headline text-ink uppercase">
          3D masking prototype
        </h2>
        <p className="mt-3 max-w-reading text-small text-body">
          The torus knot at the right of the stage is cut by a world-space clipping plane: geometry above the plane is not drawn. Scrolling the stage up through the
          viewport raises the plane (bottom-to-top reveal) and lifts the object; scrolling back lowers it again. The glowing edge is the K3 GLSL mask at the same height.
        </p>
        <p ref={mask} data-testid="k4-mask" className={`${status} mt-4`}>
          Mask: –
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className={button} aria-pressed={lab.maskSource === "scroll"} data-testid="k4-mask-scroll" onClick={() => labControls.set({ maskSource: "scroll" })}>
            scroll-driven
          </button>
          <button type="button" className={button} aria-pressed={lab.maskSource === "manual"} data-testid="k4-mask-manual" onClick={() => labControls.set({ maskSource: "manual" })}>
            manual
          </button>
          <label className="flex items-center gap-3 text-small text-body">
            Progress
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={lab.maskManual}
              data-testid="k4-mask-range"
              onChange={(event) => {
                labControls.set({ maskSource: "manual", maskManual: Number(event.target.value) });
                sceneController.invalidate(2);
              }}
            />
          </label>
        </div>
      </section>
    </>
  );
}
