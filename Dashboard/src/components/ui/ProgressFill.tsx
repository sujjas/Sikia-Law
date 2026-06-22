"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/**
 * A thin progress fill that animates its width from 0 → target
 * the first time it scrolls into view. Inherits its background
 * from the parent rule (so variant gradients carry through).
 */
export function ProgressFill({
  percent,
  className,
  duration = 0.9,
  ease = "power2.out",
}: {
  percent: number;
  className?: string;
  duration?: number;
  ease?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const tween = gsap.fromTo(
        el,
        { width: "0%" },
        { width: `${percent}%`, duration, ease, paused: true }
      );

      const obs = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              tween.play();
              obs.disconnect();
              break;
            }
          }
        },
        { rootMargin: "0px 0px -10% 0px" }
      );
      obs.observe(el);
      return () => obs.disconnect();
    },
    { scope: ref, dependencies: [percent] }
  );

  return <div ref={ref} className={className} style={{ width: 0 }} />;
}
