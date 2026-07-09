const RIBBON_ROTATE_CLASS =
  'absolute flex h-[25px] items-center justify-center -rotate-45 font-semibold text-white whitespace-nowrap';

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
      dir="ltr"
      className={`pointer-events-none absolute left-0 top-0 z-10 overflow-hidden ${
        hasBattery ? 'h-[170px] w-[150px]' : 'h-[110px] w-[110px]'
      }`}
    >
      {showSale && salePercentage != null && salePercentage > 0 && (
        <span
          className={`${RIBBON_ROTATE_CLASS} left-[-50px] top-3 w-[150px] bg-[#FF0000] text-base opacity-100`}
          aria-label={`-${salePercentage}%`}
        >
          -{salePercentage}%
        </span>
      )}

      {hasBattery && (
        <span
          className={`${RIBBON_ROTATE_CLASS} left-[-60px] top-[1.7rem] w-[210px] bg-[#2f74e1] text-sm opacity-100`}
          aria-label={batteryLabel}
        >
          {batteryLabel}
        </span>
      )}
    </div>
  );
}
