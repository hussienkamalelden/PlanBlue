'use client';

import { useEffect, useId, useRef, useState } from 'react';

import type { ShopSort } from '@/lib/shop/filters';

type ShopSortOption = {
  value: ShopSort;
  label: string;
};

type ShopSortDropdownProps = {
  label: string;
  value: ShopSort;
  options: ShopSortOption[];
  onChange: (value: ShopSort) => void;
};

export function ShopSortDropdown({
  label,
  value,
  options,
  onChange,
}: ShopSortDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedLabel =
    options.find((option) => option.value === value)?.label ??
    options[0]?.label ??
    '';

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleSelect(nextValue: ShopSort) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div
      ref={rootRef}
      className={`pb-shop-sort-dropdown${open ? ' is-open' : ''}`}
    >
      <button
        type="button"
        className="pb-shop-sort-dropdown__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="pb-shop-sort-dropdown__label">{label}</span>
        <span className="pb-shop-sort-dropdown__value">
          {selectedLabel}
        </span>
        <span className="pb-shop-sort-dropdown__arrow" aria-hidden="true" />
      </button>

      <ul
        id={listId}
        role="listbox"
        aria-label={label}
        className="pb-shop-sort-dropdown__list"
      >
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <li key={option.label} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`pb-shop-sort-dropdown__option${
                  isSelected ? ' is-selected' : ''
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
