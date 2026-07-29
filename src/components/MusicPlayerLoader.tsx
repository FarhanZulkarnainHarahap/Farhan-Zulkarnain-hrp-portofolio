"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MusicPlayer = dynamic(() => import("@/components/MusicPlayer"), {
  ssr: false,
  loading: () => null,
});

export default function MusicPlayerLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const idleCallback = window.requestIdleCallback;
    if (idleCallback) {
      const handle = idleCallback(() => setMounted(true), { timeout: 1200 });
      return () => window.cancelIdleCallback(handle);
    }

    const timeout = window.setTimeout(() => setMounted(true), 180);
    return () => window.clearTimeout(timeout);
  }, []);

  return mounted ? <MusicPlayer /> : null;
}
