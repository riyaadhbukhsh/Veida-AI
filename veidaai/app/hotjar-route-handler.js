'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function HotjarRouteHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window.hj === "function") {
      window.hj("stateChange", pathname);
    }
  }, [pathname]);

  return null;
}
