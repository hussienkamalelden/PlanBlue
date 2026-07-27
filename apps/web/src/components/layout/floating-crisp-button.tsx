'use client';

import { MessagesSquare } from 'lucide-react';

import { isCrispEnabled, openCrispChat } from '@/lib/crisp';
import { useTranslations } from '@/lib/i18n/use-translations';

export function FloatingCrispButton() {
  const t = useTranslations();

  if (!isCrispEnabled()) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={openCrispChat}
      className="pb-floating-btn pb-floating-btn--layer-1 fixed right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1972F5] text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1972F5]"
      aria-label={t.footer.social.chat}
    >
      <MessagesSquare className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
