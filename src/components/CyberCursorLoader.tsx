"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CyberCursor = dynamic(() => import("@/components/CyberCursor"), {
  ssr: false,
  loading: () => null,
});

export default function CyberCursorLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    const idleCallback = window.requestIdleCallback;
    if (idleCallback) {
      const handle = idleCallback(() => setMounted(true), { timeout: 1400 });
      return () => window.cancelIdleCallback(handle);
    }

    const timeout = window.setTimeout(() => setMounted(true), 220);
    return () => window.clearTimeout(timeout);
  }, []);

  return mounted ? <CyberCursor /> : null;
}
