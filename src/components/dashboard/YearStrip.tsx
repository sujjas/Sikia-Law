"use client";
import { useLayoutEffect, useRef, useState } from "react";

const YEARS = [1, 2, 3, 4] as const;

export function YearStrip({ initial = 2 }: { initial?: 1 | 2 | 3 | 4 }) {
  const [active, setActive] = useState<number>(initial);

  const stripRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const [hasMeasured, setHasMeasured] = useState(false);

  useLayoutEffect(() => {
    const btn = buttonRefs.current[active];
    const indicator = indicatorRef.current;
    if (!btn || !indicator) return;
    indicator.style.left = `${btn.offsetLeft}px`;
    indicator.style.width = `${btn.offsetWidth}px`;
    if (!hasMeasured) setHasMeasured(true);
  }, [active, hasMeasured]);

  return (
    <div
      ref={stripRef}
      role="tablist"
      className="relative flex items-center bg-stone-150 rounded-full"
      style={{
        gap: "2px",
        padding: "var(--year-strip-pad)",
      }}
    >
      {/* Sliding active indicator */}
      <div
        ref={indicatorRef}
        aria-hidden
        className={`absolute top-1 bottom-1 bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-stone-200 ${
          hasMeasured
            ? "transition-[left,width] duration-300 ease-[var(--ease-out)]"
            : ""
        }`}
        style={{ left: 0, width: 0 }}
      />
      {YEARS.map((y) => {
        const isActive = y === active;
        return (
          <button
            key={y}
            ref={(el) => {
              buttonRefs.current[y] = el;
            }}
            role="tab"
            aria-selected={isActive}
            onClick={() => setActive(y)}
            className={`relative z-10 rounded-full font-sans text-label-sm cursor-pointer transition-colors ${
              isActive
                ? "text-stone-900 font-semibold"
                : "text-stone-700 font-medium hover:text-stone-900"
            }`}
            style={{
              paddingInline: "var(--year-btn-px)",
              paddingBlock: "var(--year-btn-py)",
            }}
          >
            Year {y}
          </button>
        );
      })}
    </div>
  );
}
