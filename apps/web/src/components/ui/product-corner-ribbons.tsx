const RIBBON_ROTATE_CLASS =
  'absolute flex h-[25px] items-center justify-center -rotate-45 font-semibold text-white whitespace-nowrap rtl:rotate-45';

type ProductCornerRibbonsProps = {
  salePercentage?: number;
  batteryLabel?: string;
  showSale?: boolean;
  showBattery?: boolean;
};

export function ProductCornerRibbons({
  salePercentage,
  batteryLabel,
  showSale = false,
  showBattery = false,
}: ProductCornerRibbonsProps) {
  const hasBattery = showBattery && Boolean(batteryLabel);

  if (!showSale && !hasBattery) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute start-0 top-0 z-10 overflow-hidden ${
        hasBattery ? 'h-[170px] w-[150px]' : 'h-[110px] w-[110px]'
      }`}
    >
      {showSale && salePercentage != null && salePercentage > 0 && (
        <span
          className={`${RIBBON_ROTATE_CLASS} start-[-40px] top-5 w-[150px] bg-[#FF0000] text-lg`}
          aria-label={`-${salePercentage}%`}
        >
          -{salePercentage}%
        </span>
      )}

      {hasBattery && (
        <span
          className={`${RIBBON_ROTATE_CLASS} start-[-50px] top-[2.3rem] w-[210px] bg-brand-primary text-sm `}
          aria-label={batteryLabel}
        >
          {batteryLabel}
        </span>
      )}
    </div>
  );
}
