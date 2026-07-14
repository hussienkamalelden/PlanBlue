'use client';

import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

import { HOME_ASSETS } from '@/lib/assets/home';
import { markPageLoaderHydrated } from '@/lib/ui/page-loader';

const LOADER_LETTERS = ['p', 'l', 'a', 'n', 'b', 'l', 'u', 'e'] as const;

type PageLoaderProps = {
  visible: boolean;
};

export function PageLoader({ visible }: PageLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    markPageLoaderHydrated();
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex min-h-dvh w-full items-center justify-center bg-[#4389F7] transition-opacity duration-300 ${
        visible ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
      }`}
      aria-hidden={!visible}
      aria-live="polite"
    >
      <div className="pb-page-loader__inner" dir="ltr">
        <div className="pb-page-loader__logo-wrap">
          <div
            className="pb-page-loader__shape"
            style={{ backgroundImage: `url(${HOME_ASSETS.shapes.anim7})` }}
            aria-hidden="true"
          />
          <Image
            src={HOME_ASSETS.logoSolid}
            alt="PlanBlue"
            width={180}
            height={180}
            priority
            className="pb-page-loader__logo animate-float-gentle"
          />
        </div>

        <div className="pb-txt-loading">
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
