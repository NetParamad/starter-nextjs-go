"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    function scrollToTop() {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    scrollToTop();
    const frame = window.requestAnimationFrame(scrollToTop);

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
