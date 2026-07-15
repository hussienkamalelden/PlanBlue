const LOADER_LETTERS = ['p', 'l', 'a', 'n', 'b', 'l', 'u', 'e'] as const;

export function InitialPageLoader() {
  return (
    <div
      id="planblue-initial-loader"
      className="planblue-initial-loader"
      aria-hidden="true"
    >
      <div className="pb-page-loader__inner" dir="ltr">
        <div className="pb-page-loader__logo-wrap">
          <div
            className="pb-page-loader__shape"
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
    </div>
  );
}
