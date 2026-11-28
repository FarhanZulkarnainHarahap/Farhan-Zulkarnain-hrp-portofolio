"use client";
/**
 * InteractionController (Fase K4): who may raycast into the persistent canvas.
 *
 * The canvas layer never takes pointer events (globals.css: text stays selectable, links and
 * buttons stay clickable, touch scrolling is native). R3F listens on <html> instead
 * (eventSource + eventPrefix "client"), and this controller filters its raycasts: a pointer
 * reaches 3D objects only while it is over an element marked `data-scene-interactive` (the hero
 * orbit stage, the lab stage) and NOT over a real control inside it (link, button, form field,
 * label, dialog…). Objects that sit behind other DOM content therefore never react.
 *
 * Cursor feedback: while a 3D object is hovered, <html data-scene-hover> makes the interactive
 * slot show a pointer cursor (CSS), since the canvas itself has no pointer events.
 */
import { events as pointerEvents, type EventManager, type RootStore } from "@react-three/fiber";

const CONTROLS = "a, button, input, select, textarea, label, summary, dialog, [role='button'], [contenteditable='true']";

let lastTarget: Element | null = null;

function onPointer(event: PointerEvent) {
  lastTarget = event.target instanceof Element ? event.target : null;
}

/** True when the pointer is over an interactive 3D slot and not over a DOM control. */
export function raycastAllowed(target: Element | null = lastTarget) {
  if (!target) return false;
  return !!target.closest("[data-scene-interactive]") && !target.closest(CONTROLS);
}

/** R3F `events` factory: the default pointer events with the slot filter in front. */
export function sceneEvents(store: RootStore): EventManager<HTMLElement> {
  const manager = pointerEvents(store);
  const connect = manager.connect;
  const disconnect = manager.disconnect;
  return {
    ...manager,
    filter: (items, state) => (raycastAllowed() ? (manager.filter ? manager.filter(items, state) : items) : []),
    connect: (target) => {
      // R3F's connect() calls disconnect() first: attach our listeners after it, or they go too.
      connect?.(target);
      document.addEventListener("pointermove", onPointer, { capture: true, passive: true });
      document.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
    },
    disconnect: () => {
      document.removeEventListener("pointermove", onPointer, { capture: true });
      document.removeEventListener("pointerdown", onPointer, { capture: true });
      lastTarget = null;
      disconnect?.();
    },
  };
}

/** Debug: is the pointer currently allowed to raycast, and over what. */
export function pointerDebug() {
  const t = lastTarget;
  return { allowed: raycastAllowed(t), target: t ? `${t.tagName.toLowerCase()}${t.id ? `#${t.id}` : ""}` : null };
}

/** Cursor feedback for a hovered 3D object (the canvas has no cursor of its own). */
export function setSceneCursor(active: boolean) {
  if (active) document.documentElement.dataset.sceneHover = "true";
  else delete document.documentElement.dataset.sceneHover;
}
