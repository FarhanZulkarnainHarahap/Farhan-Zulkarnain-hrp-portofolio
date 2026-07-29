"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const EntranceIntro = dynamic(() => import("@/components/layout/EntranceIntro"), {
  ssr: false,
  loading: () => null,
});

export default function EntranceIntroLoader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(timeout);
  }, []);

  return mounted ? <EntranceIntro /> : null;
}
