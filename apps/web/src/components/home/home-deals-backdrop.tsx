import { HOME_ASSETS } from '@/lib/assets/home';

export function HomeDealsBackdrop() {
  const shapes = HOME_ASSETS.shapes;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      dir="ltr"
      aria-hidden="true"
    >
      <div
        className="absolute left-1/4 top-0 hidden h-[187px] w-[85px] bg-contain bg-no-repeat md:block"
        style={{ backgroundImage: `url(${shapes.dealShapeTop})` }}
      />

      <div
        className="pb-float-bob-y absolute bottom-16 left-0 hidden h-[163px] w-[135px] bg-contain bg-no-repeat lg:block"
        style={{ backgroundImage: `url(${shapes.dealShapeLeft})` }}
      />

      <div
        className="pb-float-bob-x absolute right-[18%] top-[100px] hidden h-[364px] w-[286px] bg-contain bg-no-repeat xl:block"
        style={{ backgroundImage: `url(${shapes.dealShapeRight})` }}
      />

      <div
        className="absolute inset-x-0 top-0 h-[76px] bg-repeat-x opacity-80"
        style={{ backgroundImage: `url(${shapes.dealPatternTop})` }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-[76px] bg-repeat-x opacity-80"
        style={{ backgroundImage: `url(${shapes.dealPatternBottom})` }}
      />
    </div>
  );
}
