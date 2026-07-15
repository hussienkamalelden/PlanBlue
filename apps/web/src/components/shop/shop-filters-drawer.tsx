'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ShopFiltersDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  doneLabel: string;
  children: ReactNode;
};

export function ShopFiltersDrawer({
  open,
  onClose,
  title,
  closeLabel,
  doneLabel,
  children,
}: ShopFiltersDrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="pb-shop-filters-drawer" role="presentation">
      <button
        type="button"
        className="pb-shop-filters-drawer__backdrop"
        aria-label={closeLabel}
        onClick={onClose}
      />

      <div
        className="pb-shop-filters-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="pb-shop-filters-drawer__header">
          <h2 className="pb-shop-filters-drawer__title">{title}</h2>
          <button
            type="button"
            className="pb-shop-filters-drawer__close"
            onClick={onClose}
            aria-label={closeLabel}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="pb-shop-filters-drawer__body">{children}</div>

        <div className="pb-shop-filters-drawer__footer">
          <button
            type="button"
            className="pb-shop-filters-drawer__done"
            onClick={onClose}
          >
            {doneLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
