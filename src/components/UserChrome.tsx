"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";

const EntranceScreen = dynamic(() => import("@/components/EntranceScreen"), {
  ssr: false,
});

const InteractiveCursor = dynamic(() => import("@/components/InteractiveCursor"), {
  ssr: false,
});

export default function UserChrome() {
  return (
    <>
      <EntranceScreen />
      <InteractiveCursor />
      <Navbar />
    </>
  );
}
