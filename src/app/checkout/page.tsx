"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import type { CartItem } from "@/lib/api/cart.api";
import {
  applyCheckoutPromoCode,
  removeCheckoutPromoCode,
  createCheckoutPaymentIntent,
  getCheckoutClientSecret,
  getCheckoutPaymentIntentId,
  getCheckoutRedirectUrl,
  getCheckoutSession,
  getPlacedOrderData,
  placeCheckoutOrder,
  saveCheckoutBillingAddress,
  saveCheckoutContact,
  saveCheckoutShippingAddress,
  saveCheckoutShippingMethod,
  unwrapCheckoutItems,
  unwrapCheckoutPaymentMethods,
  unwrapCheckoutSession,
  unwrapCheckoutShippingMethods,
  unwrapCheckoutTotals,
} from "@/lib/api/checkout.api";

type CheckoutStep = "information" | "shipping" | "payment";

type ShippingAddress = {
  country: string;
  countryCode: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  phoneCountryCode: string;
  phone: string;
};

type ShippingOption = {
  id: string;
  label: string;
  name?: string;
  description?: string;
  price?: number | string;
  amount?: number | string;
  total?: number | string;
  estimatedArrivalText?: string;
  time?: string;
  available?: boolean;
};

type PaymentOption = {
  id: string;
  label: string;
  provider?: string;
  text?: string;
  available?: boolean;
};

const emptyAddress: ShippingAddress = {
  country: "United States",
  countryCode: "US",
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  stateCode: "",
  postalCode: "",
  phoneCountryCode: "+1",
  phone: "",
};

function readFirst(...values: any[]) {
  for (const value of values) {
    if (value === undefined || value === null) continue;

    const text = String(value).trim();

    if (!text) continue;
    if (text.toLowerCase() === "null") continue;
    if (text.toLowerCase() === "undefined") continue;

    return text;
  }

  return "";
}

function numberValue(value: any) {
  const numeric = Number(value || 0);
  return Number.isNaN(numeric) ? 0 : numeric;
}

function formatMoney(value: any, currency = "USD") {
  const numeric = Number(value || 0);

  if (currency === "INR") {
    return `₹${numeric.toLocaleString("en-IN")}`;
  }

  return `$${numeric.toLocaleString("en-US")}`;
}

function getItemProduct(item: any) {
  return item?.product || item?.catalogProduct || item?.item?.product || {};
}

function getItemVariant(item: any) {
  return (
    item?.variant ||
    item?.productVariant ||
    item?.selectedVariant ||
    item?.item?.variant ||
    {}
  );
}

function getCartItemId(item: any) {
  return readFirst(item?.id, item?.cartItemId, item?.itemId);
}

function getCartItemTitle(item: any) {
  const product = getItemProduct(item);

  return readFirst(
    item?.title,
    item?.name,
    product?.title,
    product?.name,
    "Product"
  );
}

function getCartItemImage(item: any) {
  const product = getItemProduct(item);
  const images = product?.images || item?.images;

  if (Array.isArray(images) && images.length) {
    const first = images[0];

    if (typeof first === "string") return first;

    return readFirst(first?.url, first?.src, first?.imageUrl);
  }

  return readFirst(
    item?.imageUrl,
    item?.image,
    item?.thumbnail,
    product?.imageUrl,
    product?.image,
    product?.thumbnail
  );
}

function getCartItemColor(item: any) {
  const variant = getItemVariant(item);
  const product = getItemProduct(item);

  return readFirst(
    item?.color,
    item?.dressColor,
    variant?.color,
    product?.color,
    product?.primaryColor,
    product?.variantColor
  );
}

function getCartItemSize(item: any) {
  const variant = getItemVariant(item);

  return readFirst(item?.size, item?.sizeLabel, variant?.size);
}

function getCartItemFabric(item: any) {
  const product = getItemProduct(item);

  return readFirst(item?.fabric, product?.fabric, product?.material);
}

function getCartItemQuantity(item: any) {
  return Math.max(1, Number(item?.quantity || item?.qty || 1));
}

function getCartItemUnitPrice(item: any) {
  const product = getItemProduct(item);
  const variant = getItemVariant(item);

  return numberValue(
    item?.unitPrice ||
      item?.price ||
      variant?.price ||
      product?.price ||
      product?.listingPrice
  );
}

function getCartItemLineTotal(item: any) {
  const qty = getCartItemQuantity(item);
  const unit = getCartItemUnitPrice(item);

  return numberValue(
    item?.lineTotal ||
      item?.total ||
      item?.subtotal ||
      item?.amount ||
      unit * qty
  );
}

function normalizeShippingMethods(methods: any[]): ShippingOption[] {
  return methods
    .map((item: any) => ({
      id: readFirst(item?.id, item?.value, item?.code, item?.label).toUpperCase(),
      label: readFirst(item?.label, item?.name, item?.id, item?.code),
      name: readFirst(item?.name),
      description: readFirst(item?.description),
      price: item?.price,
      amount: item?.amount,
      total: item?.total,
      estimatedArrivalText: readFirst(
        item?.estimatedArrivalText,
        item?.description,
        item?.time
      ),
      time: readFirst(item?.time),
      available: typeof item?.available === "boolean" ? item.available : true,
    }))
    .filter((item) => item.id && item.label);
}

function normalizePaymentMethods(methods: any[]): PaymentOption[] {
  return methods
    .map((item: any) => ({
      id: readFirst(item?.id, item?.provider, item?.value, item?.text).toUpperCase(),
      label: readFirst(item?.label, item?.text, item?.provider, item?.id),
      provider: readFirst(item?.provider),
      text: readFirst(item?.text),
      available: typeof item?.available === "boolean" ? item.available : true,
    }))
    .filter((item) => item.id && item.label);
}

function buildBackendAddress(address: ShippingAddress) {
  return {
    country: address.country || "United States",
    countryCode: address.countryCode || "US",
    firstName: address.firstName,
    lastName: address.lastName,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    city: address.city,
    state: address.state,
    stateCode: address.stateCode || address.state,
    postalCode: address.postalCode,
    phoneCountryCode: address.phoneCountryCode || "+1",
    phone: address.phone,
  };
}

function readSessionContact(session: any) {
  return session?.contact || session?.checkout?.contact || {};
}

function readSessionShippingAddress(session: any) {
  return session?.shippingAddress || session?.checkout?.shippingAddress || {};
}

function readBillingSameAsShipping(session: any) {
  if (typeof session?.billingAddressSameAsShipping === "boolean") {
    return session.billingAddressSameAsShipping;
  }

  if (typeof session?.billingSameAsShipping === "boolean") {
    return session.billingSameAsShipping;
  }

  if (typeof session?.sameAsShipping === "boolean") {
    return session.sameAsShipping;
  }

  return true;
}

export default function CheckoutPage() {
  const router = useRouter();

  const [step, setStep] = useState<CheckoutStep>("information");
  const [checkoutSession, setCheckoutSession] = useState<any>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(emptyAddress);
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  async function refreshCheckoutSession() {
    const response = await getCheckoutSession();
    const session = unwrapCheckoutSession(response);
    const checkoutItems = unwrapCheckoutItems(session);
    const backendShippingMethods = normalizeShippingMethods(
      unwrapCheckoutShippingMethods(session)
    );
    const backendPaymentMethods = normalizePaymentMethods(
      unwrapCheckoutPaymentMethods(session)
    );

    setCheckoutSession(session);
    setItems(checkoutItems);
    setShippingOptions(backendShippingMethods);
    setPaymentOptions(backendPaymentMethods);

    const contact = readSessionContact(session);
    const backendAddress = readSessionShippingAddress(session);

    if (contact?.email) setEmail(String(contact.email));
    if (typeof contact?.emailOffers === "boolean") setNewsletter(contact.emailOffers);
    if (typeof contact?.smsOffers === "boolean") setSmsUpdates(contact.smsOffers);

    if (backendAddress && Object.keys(backendAddress).length) {
      setShippingAddress((prev) => ({
        ...prev,
        country: readFirst(backendAddress.country, prev.country, "United States"),
        countryCode: readFirst(backendAddress.countryCode, prev.countryCode, "US"),
        firstName: readFirst(backendAddress.firstName, prev.firstName),
        lastName: readFirst(backendAddress.lastName, prev.lastName),
        addressLine1: readFirst(backendAddress.addressLine1, prev.addressLine1),
        addressLine2: readFirst(backendAddress.addressLine2, prev.addressLine2),
        city: readFirst(backendAddress.city, prev.city),
        state: readFirst(backendAddress.state, prev.state),
        stateCode: readFirst(backendAddress.stateCode, prev.stateCode),
        postalCode: readFirst(
          backendAddress.postalCode,
          backendAddress.zip,
          prev.postalCode
        ),
        phoneCountryCode: readFirst(
          backendAddress.phoneCountryCode,
          prev.phoneCountryCode,
          "+1"
        ),
        phone: readFirst(backendAddress.phone, prev.phone),
      }));
    }

    setBillingSameAsShipping(readBillingSameAsShipping(session));

    const selectedBackendShipping =
      session?.selectedShippingMethod ||
      session?.selectedShippingMethodId ||
      session?.shippingMethodId ||
      session?.shippingMethod ||
      backendShippingMethods[0]?.id ||
      "";

    const selectedBackendPayment =
      session?.selectedPaymentMethod ||
      session?.paymentMethod ||
      backendPaymentMethods[0]?.id ||
      "";

    if (selectedBackendShipping) {
      setSelectedShippingMethod(String(selectedBackendShipping).toUpperCase());
    }

    if (selectedBackendPayment) {
      setSelectedPaymentMethod(String(selectedBackendPayment).toUpperCase());
    }

    if (session?.promoCode) {
      setPromoCode(String(session.promoCode));
    }

    return session;
  }

  useEffect(() => {
    let mounted = true;

    async function loadCheckoutData() {
      try {
        setLoading(true);
        setError("");

        await refreshCheckoutSession();
      } catch (err: any) {
        console.error("Checkout session load failed:", err);

        if (!mounted) return;

        setError(err?.message || "Checkout session load failed.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCheckoutData();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const backendTotals = unwrapCheckoutTotals(checkoutSession);

    const computedSubtotal = items.reduce((sum, item) => {
      return sum + getCartItemLineTotal(item);
    }, 0);

    const subtotal = Number(backendTotals.subtotal || computedSubtotal || 0);
    const shipping = Number(backendTotals.shipping || 0);
    const tax = Number(backendTotals.tax || 0);
    const discount = Number(backendTotals.discount || 0);
    const total = Number(
      backendTotals.total || Math.max(0, subtotal + shipping + tax - discount)
    );

    return {
      subtotal,
      shipping,
      tax,
      discount,
      total,
      currency: backendTotals.currency || "USD",
    };
  }, [checkoutSession, items]);

  const selectedShipping = useMemo(() => {
    return (
      shippingOptions.find((item) => item.id === selectedShippingMethod) ||
      shippingOptions[0] ||
      null
    );
  }, [shippingOptions, selectedShippingMethod]);

  function updateAddressField(key: keyof ShippingAddress, value: string) {
    setShippingAddress((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function validateInformationStep() {
    if (!email.trim()) {
      setError("Email address required hai.");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Valid email address enter karo.");
      return false;
    }

    const requiredFields: Array<keyof ShippingAddress> = [
      "firstName",
      "lastName",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "country",
      "phone",
    ];

    const missingField = requiredFields.find((field) => {
      return !shippingAddress[field]?.trim();
    });

    if (missingField) {
      setError("Shipping address complete karo.");
      return false;
    }

    setError("");
    return true;
  }

  async function handleContinueToShipping() {
    try {
      if (!validateInformationStep()) return;

      setCheckoutLoading(true);
      setError("");
      setCheckoutMessage("");

      await saveCheckoutContact({
        email: email.trim(),
        emailOffers: newsletter,
        smsOffers: smsUpdates,
      });

      await saveCheckoutShippingAddress(buildBackendAddress(shippingAddress));

      await refreshCheckoutSession();

      setStep("shipping");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Save checkout information failed:", err);
      setError(err?.message || "Information save nahi ho paayi.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleContinueToPayment() {
    try {
      if (!selectedShippingMethod) {
        setError("Shipping method backend se select nahi ho raha.");
        return;
      }

      setCheckoutLoading(true);
      setError("");
      setCheckoutMessage("");

      await saveCheckoutShippingMethod({
        shippingMethodId: selectedShippingMethod,
      });

      await refreshCheckoutSession();

      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Save shipping method failed:", err);
      setError(err?.message || "Shipping method save nahi ho paaya.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleApplyPromoCode() {
    try {
      if (!promoCode.trim()) {
        setError("Promo code enter karo.");
        return;
      }

      setCheckoutLoading(true);
      setError("");
      setCheckoutMessage("");

      await applyCheckoutPromoCode({
        promoCode: promoCode.trim(),
      });

      await refreshCheckoutSession();
      setCheckoutMessage("Promo code applied.");
    } catch (err: any) {
      console.error("Apply promo failed:", err);
      setError(err?.message || "Promo code apply nahi ho paaya.");
    } finally {
      setCheckoutLoading(false);
    }
  }


  async function handleRemovePromoCode() {
  try {
    setCheckoutLoading(true);
    setError("");
    setCheckoutMessage("");

    await removeCheckoutPromoCode();

    setPromoCode("");
    await refreshCheckoutSession();

    setCheckoutMessage("Promo code removed.");
  } catch (err: any) {
    console.error("Remove promo failed:", err);
    setError(err?.message || "Promo code remove nahi ho paaya.");
  } finally {
    setCheckoutLoading(false);
  }
}

  async function handlePlaceOrder() {
    try {
      if (!validateInformationStep()) {
        setStep("information");
        return;
      }

      if (!items.length) {
        setError("Cart empty hai. Pehle product add karo.");
        return;
      }

      if (!selectedPaymentMethod) {
        setError("Payment method select karo.");
        return;
      }

      setCheckoutLoading(true);
      setError("");
      setCheckoutMessage("");

      await saveCheckoutBillingAddress({
        sameAsShipping: billingSameAsShipping,
        billingAddress: billingSameAsShipping
          ? undefined
          : buildBackendAddress(shippingAddress),
      });

      const paymentIntentResponse = await createCheckoutPaymentIntent({
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        billingAddressSameAsShipping: billingSameAsShipping,
      });

      const redirectUrl = getCheckoutRedirectUrl(paymentIntentResponse);
      const clientSecret = getCheckoutClientSecret(paymentIntentResponse);
      const paymentIntentId = getCheckoutPaymentIntentId(paymentIntentResponse);

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      if (clientSecret) {
  if (typeof window !== "undefined") {
    localStorage.setItem("checkoutClientSecret", clientSecret);
    localStorage.setItem(
      "checkoutBillingSameAsShipping",
      String(billingSameAsShipping)
    );

    if (paymentIntentId) {
      localStorage.setItem("checkoutPaymentIntentId", paymentIntentId);
    }
  }

  router.push("/payment");
  return;
}

      const orderResponse = await placeCheckoutOrder({
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        paymentIntentId,
        billingAddressSameAsShipping: billingSameAsShipping,
        confirmAccuracy: true,
      });

      const order = getPlacedOrderData(orderResponse);

      if (order?.orderId || order?.orderNumber || order?.id) {
        setCheckoutMessage(
          `Order created successfully. Order: ${
            order?.orderNumber || order?.orderId || order?.id
          }`
        );
        return;
      }

      setCheckoutMessage("Order placed, but backend response me order id nahi mila.");
    } catch (err: any) {
      console.error("Checkout place order failed:", err);
      setError(err?.message || "Checkout failed.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white text-[#111]">
        <CheckoutHeader />

        <div className="mx-auto grid max-w-[1180px] gap-12 px-6 py-16 lg:grid-cols-[minmax(0,640px)_420px]">
          <div className="space-y-5">
            <div className="h-8 w-56 animate-pulse bg-[#eee]" />
            <div className="h-[56px] animate-pulse bg-[#eee]" />
            <div className="h-[220px] animate-pulse bg-[#eee]" />
          </div>

          <div className="h-[360px] animate-pulse bg-[#f2f2f2]" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#111]">
      <CheckoutHeader />

      <section className="mx-auto grid max-w-[1180px] gap-12 px-6 py-12 lg:grid-cols-[minmax(0,640px)_420px] lg:items-start">
        <div>
          <CheckoutSteps step={step} setStep={setStep} />

          {error ? (
            <div className="mb-6 flex items-center gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <XCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {checkoutMessage ? (
            <div className="mb-6 flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {checkoutMessage}
            </div>
          ) : null}

          {!items.length ? (
            <div className="border border-[#ddd] px-6 py-10">
              <h2 className="text-[24px] font-semibold">Your cart is empty</h2>
              <p className="mt-2 text-sm text-[#666]">
                Checkout continue karne ke liye pehle product add karo.
              </p>

              <a
                href="/bridesmaid"
                className="mt-6 inline-flex h-[46px] items-center justify-center bg-[#111] px-7 text-[12px] font-semibold uppercase tracking-[0.18em] text-white"
              >
                Continue Shopping
              </a>
            </div>
          ) : (
            <>
              {step === "information" ? (
                <InformationStep
                  email={email}
                  setEmail={setEmail}
                  newsletter={newsletter}
                  setNewsletter={setNewsletter}
                  smsUpdates={smsUpdates}
                  setSmsUpdates={setSmsUpdates}
                  shippingAddress={shippingAddress}
                  updateAddressField={updateAddressField}
                  checkoutLoading={checkoutLoading}
                  onContinue={handleContinueToShipping}
                />
              ) : null}

              {step === "shipping" ? (
                <ShippingStep
                  email={email}
                  shippingAddress={shippingAddress}
                  shippingOptions={shippingOptions}
                  selectedShippingMethod={selectedShippingMethod}
                  setSelectedShippingMethod={setSelectedShippingMethod}
                  currency={totals.currency}
                  checkoutLoading={checkoutLoading}
                  onBack={() => setStep("information")}
                  onContinue={handleContinueToPayment}
                />
              ) : null}

              {step === "payment" ? (
                <PaymentStep
                  email={email}
                  shippingAddress={shippingAddress}
                  selectedShipping={selectedShipping}
                  paymentOptions={paymentOptions}
                  selectedPaymentMethod={selectedPaymentMethod}
                  setSelectedPaymentMethod={setSelectedPaymentMethod}
                  billingSameAsShipping={billingSameAsShipping}
                  setBillingSameAsShipping={setBillingSameAsShipping}
                  checkoutLoading={checkoutLoading}
                  onBack={() => setStep("shipping")}
                  onPlaceOrder={handlePlaceOrder}
                />
              ) : null}
            </>
          )}
        </div>

      <OrderSummary
  items={items}
  totals={totals}
  promoOpen={promoOpen}
  setPromoOpen={setPromoOpen}
  promoCode={promoCode}
  setPromoCode={setPromoCode}
  onApplyPromoCode={handleApplyPromoCode}
  onRemovePromoCode={handleRemovePromoCode}
  checkoutLoading={checkoutLoading}
/>
      </section>
    </main>
  );
}

function CheckoutHeader() {
  return (
    <header className="border-b border-[#ddd] bg-white">
      <div className="mx-auto grid h-[72px] max-w-[1280px] grid-cols-[1fr_auto_1fr] items-center px-6">
        <a href="/" className="text-[34px] font-semibold uppercase tracking-[0.38em]">
          Shahsi
        </a>

        <h1 className="text-[28px] font-semibold uppercase tracking-[0.08em]">
          Checkout
        </h1>

        <div />
      </div>
    </header>
  );
}

function CheckoutSteps({
  step,
  setStep,
}: {
  step: CheckoutStep;
  setStep: (step: CheckoutStep) => void;
}) {
  const steps: CheckoutStep[] = ["information", "shipping", "payment"];

  return (
    <div className="mb-10 flex items-center gap-3 text-[15px]">
      <a href="/cart" className="text-[#555] hover:text-[#111]">
        Cart
      </a>

      {steps.map((item) => {
        const active = step === item;

        return (
          <React.Fragment key={item}>
            <ChevronRight className="h-4 w-4 text-[#999]" />

            <button
              type="button"
              onClick={() => setStep(item)}
              className={[
                "capitalize",
                active ? "font-semibold text-[#111]" : "text-[#888]",
              ].join(" ")}
            >
              {item}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function InformationStep({
  email,
  setEmail,
  newsletter,
  setNewsletter,
  smsUpdates,
  setSmsUpdates,
  shippingAddress,
  updateAddressField,
  checkoutLoading,
  onContinue,
}: {
  email: string;
  setEmail: (value: string) => void;
  newsletter: boolean;
  setNewsletter: (value: boolean) => void;
  smsUpdates: boolean;
  setSmsUpdates: (value: boolean) => void;
  shippingAddress: ShippingAddress;
  updateAddressField: (key: keyof ShippingAddress, value: string) => void;
  checkoutLoading: boolean;
  onContinue: () => void;
}) {
  return (
    <div>
      <ExpressCheckout />

      <SectionTitle>Contact</SectionTitle>

      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email Address"
        className="h-[58px] w-full border border-[#d4d4d4] px-4 text-[16px] outline-none focus:border-[#111]"
      />

      <label className="mt-4 flex cursor-pointer items-center gap-3 text-[15px]">
        <input
          type="checkbox"
          checked={newsletter}
          onChange={(event) => setNewsletter(event.target.checked)}
          className="h-4 w-4 accent-[#111]"
        />
        Email me with news and offers
      </label>

      <div className="mt-5 flex items-center gap-3 text-[15px]">
        <span className="grid h-5 w-5 place-items-center rounded-full border border-[#111] text-[12px]">
          8
        </span>
        <span>
          <button type="button" className="underline underline-offset-2">
            Sign in
          </button>{" "}
          for faster check out
        </span>
      </div>

      <SectionTitle className="mt-9">Shipping Address</SectionTitle>

      <p className="mb-4 text-[15px]">
        Country/Region:
        <span className="ml-2 font-medium">{shippingAddress.country}</span>
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <CheckoutInput
          value={shippingAddress.firstName}
          placeholder="First Name"
          onChange={(value) => updateAddressField("firstName", value)}
        />

        <CheckoutInput
          value={shippingAddress.lastName}
          placeholder="Last Name"
          onChange={(value) => updateAddressField("lastName", value)}
        />
      </div>

      <div className="mt-4 space-y-4">
        <CheckoutInput
          value={shippingAddress.addressLine1}
          placeholder="Address Line 1"
          onChange={(value) => updateAddressField("addressLine1", value)}
        />

        <CheckoutInput
          value={shippingAddress.addressLine2}
          placeholder="Apt #, Suite, Floor (Optional)"
          onChange={(value) => updateAddressField("addressLine2", value)}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <CheckoutInput
            value={shippingAddress.state}
            placeholder="State/Province/Region"
            onChange={(value) => {
              updateAddressField("state", value);
              updateAddressField("stateCode", value);
            }}
          />

          <CheckoutInput
            value={shippingAddress.city}
            placeholder="City"
            onChange={(value) => updateAddressField("city", value)}
          />

          <CheckoutInput
            value={shippingAddress.postalCode}
            placeholder="ZIP/Post Code"
            onChange={(value) => updateAddressField("postalCode", value)}
          />
        </div>

        <CheckoutInput
          value={shippingAddress.phone}
          placeholder="Phone Number"
          onChange={(value) => updateAddressField("phone", value)}
        />
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-3 text-[15px]">
        <input
          type="checkbox"
          checked={smsUpdates}
          onChange={(event) => setSmsUpdates(event.target.checked)}
          className="h-4 w-4 accent-[#111]"
        />
        Send me updates, news and offers via text message*
      </label>

      <div className="mt-12 flex items-center justify-between">
        <a href="/cart" className="inline-flex items-center gap-2 text-[16px]">
          <ArrowLeft className="h-4 w-4" />
          Return To Cart
        </a>

        <button
          type="button"
          onClick={onContinue}
          disabled={checkoutLoading}
          className="flex h-[58px] items-center justify-center gap-3 bg-[#111] px-10 text-[15px] font-semibold uppercase text-white transition hover:bg-[#333] disabled:bg-[#999]"
        >
          {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {checkoutLoading ? "Saving..." : "Continue to Shipping"}
        </button>
      </div>
    </div>
  );
}

function ShippingStep({
  email,
  shippingAddress,
  shippingOptions,
  selectedShippingMethod,
  setSelectedShippingMethod,
  currency,
  checkoutLoading,
  onBack,
  onContinue,
}: {
  email: string;
  shippingAddress: ShippingAddress;
  shippingOptions: ShippingOption[];
  selectedShippingMethod: string;
  setSelectedShippingMethod: (value: string) => void;
  currency: string;
  checkoutLoading: boolean;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <ReviewBlock title="Contact" value={email} actionLabel="Change" onAction={onBack} />

      <ReviewBlock
        title="Shipping Address"
        value={`${shippingAddress.firstName} ${shippingAddress.lastName}\n${shippingAddress.addressLine1}\n${
          shippingAddress.addressLine2 ? `${shippingAddress.addressLine2}\n` : ""
        }${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.postalCode}\n${shippingAddress.country}\n${shippingAddress.phone}`}
        actionLabel="Change"
        onAction={onBack}
      />

      <SectionTitle className="mt-9">Shipping Method</SectionTitle>

      {!shippingOptions.length ? (
        <div className="border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          Shipping methods backend se nahi aa rahe. Backend GET /checkout/session
          response me shippingMethods bhejna hoga.
        </div>
      ) : (
        <div className="overflow-hidden border border-[#ccc]">
          {shippingOptions.map((option) => {
            const active = selectedShippingMethod === option.id;
            const price = numberValue(option.price ?? option.amount ?? option.total);

            return (
              <button
                key={option.id}
                type="button"
                disabled={option.available === false}
                onClick={() => setSelectedShippingMethod(option.id)}
                className={[
                  "flex w-full items-start justify-between border-b border-[#ddd] px-5 py-5 text-left last:border-b-0 disabled:opacity-50",
                  active ? "bg-[#f7f7f7]" : "bg-white",
                ].join(" ")}
              >
                <span className="flex gap-4">
                  <span
                    className={[
                      "mt-1 h-5 w-5 rounded-full border",
                      active ? "border-[#111] bg-[#111]" : "border-[#ccc]",
                    ].join(" ")}
                  />

                  <span>
                    <span className="block text-[16px] font-medium">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-[14px] text-[#555]">
                      {option.estimatedArrivalText || option.time || option.description}
                    </span>
                  </span>
                </span>

                <span className="text-[16px] font-semibold">
                  {price > 0 ? formatMoney(price, currency) : "FREE"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-12 flex items-center justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-[16px]">
          <ArrowLeft className="h-4 w-4" />
          Return To Information
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={checkoutLoading}
          className="flex h-[58px] items-center justify-center gap-3 bg-[#111] px-10 text-[15px] font-semibold uppercase text-white transition hover:bg-[#333] disabled:bg-[#999]"
        >
          {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {checkoutLoading ? "Saving..." : "Continue to Payment"}
        </button>
      </div>
    </div>
  );
}

function PaymentStep({
  email,
  shippingAddress,
  selectedShipping,
  paymentOptions,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  billingSameAsShipping,
  setBillingSameAsShipping,
  checkoutLoading,
  onBack,
  onPlaceOrder,
}: {
  email: string;
  shippingAddress: ShippingAddress;
  selectedShipping: ShippingOption | null;
  paymentOptions: PaymentOption[];
  selectedPaymentMethod: string;
  setSelectedPaymentMethod: (value: string) => void;
  billingSameAsShipping: boolean;
  setBillingSameAsShipping: (value: boolean) => void;
  checkoutLoading: boolean;
  onBack: () => void;
  onPlaceOrder: () => void;
}) {
  return (
    <div>
      <ReviewBlock title="Contact" value={email} actionLabel="Change" onAction={onBack} />

      <ReviewBlock
        title="Shipping Address"
        value={`${shippingAddress.firstName} ${shippingAddress.lastName}\n${shippingAddress.addressLine1}\n${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.postalCode}\n${shippingAddress.country}\n${shippingAddress.phone}`}
        actionLabel="Change"
        onAction={onBack}
      />

      <ReviewBlock
        title="Shipping Method"
        value={
          selectedShipping
            ? `${selectedShipping.label}, ${selectedShipping.estimatedArrivalText || selectedShipping.time || ""}`
            : "Not selected"
        }
        actionLabel="Change"
        onAction={onBack}
      />

      <SectionTitle className="mt-9">Payment and Billing</SectionTitle>

      {!paymentOptions.length ? (
        <div className="border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          Payment methods backend se nahi aa rahe. Backend GET /checkout/session
          response me paymentMethods bhejna hoga.
        </div>
      ) : (
        <div className="overflow-hidden border border-[#ccc]">
          {paymentOptions.map((option) => {
            const active = selectedPaymentMethod === option.id;

            return (
              <button
                key={option.id}
                type="button"
                disabled={option.available === false}
                onClick={() => setSelectedPaymentMethod(option.id)}
                className={[
                  "flex w-full items-center gap-4 border-b border-[#ddd] px-5 py-4 text-left last:border-b-0 disabled:opacity-50",
                  active ? "bg-[#f7f7f7]" : "bg-white",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-5 w-5 rounded-full border",
                    active ? "border-[#111] bg-[#111]" : "border-[#ccc]",
                  ].join(" ")}
                />

                <CreditCard className="h-5 w-5" />
                <span className="text-[15px] font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <SectionTitle className="mt-9">Billing Address</SectionTitle>

      <div className="overflow-hidden border border-[#ccc]">
        <label className="flex cursor-pointer items-center gap-4 border-b border-[#ddd] px-5 py-4">
          <input
            type="radio"
            checked={billingSameAsShipping}
            onChange={() => setBillingSameAsShipping(true)}
            className="h-4 w-4 accent-[#111]"
          />
          Same as shipping address
        </label>

        <label className="flex cursor-pointer items-center gap-4 px-5 py-4">
          <input
            type="radio"
            checked={!billingSameAsShipping}
            onChange={() => setBillingSameAsShipping(false)}
            className="h-4 w-4 accent-[#111]"
          />
          Use a different billing address
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 bg-[#f7f7f7] px-4 py-4 text-[14px]">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-[#111]" defaultChecked />
        <span>
          I confirm my order details are correct, and I have read and agree to the
          return policy.
        </span>
      </label>

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={checkoutLoading}
        className="mt-6 flex h-[58px] w-full items-center justify-center gap-3 bg-[#111] text-[15px] font-semibold uppercase text-white transition hover:bg-[#333] disabled:bg-[#999]"
      >
        {checkoutLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
        {checkoutLoading ? "Creating Order..." : "Place My Order"}
      </button>

      <p className="mt-5 text-[13px] leading-5">
        By placing my order, I agree to Shahsi's terms of use, privacy policy and
        financial incentive notice.
      </p>
    </div>
  );
}

function OrderSummary({
  items,
  totals,
  promoOpen,
  setPromoOpen,
  promoCode,
  setPromoCode,
  onApplyPromoCode,
  onRemovePromoCode,
  checkoutLoading,
}: {
  items: CartItem[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  promoOpen: boolean;
  setPromoOpen: (value: boolean) => void;
  promoCode: string;
  setPromoCode: (value: string) => void;
  onApplyPromoCode: () => void;
  onRemovePromoCode: () => void;
  checkoutLoading: boolean;
}) {
  return (
    <aside className="sticky top-8 self-start bg-[#f7f7f7] px-7 py-7">
      <div className="border-t border-[#ccc] pt-5">
        <h2 className="mb-5 text-[20px] font-semibold uppercase">Order Summary</h2>

        <div className="space-y-5">
          {items.map((item, index) => {
            const image = getCartItemImage(item);
            const title = getCartItemTitle(item);
            const color = getCartItemColor(item);
            const size = getCartItemSize(item);
            const fabric = getCartItemFabric(item);
            const qty = getCartItemQuantity(item);
            const price = getCartItemLineTotal(item);

            return (
              <div key={getCartItemId(item) || index} className="flex gap-4">
                <div className="relative h-[82px] w-[70px] shrink-0 bg-white">
                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.18em] text-[#999]">
                      No Image
                    </div>
                  )}

                  <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#111] text-[12px] text-white">
                    {qty}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-4">
                    <h3 className="line-clamp-2 text-[15px] font-medium leading-5">
                      {title}
                    </h3>

                    <p className="shrink-0 text-[15px] font-semibold">
                      {formatMoney(price, totals.currency)}
                    </p>
                  </div>

                  <p className="mt-1 text-[13px] text-[#555]">
                    {[color, fabric, size ? `Size: ${size}` : ""]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-9 space-y-3 text-[16px]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <strong>{formatMoney(totals.subtotal, totals.currency)}</strong>
          </div>

          {totals.discount > 0 ? (
            <div className="flex justify-between">
              <span>Discount</span>
              <strong>-{formatMoney(totals.discount, totals.currency)}</strong>
            </div>
          ) : null}

          <div className="flex justify-between">
            <span>Shipping</span>
            <strong>
              {totals.shipping > 0
                ? formatMoney(totals.shipping, totals.currency)
                : "FREE"}
            </strong>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <strong>{formatMoney(totals.tax, totals.currency)}</strong>
          </div>

          <div className="flex justify-between pt-2 text-[24px]">
            <span>Total</span>
            <strong>{formatMoney(totals.total, totals.currency)}</strong>
          </div>
        </div>

        <div className="mt-10 border-t border-[#ccc] pt-6">
          <button
            type="button"
            onClick={() => setPromoOpen(!promoOpen)}
            className="flex w-full items-center justify-between text-[15px] font-semibold uppercase"
          >
            Promo Code
            <Plus className="h-5 w-5" />
          </button>

          {totals.discount > 0 ? (
  <button
    type="button"
    onClick={onRemovePromoCode}
    disabled={checkoutLoading}
    className="h-[44px] border border-[#111] bg-white px-4 text-[12px] font-semibold uppercase text-[#111] disabled:opacity-60"
  >
    Remove
  </button>
) : (
  <button
    type="button"
    onClick={onApplyPromoCode}
    disabled={checkoutLoading}
    className="h-[44px] bg-[#111] px-4 text-[12px] font-semibold uppercase text-white disabled:opacity-60"
  >
    Apply
  </button>
)}
        </div>

        <div className="mt-8 flex items-center gap-3 text-[13px] text-[#555]">
          <ShieldCheck className="h-5 w-5" />
          Secure checkout powered by backend payment flow.
        </div>
      </div>
    </aside>
  );
}

function ExpressCheckout() {
  return (
    <div className="mb-9">
      <p className="mb-4 text-center text-[15px] font-semibold text-[#999]">
        Express Checkout
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <button className="h-[48px] rounded bg-[#ffc439] text-[18px] font-bold text-[#003087]">
          PayPal
        </button>

        <button className="h-[48px] rounded border border-[#aaa] text-[18px] font-semibold">
          Apple Pay
        </button>

        <button className="h-[48px] rounded bg-[#111] text-[18px] font-semibold text-white">
          G Pay
        </button>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <span className="h-px flex-1 bg-[#ddd]" />
        <span className="text-[#999]">OR</span>
        <span className="h-px flex-1 bg-[#ddd]" />
      </div>
    </div>
  );
}

function ReviewBlock({
  title,
  value,
  actionLabel,
  onAction,
}: {
  title: string;
  value: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="mb-8 grid grid-cols-[1fr_auto] gap-4">
      <div>
        <h2 className="text-[22px] font-semibold uppercase">{title}</h2>
        <p className="mt-3 whitespace-pre-line text-[16px] leading-6">{value}</p>
      </div>

      <button
        type="button"
        onClick={onAction}
        className="text-[15px] underline underline-offset-2"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`mb-4 text-[22px] font-semibold uppercase ${className}`}>
      {children}
    </h2>
  );
}

function CheckoutInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-[58px] w-full border border-[#d4d4d4] px-4 text-[16px] outline-none focus:border-[#111]"
    />
  );
}