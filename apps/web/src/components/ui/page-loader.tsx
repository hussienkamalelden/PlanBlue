'use client';

import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

import { HOME_ASSETS } from '@/lib/assets/home';

const LOADER_LETTERS = ['p', 'l', 'a', 'n', 'b', 'l', 'u', 'e'] as const;

type PageLoaderProps = {
  visible: boolean;
};

export function PageLoader({ visible }: PageLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex min-h-dvh w-full items-center justify-center bg-[#4389F7] transition-opacity duration-300 ${
        visible
          ? 'visible opacity-100'
          : 'pointer-events-none invisible opacity-0'
      }`}
      aria-hidden={!visible}
      aria-live="polite"
    >
      <div className="relative z-10 text-center">
        <div
          className="absolute inset-0 left-1/2 -top-10 z-0 h-[190px] w-[280px] -translate-x-1/2  bg-contain bg-no-repeat"
          style={{ backgroundImage: `url(${HOME_ASSETS.shapes.anim7})` }}
        />
        <Image
          src={HOME_ASSETS.logoSolid}
          alt="PlanBlue"
          width={180}
          height={180}
          priority
          className="mx-auto mb-8 h-24 w-auto animate-float-gentle sm:h-28 md:mb-10 md:h-32"
        />

        <div dir="ltr" className="pb-txt-loading">
          {LOADER_LETTERS.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              data-text-preloader={letter}
              className="pb-letters-loading"
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
