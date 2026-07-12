"use client";

import Link from "next/link";
import { useState } from "react";

import {
  CartItemValidationMessages,
  CheckoutBlockedNotice,
  CheckoutFloatingSpinner,
} from "@/components/shop/cart-validation-messages";
import { CheckoutConfirmModal } from "@/components/shop/checkout-confirm-modal";
import { ShopPageShell } from "@/components/shop/shop-page-shell";
import { createOrder, calculateTotal, validatePromoCode } from "@/lib/api/orders";
import { formatPrice } from "@/lib/api/strapi";
import { useCartStore } from "@/lib/cart/cart-store";
import { useCartItemImages } from "@/lib/cart/use-cart-item-images";
import { useCartValidation } from "@/lib/cart/use-cart-validation";
import { getItemValidation } from "@/lib/cart/validate-cart";
import { useTranslations } from "@/lib/i18n/use-translations";
import type { StrapiShipping } from "@/lib/types/strapi";
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
};

export function CheckoutForm({ shippingOptions }: CheckoutFormProps) {
  const t = useTranslations();
  const locale = useLocaleStore((state) => state.locale);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  useCartItemImages();
  const hasBatteryItems = items.some((item) => item.need_batteries === true);
  const {
    status: cartValidationStatus,
    validation,
    isBlocked: isCartBlocked,
    validateNow,
  } = useCartValidation();

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

  const [promoStatus, setPromoStatus] = useState<
    "idle" | "validating" | "valid" | "invalid"
  >("idle");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [submitRecheck, setSubmitRecheck] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isValidatingCart, setIsValidatingCart] = useState(false);

  const subtotal = calculateTotal(items);
  const discountAmount =
    promoStatus === "valid" ? Number(((subtotal * promoDiscount) / 100).toFixed(2)) : 0;
  const selectedShipping = shippingOptions.find(
    (option) => option.documentId === form.shippingId,
  );
  const shippingCost = Number(selectedShipping?.cost ?? 0);
  const total = subtotal - discountAmount + shippingCost;

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "shippingId" && errors.governorate) {
      setErrors((prev) => ({ ...prev, governorate: undefined }));
    } else if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (field === "promo_code") {
      setPromoStatus("idle");
      setPromoDiscount(0);
      setPromoError("");
    }
  }

  async function handleApplyPromo() {
    const code = form.promo_code.trim();
    if (!code) return;

    setPromoStatus("validating");
    setPromoError("");

    const result = await validatePromoCode(code);

    if (result.valid) {
      setPromoStatus("valid");
      setPromoDiscount(result.discount_percentage);
    } else {
      setPromoStatus("invalid");
      setPromoDiscount(0);
      setPromoError(result.message ?? t.checkout.promoInvalid);
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

  async function handleReviewOrder(e: React.FormEvent) {
    e.preventDefault();

    if (!validate() || items.length === 0 || !selectedShipping) {
      return;
    }

    setSubmitRecheck(true);
    setIsValidatingCart(true);

    try {
      const cartResult = await validateNow();

      if (!cartResult?.valid) {
        document
          .getElementById("checkout-cart-validation")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      setConfirmModalOpen(true);
    } finally {
      setIsValidatingCart(false);
    }
  }

  async function handleConfirmOrder() {
    if (!selectedShipping || items.length === 0) {
      return;
    }

    setSubmitRecheck(true);
    setIsValidatingCart(true);

    try {
      const cartResult = await validateNow();

      if (!cartResult?.valid) {
        setConfirmModalOpen(false);
        document
          .getElementById("checkout-cart-validation")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      setStatus("submitting");

      const response = await createOrder(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          governorate: selectedShipping.name,
          shipping_cost: shippingCost,
          gift_wrapping: false,
          gift_wrapping_cost: 0,
          address: form.address,
          promo_code: promoStatus === "valid" ? form.promo_code.trim() : "",
          promo_discount_percentage: promoStatus === "valid" ? promoDiscount : 0,
          discount_amount: discountAmount,
          extra_notes: form.extra_notes,
        },
        items,
      );
      setConfirmModalOpen(false);
      setOrderId(response.data.order_id);
      clearCart();
      setStatus("success");
    } catch {
      setConfirmModalOpen(false);
      setStatus("error");
    } finally {
      setIsValidatingCart(false);
    }
  }

  if (items.length === 0 && status !== "success") {
    return (
      <ShopPageShell
        bannerSrc="/images/checkout/banner.png"
        mainClassName="relative pb-medium-container py-10"
      >
        <section className="pb-checkout-section mt-10">
          <div className="pb-cart-empty">
            <p>{t.checkout.emptyCart}</p>
            <Link
              href="/cart"
              className="pb-cart-summary__btn pb-cart-summary__btn--primary"
            >
              {t.checkout.backToCart}
            </Link>
          </div>
        </section>
      </ShopPageShell>
    );
  }

  if (status === "success") {
    return (
      <ShopPageShell
        bannerSrc="/images/checkout/banner.png"
        mainClassName="relative pb-medium-container flex min-h-[50vh] flex-col items-center justify-center py-10"
      >
        <div className="pb-checkout-success">
          <h1 className="pb-checkout-success__title">
            {t.checkout.success.title}
          </h1>
          <p className="pb-checkout-success__message">
            {t.checkout.success.message}
          </p>
          <p className="pb-checkout-success__order">
            {t.checkout.success.orderId}:{" "}
            <span className="pb-checkout-success__order-id">{orderId}</span>
          </p>
          <Link
            href="/"
            className="pb-cart-summary__btn pb-cart-summary__btn--primary"
          >
            {t.checkout.success.backToHome}
          </Link>
        </div>
      </ShopPageShell>
    );
  }

  const isCheckingCart = cartValidationStatus === "loading";
  const isPlacingOrder = status === "submitting";
  const isBusy = isValidatingCart || isPlacingOrder;
  const isCheckoutDisabled = isBusy || (isCheckingCart && !submitRecheck);

  return (
    <ShopPageShell bannerSrc="/images/checkout/banner.png">
      {isBusy && (
        <CheckoutFloatingSpinner label={t.checkout.cartValidation.checking} />
      )}

      <CheckoutConfirmModal
        open={confirmModalOpen}
        onClose={() => {
          if (!isBusy) {
            setConfirmModalOpen(false);
          }
        }}
        onConfirm={handleConfirmOrder}
        isConfirming={isBusy}
        locale={locale}
        t={t}
        customer={{
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          governorate: selectedShipping?.name ?? "",
          address: form.address.trim(),
          extraNotes: form.extra_notes,
        }}
        items={items}
        promoDiscount={promoDiscount}
        discountAmount={discountAmount}
        shippingCost={shippingCost}
        shippingName={selectedShipping?.name ?? ""}
        subtotal={subtotal}
        total={total}
      />

      <section className="pb-checkout-section mt-10">
        <CheckoutBlockedNotice
          status={cartValidationStatus}
          validation={validation}
          submitRecheck={submitRecheck}
        />

        {(isCartBlocked || (submitRecheck && validation && !validation.valid)) &&
          cartValidationStatus === "ready" && (
          <Link
            href="/cart"
            className="pb-checkout-back-link pb-cart-summary__btn pb-cart-summary__btn--secondary"
          >
            {t.checkout.backToCart}
          </Link>
        )}

        <form onSubmit={handleReviewOrder} className="pb-cart-layout">
          <div className="pb-checkout-main">
            <section className="pb-checkout-panel">
              <div className="pb-checkout-fields">
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
                <div
                  className={`pb-checkout-field${errors.governorate ? " pb-checkout-field--error" : ""}`}
                >
                  <label>
                    {t.checkout.form.governorate}{" "}
                    <span className="pb-checkout-field__required">*</span>
                  </label>
                  <select
                    value={form.shippingId}
                    onChange={(e) => updateField("shippingId", e.target.value)}
                  >
                    <option value="">{t.checkout.form.governoratePlaceholder}</option>
                    {shippingOptions.map((option) => (
                      <option key={option.documentId} value={option.documentId}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {errors.governorate && (
                    <p className="pb-checkout-field__error">{errors.governorate}</p>
                  )}
                </div>
                <div
                  className={`pb-checkout-field pb-checkout-field--wide${errors.address ? " pb-checkout-field--error" : ""}`}
                >
                  <label>
                    {t.checkout.form.address}{" "}
                    <span className="pb-checkout-field__required">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder={t.checkout.form.addressPlaceholder}
                  />
                  {errors.address && (
                    <p className="pb-checkout-field__error">{errors.address}</p>
                  )}
                </div>
                <div className="pb-checkout-field pb-checkout-field--wide">
                  <label>{t.checkout.form.extraNotes}</label>
                  <textarea
                    rows={2}
                    value={form.extra_notes}
                    onChange={(e) => updateField("extra_notes", e.target.value)}
                    placeholder={t.checkout.form.extraNotesPlaceholder}
                  />
                </div>
              </div>
            </section>
          </div>

          <aside
            className={`pb-cart-summary${isCartBlocked ? " pb-cart-summary--blocked" : ""}`}
          >
            <h2 className="pb-checkout-summary__title">
              {t.checkout.orderDetails}
            </h2>

            <div className="pb-checkout-summary__payment">
              <span className="pb-checkout-summary__payment-label">
                {t.checkout.paymentMethod}
              </span>
              <span className="pb-checkout-summary__payment-value">
                {t.checkout.cashOnDelivery}
              </span>
            </div>

            <ul className="pb-checkout-summary__items">
              {items.map((item) => {
                const unitPrice =
                  item.has_sale && item.discountPrice !== null
                    ? item.discountPrice
                    : item.price;
                const hasIssue =
                  getItemValidation(validation, item.documentId)?.valid === false;

                return (
                  <li
                    key={item.documentId}
                    className={`pb-checkout-summary__item${
                      hasIssue ? " pb-checkout-summary__item--issue" : ""
                    }`}
                  >
                    <div className="pb-checkout-summary__item-row">
                      <div className="pb-checkout-summary__item-info">
                        <p className="pb-checkout-summary__item-name">{item.title}</p>
                        <p className="pb-checkout-summary__item-meta">
                          {item.quantity} × {formatPrice(unitPrice, locale)}
                        </p>
                      </div>
                      <p className="pb-checkout-summary__item-price">
                        {formatPrice(unitPrice * item.quantity, locale)}
                      </p>
                    </div>
                    <CartItemValidationMessages
                      documentId={item.documentId}
                      item={item}
                      validation={validation}
                      locale={locale}
                    />
                  </li>
                );
              })}
            </ul>

            <div className="pb-checkout-perks">
              <p className="pb-checkout-perks__title">
                {t.checkout.perksCongratulations}
              </p>
              <p className="pb-checkout-perks__message">
                {t.checkout.perksMessagePrefix}{" "}
                <strong>{t.checkout.perksGiftHighlight}</strong>
                {hasBatteryItems && (
                  <>
                    {" "}
                    {t.checkout.perksMessageJoin}{" "}
                    <strong>{t.checkout.perksBatteriesHighlight}</strong>
                  </>
                )}{" "}
                {t.checkout.perksMessageSuffix}
              </p>
            </div>

            <div className="pb-checkout-promo">
              <label>{t.checkout.form.promoCode}</label>
              <div className="pb-checkout-promo__row">
                <input
                  type="text"
                  value={form.promo_code}
                  onChange={(e) => updateField("promo_code", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyPromo();
                    }
                  }}
                  placeholder={t.checkout.form.promoCodePlaceholder}
                  className={
                    promoStatus === "invalid"
                      ? "pb-checkout-promo__input--invalid"
                      : promoStatus === "valid"
                        ? "pb-checkout-promo__input--valid"
                        : undefined
                  }
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={
                    !form.promo_code.trim() || promoStatus === "validating"
                  }
                  className="pb-checkout-promo__apply"
                >
                  {promoStatus === "validating"
                    ? "..."
                    : t.checkout.promoApply}
                </button>
              </div>
              {promoStatus === "valid" && (
                <p className="pb-checkout-promo__hint pb-checkout-promo__hint--valid">
                  {t.checkout.promoApplied} ({promoDiscount}% {t.checkout.promoOff})
                </p>
              )}
              {promoStatus === "invalid" && promoError && (
                <p className="pb-checkout-promo__hint pb-checkout-promo__hint--invalid">
                  {promoError}
                </p>
              )}
            </div>

            <div className="pb-checkout-totals">
              <div className="pb-checkout-totals__row">
                <span className="pb-checkout-totals__label">
                  {t.checkout.subtotal} ({items.length} {t.checkout.items})
                </span>
                <span className="pb-checkout-totals__value">
                  {formatPrice(subtotal, locale)}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="pb-checkout-totals__row pb-checkout-totals__row--discount">
                  <span className="pb-checkout-totals__label">
                    {t.checkout.discount} ({promoDiscount}%)
                  </span>
                  <span className="pb-checkout-totals__value">
                    -{formatPrice(discountAmount, locale)}
                  </span>
                </div>
              )}
              {selectedShipping && (
                <div className="pb-checkout-totals__row">
                  <span className="pb-checkout-totals__label">
                    {t.checkout.shipping} ({selectedShipping.name})
                  </span>
                  <span className="pb-checkout-totals__value">
                    {formatPrice(shippingCost, locale)}
                  </span>
                </div>
              )}
              <div className="pb-checkout-totals__total">
                <span>{t.checkout.total}</span>
                <span>{formatPrice(total, locale)}</span>
              </div>
            </div>

            {status === "error" && (
              <div className="pb-checkout-error">
                <p className="pb-checkout-error__title">
                  {t.checkout.error.title}
                </p>
                <p className="pb-checkout-error__message">
                  {t.checkout.error.message}
                </p>
              </div>
            )}

            <div className="pb-cart-summary__actions">
              <button
                type="submit"
                disabled={isCheckoutDisabled}
                className={`pb-cart-summary__btn pb-cart-summary__btn--primary${
                  isCheckoutDisabled ? " pb-cart-summary__btn--disabled" : ""
                }`}
              >
                {t.checkout.checkout}
              </button>
            </div>
          </aside>
        </form>
      </section>
    </ShopPageShell>
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
    <div className={`pb-checkout-field${error ? " pb-checkout-field--error" : ""}`}>
      <label>
        {label}{" "}
        {required && <span className="pb-checkout-field__required">*</span>}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <p className="pb-checkout-field__error">{error}</p>}
    </div>
  );
}
