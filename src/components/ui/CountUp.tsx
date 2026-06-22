"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/**
 * Counts from 0 up to `value` when the element first scrolls into view,
 * then snaps to the integer at each frame. Lightweight — no plugin.
 */
export function CountUp({
  value,
  duration = 1.1,
  ease = "power2.out",
  className,
}: {
  value: number;
  duration?: number;
  ease?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const counter = { n: 0 };
      const tween = gsap.to(counter, {
        n: value,
        duration,
        ease,
        snap: { n: 1 },
        onUpdate: () => {
          el.textContent = String(Math.round(counter.n));
        },
        paused: true,
      });

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
    { scope: ref, dependencies: [value] }
  );

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
