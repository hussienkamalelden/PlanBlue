const LOADER_LETTERS = ['p', 'l', 'a', 'n', 'b', 'l', 'u', 'e'] as const;

export function InitialPageLoader() {
  return (
    <div
      id="planblue-initial-loader"
      className="planblue-initial-loader"
      aria-hidden="true"
    >
      <div className="relative z-10 text-center" dir="ltr">
        <div className="relative mx-auto mb-8 w-fit md:mb-10">
          <div
            className="pointer-events-none absolute -top-10 left-1/2 z-0 h-[190px] w-[280px] -translate-x-1/2 bg-contain bg-no-repeat"
            style={{
              backgroundImage: "url('/images/home/shapes/shape-7.png')",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/layout/logo_solid.png"
            alt=""
            width={180}
            height={180}
            className="relative z-10 mx-auto h-24 w-auto animate-float-gentle sm:h-28 md:h-32"
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
    </div>
  );
}
