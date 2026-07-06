"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const LOADER_LETTERS = ["p", "l", "a", "n", "b", "l", "u", "e"] as const;

type PageLoaderProps = {
  visible: boolean;
};

export function PageLoader({ visible }: PageLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex min-h-dvh w-full items-center justify-center bg-[#4389F7] transition-opacity duration-300 ${
        visible
          ? "visible opacity-100"
          : "pointer-events-none invisible opacity-0"
      }`}
      aria-hidden={!visible}
      aria-live="polite"
    >
      <div className="relative z-10 text-center">
        <div className="mx-auto mb-10 h-28 w-28 animate-pb-spinner rounded-full border-[3px] border-white border-t-white/30 sm:h-32 sm:w-32 md:mb-11 md:h-[150px] md:w-[150px]" />

        <div
          dir="ltr"
          className="select-none uppercase tracking-[0.35em] sm:tracking-[0.5em] md:tracking-[0.9em]"
        >
          {LOADER_LETTERS.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="inline-block animate-pb-letter text-[clamp(1.75rem,8vw,4.375rem)] font-medium leading-none text-white"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
