"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const AntiGravity = dynamic(() => import("@/components/AntiGravity"), {
  ssr: false,
});

export default function DeferredAntiGravity() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      return;
    }

    const startScene = () => setReady(true);
    const idleCallback = window.requestIdleCallback?.(startScene, { timeout: 2200 });
    const fallbackTimer = window.setTimeout(startScene, 2400);

    return () => {
      window.clearTimeout(fallbackTimer);
      if (idleCallback) {
        window.cancelIdleCallback?.(idleCallback);
      }
    };
  }, []);

  return ready ? <AntiGravity /> : null;
}
