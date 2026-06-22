"use client";

import { useEffect, useState } from "react";

/**
 * A thin fixed bar at the top of the viewport that tracks how far through
 * the document the user has scrolled. Works for both desktop (window
 * scroll) and mobile (the .page-panel scroll container).
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function pickContainer(): {
      target: HTMLElement | Window;
      read: () => { top: number; max: number };
    } {
      const panel = document.querySelector<HTMLElement>(".page-panel");
      if (panel) {
        const style = getComputedStyle(panel);
        if (style.position === "fixed" && style.overflowY !== "visible") {
          return {
            target: panel,
            read: () => ({
              top: panel.scrollTop,
              max: panel.scrollHeight - panel.clientHeight,
            }),
          };
        }
      }
      return {
        target: window,
        read: () => ({
          top: window.scrollY,
          max:
            document.documentElement.scrollHeight - window.innerHeight,
        }),
      };
    }

    let container = pickContainer();

    function update() {
      const { top, max } = container.read();
      const p = max > 0 ? Math.max(0, Math.min(1, top / max)) : 0;
      setProgress(p);
    }

    function onResize() {
      // The mobile panel becomes a desktop in-flow column at lg+, so on
      // resize re-resolve which container to track.
      container = pickContainer();
      update();
    }

    update();
    container.target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      container.target.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[3px] z-[80] pointer-events-none bg-stone-150"
    >
      <div
        className="h-full bg-orange-500 transition-[width] duration-100 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
