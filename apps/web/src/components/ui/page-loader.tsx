"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

import { HOME_ASSETS } from "@/lib/assets/home";

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
      <Image
        src={HOME_ASSETS.logo}
        alt="PlanBlue"
        width={180}
        height={180}
        priority
        className="h-28 w-auto animate-float-gentle sm:h-32 md:h-36"
      />
    </div>,
    document.body,
  );
}
