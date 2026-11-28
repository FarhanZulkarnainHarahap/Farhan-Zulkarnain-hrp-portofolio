/**
 * ObjectRegistry (Fase K4): the interactive 3D objects currently mounted in the persistent canvas.
 *
 * An object registers its id, scene, label and its world position getter. The registry lets
 * non-pointer code act on objects — the camera focuses the selected object, the lab offers
 * keyboard buttons for every object (the keyboard / touch alternative to hovering and clicking a
 * mesh), and tests read positions. Selection / hover / focus live in the scene store snapshot.
 */
import type { SceneId, Vec3Tuple } from "./types";

export type RegisteredObject = {
  id: string;
  scene: SceneId;
  label: string;
  /** World position of the object's centre (read when focusing). */
  worldPosition: () => Vec3Tuple;
  /** Plays the click response (keyboard activation uses the same path as a pointer click). */
  press: () => void;
};

const objects = new Map<string, RegisteredObject>();
const listeners = new Set<() => void>();
let version = 0;

const notify = () => {
  version++;
  for (const listener of listeners) listener();
};

export const objectRegistry = {
  register(object: RegisteredObject) {
    objects.set(object.id, object);
    notify();
    return () => {
      if (objects.get(object.id) === object) {
        objects.delete(object.id);
        notify();
      }
    };
  },
  get: (id: string) => objects.get(id),
  list: (scene?: SceneId) => [...objects.values()].filter((o) => !scene || o.scene === scene),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => void listeners.delete(listener);
  },
  version: () => version,
};
