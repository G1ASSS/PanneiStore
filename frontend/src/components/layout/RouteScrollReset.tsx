"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    scrollToPageTop();

    const frame = requestAnimationFrame(() => {
      scrollToPageTop();
      requestAnimationFrame(scrollToPageTop);
    });

    const timeout = window.setTimeout(scrollToPageTop, 0);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [pathname]);

  return null;
}
