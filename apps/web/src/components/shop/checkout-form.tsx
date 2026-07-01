"use client";

import Link from "next/link";
import { useState } from "react";

import { createOrder, calculateTotal } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/strapi";
import { useCartStore } from "@/lib/cart/cart-store";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { StrapiExtra, StrapiShipping } from "@/lib/types/strapi";
import { useLocaleStore } from "@/stores/locale-store";

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  governorate?: string;
  address?: string;
};

type OrderStatus = "idle" | "submitting" | "success" | "error";

type CheckoutFormProps = {
  shippingOptions: StrapiShipping[];
  giftWrapping: StrapiExtra | null;
};

export function CheckoutForm({ shippingOptions, giftWrapping }: CheckoutFormProps) {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    shippingId: "",
    address: "",
    promo_code: "",
    extra_notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<OrderStatus>("idle");
  const [orderId, setOrderId] = useState("");
  const [giftWrappingChecked, setGiftWrappingChecked] = useState(false);

  const subtotal = calculateTotal(items);
  const selectedShipping = shippingOptions.find(
    (option) => option.documentId === form.shippingId,
  );
  const shippingCost = Number(selectedShipping?.cost ?? 0);
  const giftWrappingCost =
    giftWrappingChecked && giftWrapping
      ? Number(giftWrapping.cost ?? 0)
      : 0;
  const total = subtotal + shippingCost + giftWrappingCost;

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "shippingId" && errors.governorate) {
      setErrors((prev) => ({ ...prev, governorate: undefined }));
    } else if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = t.checkout.validation.nameRequired;
    if (!form.email.trim()) {
      newErrors.email = t.checkout.validation.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t.checkout.validation.emailInvalid;
    }
    if (!form.phone.trim()) newErrors.phone = t.checkout.validation.phoneRequired;
    if (!form.shippingId) {
      newErrors.governorate = t.checkout.validation.governorateRequired;
    }
    if (!form.address.trim()) newErrors.address = t.checkout.validation.addressRequired;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate() || items.length === 0 || !selectedShipping) return;

    setStatus("submitting");

    try {
      const response = await createOrder(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          governorate: selectedShipping.name,
          shipping_cost: shippingCost,
          gift_wrapping: giftWrappingChecked,
          gift_wrapping_cost: giftWrappingCost,
          address: form.address,
          promo_code: form.promo_code,
          extra_notes: form.extra_notes,
        },
        items,
      );
      setOrderId(response.data.order_id);
      clearCart();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (items.length === 0 && status !== "success") {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-neutral-600">{t.checkout.emptyCart}</p>
        <Link
          href="/cart"
          className="mt-6 inline-flex rounded-lg bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
        >
          {t.checkout.backToCart}
        </Link>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
          <h1 className="text-2xl font-bold text-green-800">
            {t.checkout.success.title}
          </h1>
          <p className="mt-3 text-sm text-green-700">
            {t.checkout.success.message}
          </p>
          <p className="mt-4 text-sm font-medium text-green-900">
            {t.checkout.success.orderId}: <span className="font-mono">{orderId}</span>
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex rounded-lg bg-green-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-800"
          >
            {t.checkout.success.backToHome}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-neutral-900">{t.checkout.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">{t.checkout.subtitle}</p>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <span className="text-2xl">🔋</span>
        <p className="text-sm font-medium text-blue-800">
          {t.checkout.giftBanner}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-neutral-900">
              {t.checkout.paymentMethod}
            </h2>
            <div className="flex items-center gap-3 rounded-lg border-2 border-neutral-900 bg-neutral-50 p-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-neutral-900">
                <div className="h-2.5 w-2.5 rounded-full bg-neutral-900" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {t.checkout.cashOnDelivery}
                </p>
                <p className="text-xs text-neutral-500">
                  {t.checkout.cashOnDeliveryDesc}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput
                label={t.checkout.form.name}
                placeholder={t.checkout.form.namePlaceholder}
                value={form.name}
                onChange={(v) => updateField("name", v)}
                error={errors.name}
                required
              />
              <FieldInput
                label={t.checkout.form.email}
                placeholder={t.checkout.form.emailPlaceholder}
                type="email"
                value={form.email}
                onChange={(v) => updateField("email", v)}
                error={errors.email}
                required
              />
              <FieldInput
                label={t.checkout.form.phone}
                placeholder={t.checkout.form.phonePlaceholder}
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(v) => updateField("phone", v.replace(/[^0-9]/g, ""))}
                error={errors.phone}
                required
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {t.checkout.form.governorate} <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.shippingId}
                  onChange={(e) => updateField("shippingId", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    errors.governorate
                      ? "border-red-400 bg-red-50"
                      : "border-neutral-200 bg-white hover:border-neutral-300 focus:border-neutral-900"
                  } focus:outline-none focus:ring-1 focus:ring-neutral-900`}
                >
                  <option value="">{t.checkout.form.governoratePlaceholder}</option>
                  {shippingOptions.map((option) => (
                    <option key={option.documentId} value={option.documentId}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {errors.governorate && (
                  <p className="mt-1 text-xs text-red-600">{errors.governorate}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {t.checkout.form.address} <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder={t.checkout.form.addressPlaceholder}
                  className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    errors.address
                      ? "border-red-400 bg-red-50"
                      : "border-neutral-200 bg-white hover:border-neutral-300 focus:border-neutral-900"
                  } focus:outline-none focus:ring-1 focus:ring-neutral-900`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                )}
              </div>
              <FieldInput
                label={t.checkout.form.promoCode}
                placeholder={t.checkout.form.promoCodePlaceholder}
                value={form.promo_code}
                onChange={(v) => updateField("promo_code", v)}
              />
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {t.checkout.form.extraNotes}
                </label>
                <textarea
                  rows={2}
                  value={form.extra_notes}
                  onChange={(e) => updateField("extra_notes", e.target.value)}
                  placeholder={t.checkout.form.extraNotesPlaceholder}
                  className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
              {giftWrapping && (
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 transition-colors hover:border-neutral-300">
                    <input
                      type="checkbox"
                      checked={giftWrappingChecked}
                      onChange={(e) => setGiftWrappingChecked(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span className="text-sm text-neutral-700">
                      <span className="font-medium text-neutral-900">
                        {t.checkout.giftWrapping}
                      </span>
                      <span className="mt-0.5 block text-neutral-500">
                        {t.checkout.giftWrappingDesc}{" "}
                        {formatPrice(Number(giftWrapping.cost), locale)}
                      </span>
                    </span>
                  </label>
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              {t.checkout.orderSummary}
            </h2>

            <ul className="mt-4 divide-y divide-neutral-100">
              {items.map((item) => {
                const unitPrice =
                  item.has_sale && item.discountPrice !== null
                    ? item.discountPrice
                    : item.price;

                return (
                  <li
                    key={item.documentId}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{item.title}</p>
                      <p className="text-xs text-neutral-500">
                        {item.quantity} × {formatPrice(unitPrice, locale)}
                      </p>
                    </div>
                    <p className="font-medium text-neutral-900">
                      {formatPrice(unitPrice * item.quantity, locale)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 border-t border-neutral-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">
                  {t.checkout.subtotal} ({items.length} {t.checkout.items})
                </span>
                <span className="font-medium text-neutral-900">
                  {formatPrice(subtotal, locale)}
                </span>
              </div>
              {selectedShipping && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-600">
                    {t.checkout.shipping} ({selectedShipping.name})
                  </span>
                  <span className="font-medium text-neutral-900">
                    {formatPrice(shippingCost, locale)}
                  </span>
                </div>
              )}
              {giftWrappingChecked && giftWrappingCost > 0 && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-600">{t.checkout.giftWrapping}</span>
                  <span className="font-medium text-neutral-900">
                    {formatPrice(giftWrappingCost, locale)}
                  </span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between text-base font-bold">
                <span>{t.checkout.total}</span>
                <span>{formatPrice(total, locale)}</span>
              </div>
            </div>

            {status === "error" && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-800">
                  {t.checkout.error.title}
                </p>
                <p className="text-xs text-red-700">{t.checkout.error.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-6 w-full rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              {status === "submitting" ? t.checkout.placing : t.checkout.placeOrder}
            </button>
          </div>
        </aside>
      </form>
    </main>
  );
}

function FieldInput({
  label,
  placeholder,
  type = "text",
  inputMode,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  placeholder: string;
  type?: string;
  inputMode?: "numeric" | "text" | "email" | "tel";
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors ${
          error
            ? "border-red-400 bg-red-50"
            : "border-neutral-200 bg-white hover:border-neutral-300 focus:border-neutral-900"
        } focus:outline-none focus:ring-1 focus:ring-neutral-900`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
