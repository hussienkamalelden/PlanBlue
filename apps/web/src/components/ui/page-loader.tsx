"use client";

const LOADER_LETTERS = ["p", "l", "a", "n", "b", "l", "u", "e"] as const;

type PageLoaderProps = {
  visible: boolean;
};

export function PageLoader({ visible }: PageLoaderProps) {
  return (
    <div
      className={`pb-loader-wrap${visible ? " pb-loader-wrap--visible" : ""}`}
      aria-hidden={!visible}
      aria-live="polite"
    >
      <div className="pb-preloader">
        <div className="pb-handle-preloader">
          <div className="pb-animation-preloader">
            <div className="pb-spinner" />
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
      </div>
    </div>
  );
}
