type SaleRibbonBadgeProps = {
  discountPercentage: number;
};

export function SaleRibbonBadge({ discountPercentage }: SaleRibbonBadgeProps) {
  return (
    <div
      className="pointer-events-none absolute start-0 top-0 z-10 block h-[110px] w-[110px] overflow-hidden"
      aria-label={`-${discountPercentage}%`}
    >
      <span className="absolute start-[-40px] top-5 block h-[34px] w-[150px] -rotate-45 bg-[#FF0000] text-center text-lg leading-[34px] text-white rtl:rotate-45">
        -{discountPercentage}%
      </span>
    </div>
  );
}
