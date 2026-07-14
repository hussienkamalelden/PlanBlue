import Image from 'next/image';
import Link from 'next/link';

type NotFoundViewProps = {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
};

export function NotFoundView({
  title,
  description,
  buttonLabel,
  buttonHref,
}: NotFoundViewProps) {
  return (
    <main className="pb-large-container flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Image
        src="/images/global/not_found.png"
        alt=""
        width={480}
        height={320}
        priority
        className="mb-8 h-auto w-full max-w-[300px] md:max-w-[500px]"
        aria-hidden="true"
      />

      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
        {title}
      </h1>

      <p className="mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
        {description}
      </p>

      <Link href={buttonHref} className="pb-theme-btn mt-8">
        {buttonLabel}
      </Link>
    </main>
  );
}
