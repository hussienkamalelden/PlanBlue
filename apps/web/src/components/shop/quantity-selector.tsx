"use client";

type QuantitySelectorProps = {
  quantity: number;
  stockQuantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  label: string;
};

export function QuantitySelector({
  quantity,
  stockQuantity,
  onIncrement,
  onDecrement,
  label,
}: QuantitySelectorProps) {
  const canDecrement = quantity > 1;
  const canIncrement = stockQuantity > 0;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-neutral-700">{label}</span>

      <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-white">
        <button
          type="button"
          onClick={onDecrement}
          disabled={!canDecrement}
          aria-label="Decrease quantity"
          className="px-3 py-2 text-lg font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>

        <span
          className="min-w-[3rem] border-x border-neutral-200 px-3 py-2 text-center text-sm font-semibold tabular-nums"
          aria-live="polite"
        >
          {quantity}
        </span>

        <button
          type="button"
          onClick={onIncrement}
          disabled={!canIncrement}
          aria-label="Increase quantity"
          className="px-3 py-2 text-lg font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
