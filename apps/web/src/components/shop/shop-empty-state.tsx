import Image from 'next/image';

type ShopEmptyStateProps = {
  message: string;
};

export function ShopEmptyState({ message }: ShopEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center">
      <Image
        src="/images/shop/not_found.png"
        alt=""
        width={280}
        height={280}
        className="mb-6 h-auto w-full max-w-[350px]"
        aria-hidden="true"
      />
      <p className="max-w-md text-base font-medium text-neutral-600 sm:text-lg">
        {message}
      </p>
    </div>
  );
}
