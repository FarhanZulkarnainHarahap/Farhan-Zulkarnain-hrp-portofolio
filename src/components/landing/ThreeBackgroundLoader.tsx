"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CyberBackground = dynamic(() => import("@/components/CyberBackground"), {
  ssr: false,
  loading: () => null,
});

export default function ThreeBackgroundLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const idleCallback = window.requestIdleCallback;
    if (idleCallback) {
      const handle = idleCallback(() => setMounted(true), { timeout: 900 });
      return () => window.cancelIdleCallback(handle);
    }

    const timeout = window.setTimeout(() => setMounted(true), 120);
    return () => window.clearTimeout(timeout);
  }, []);

  return mounted ? <CyberBackground /> : null;
}
