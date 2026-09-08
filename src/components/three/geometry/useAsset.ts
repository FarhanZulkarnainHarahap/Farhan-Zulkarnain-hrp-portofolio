import { useEffect, useMemo } from "react";
import type { BufferGeometry } from "three";
/** Owned geometry is generated once per asset, then disposed with its component. */
export function useAsset<
  T extends BufferGeometry | Record<string, BufferGeometry>,
>(factory: () => T, deps: React.DependencyList): T {
  // The callers supply every input used to build deterministic geometry.
  // This resource factory deliberately forwards its caller’s dependency list.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const value = useMemo(factory, deps);
  useEffect(
    () => () => {
      if ("dispose" in value && typeof value.dispose === "function")
        value.dispose();
      else Object.values(value).forEach((item) => item.dispose());
    },
    [value],
  );
  return value;
}
