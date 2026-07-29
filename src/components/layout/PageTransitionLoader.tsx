"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PageTransition = dynamic(() => import("@/components/layout/PageTransition"), {
  ssr: false,
  loading: () => null,
});

export default function PageTransitionLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const idleCallback = window.requestIdleCallback;
    if (idleCallback) {
      const handle = idleCallback(() => setMounted(true), { timeout: 1000 });
      return () => window.cancelIdleCallback(handle);
    }

    const timeout = window.setTimeout(() => setMounted(true), 160);
    return () => window.clearTimeout(timeout);
  }, []);

  return mounted ? <PageTransition /> : null;
}
