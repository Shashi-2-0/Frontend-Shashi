"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  getPlacedOrderData,
  placeCheckoutOrder,
} from "@/lib/api/checkout.api";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

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

function formatOrderReference(order: any) {
  return readFirst(order?.orderNumber, order?.orderId, order?.id, "Created");
}

export default function PaymentPage() {
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedClientSecret = localStorage.getItem("checkoutClientSecret") || "";
    const savedPaymentIntentId =
      localStorage.getItem("checkoutPaymentIntentId") || "";
    const savedBillingSameAsShipping =
      localStorage.getItem("checkoutBillingSameAsShipping");

    setClientSecret(savedClientSecret);
    setPaymentIntentId(savedPaymentIntentId);

    if (savedBillingSameAsShipping === "false") {
      setBillingSameAsShipping(false);
    }

    setReady(true);
  }, []);

  const options = useMemo(() => {
    if (!clientSecret) return undefined;

    return {
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#15100c",
          colorBackground: "#ffffff",
          colorText: "#15100c",
          colorDanger: "#d92d20",
          borderRadius: "0px",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        rules: {
          ".Input": {
            border: "1px solid #d6d0c7",
            boxShadow: "none",
          },
          ".Input:focus": {
            border: "1px solid #15100c",
            boxShadow: "none",
          },
          ".Label": {
            color: "#15100c",
            fontSize: "13px",
          },
        },
      },
    };
  }, [clientSecret]);

  if (!ready) {
    return (
      <PaymentShell>
        <div className="mx-auto max-w-[760px] px-6 py-16">
          <div className="h-[420px] animate-pulse bg-[#f1eee9]" />
        </div>
      </PaymentShell>
    );
  }

  if (!stripePublishableKey) {
    return (
      <PaymentShell>
        <PaymentErrorCard
          title="Stripe publishable key missing"
          message="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY .env.local me add karo."
        />
      </PaymentShell>
    );
  }

  if (!clientSecret || !stripePromise || !options) {
    return (
      <PaymentShell>
        <PaymentErrorCard
          title="Payment session missing"
          message="Checkout se payment create nahi hua ya clientSecret localStorage me nahi mila."
          actionLabel="Back to Checkout"
          onAction={() => router.push("/checkout")}
        />
      </PaymentShell>
    );
  }

  return (
    <PaymentShell>
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm
          paymentIntentId={paymentIntentId}
          billingSameAsShipping={billingSameAsShipping}
        />
      </Elements>
    </PaymentShell>
  );
}

function PaymentShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-[#15100c]">
      <header className="border-b border-[#ded8d0] bg-white">
        <div className="mx-auto grid h-[74px] max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center px-6">
          <a
            href="/"
            className="text-[30px] font-semibold uppercase tracking-[0.34em]"
          >
            Shahsi
          </a>

          <h1 className="text-[24px] font-semibold uppercase tracking-[0.12em]">
            Payment
          </h1>

          <div className="justify-self-end">
            <a
              href="/checkout"
              className="inline-flex items-center gap-2 text-[13px] underline underline-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Checkout
            </a>
          </div>
        </div>
      </header>

      {children}
    </main>
  );
}

function PaymentForm({
  paymentIntentId,
  billingSameAsShipping,
}: {
  paymentIntentId: string;
  billingSameAsShipping: boolean;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [submitting, setSubmitting] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orderReference, setOrderReference] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe abhi ready nahi hai.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const submitResult = await elements.submit();

      if (submitResult.error) {
        setError(submitResult.error.message || "Payment details invalid hain.");
        return;
      }

      const confirmResult = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: {
          return_url:
            typeof window !== "undefined"
              ? `${window.location.origin}/payment/success`
              : undefined,
        },
      });

      if (confirmResult.error) {
        setError(confirmResult.error.message || "Payment confirm nahi ho paaya.");
        return;
      }

      const confirmedIntent = confirmResult.paymentIntent;
      const confirmedPaymentIntentId =
        confirmedIntent?.id || paymentIntentId || "";

      const status = confirmedIntent?.status || "";

      const orderAllowedStatuses = [
        "succeeded",
        "processing",
        "requires_capture",
      ];

      if (!orderAllowedStatuses.includes(status)) {
        setError(`Payment status ${status || "unknown"} hai. Order place nahi hua.`);
        return;
      }

      const orderResponse = await placeCheckoutOrder({
        paymentMethod: "CARD",
        paymentIntentId: confirmedPaymentIntentId,
        billingAddressSameAsShipping: billingSameAsShipping,
        confirmAccuracy: true,
      });

      const order = getPlacedOrderData(orderResponse);
      const reference = formatOrderReference(order);

      setOrderReference(reference);
      setSuccess(`Order placed successfully. Order: ${reference}`);

      if (typeof window !== "undefined") {
        localStorage.removeItem("checkoutClientSecret");
        localStorage.removeItem("checkoutPaymentIntentId");
        localStorage.removeItem("checkoutBillingSameAsShipping");

        localStorage.setItem("lastOrderReference", reference);
      }

      setTimeout(() => {
        router.push(`/order-success?order=${encodeURIComponent(reference)}`);
      }, 900);
    } catch (err: any) {
      console.error("Payment submit failed:", err);
      setError(err?.message || "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-[1180px] gap-12 px-6 py-12 lg:grid-cols-[minmax(0,680px)_360px]">
      <div>
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#b98262]">
            Secure Checkout
          </p>

          <h2 className="mt-2 text-[34px] font-semibold tracking-[-0.035em]">
            Complete your payment
          </h2>

          <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-[#6d6760]">
            Card details securely Stripe PaymentElement ke through process honge.
            Payment success ke baad backend order create karega.
          </p>
        </div>

        {error ? (
          <div className="mb-6 flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {success ? (
          <div className="mb-6 flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="border border-[#d8d0c4] bg-white">
          <div className="border-b border-[#ded8d0] px-5 py-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f2e8e4]">
                <CreditCard className="h-5 w-5" />
              </span>

              <div>
                <h3 className="text-[18px] font-semibold">Credit / Debit Card</h3>
                <p className="text-[13px] text-[#6d6760]">
                  Powered by Stripe secure payment intent.
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6">
            <PaymentElement
              onReady={() => setPaymentReady(true)}
              options={{
                layout: "tabs",
              }}
            />
          </div>

          <div className="border-t border-[#ded8d0] px-5 py-5">
            <button
              type="submit"
              disabled={!stripe || !elements || !paymentReady || submitting}
              className="flex h-[58px] w-full items-center justify-center gap-3 bg-[#15100c] text-[13px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:bg-[#9a948c]"
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Lock className="h-5 w-5" />
              )}

              {submitting ? "Processing..." : "Pay & Place Order"}
            </button>

            <p className="mt-4 text-center text-[12px] leading-5 text-[#6d6760]">
              By placing your order, you confirm your cart, color, size, shipping
              and billing details are correct.
            </p>
          </div>
        </form>
      </div>

      <aside className="self-start bg-[#f7f7f7] px-6 py-6">
        <div className="border-t border-[#cfc8bd] pt-5">
          <h3 className="text-[18px] font-semibold uppercase">Payment Status</h3>

          <div className="mt-6 space-y-5">
            <PaymentStatusItem
              active
              icon={<ShieldCheck />}
              title="Payment intent"
              copy={
                paymentIntentId
                  ? `Intent: ${paymentIntentId}`
                  : "Payment intent loaded from checkout session."
              }
            />

            <PaymentStatusItem
              active={paymentReady}
              icon={<CreditCard />}
              title="Card form"
              copy={paymentReady ? "Ready for payment." : "Loading Stripe form..."}
            />

            <PaymentStatusItem
              active={Boolean(orderReference)}
              icon={<CheckCircle2 />}
              title="Order"
              copy={
                orderReference
                  ? `Order ${orderReference} created.`
                  : "Order will be created after payment confirmation."
              }
            />
          </div>

          <div className="mt-8 border-t border-[#cfc8bd] pt-5 text-[13px] leading-6 text-[#6d6760]">
            <p>
              Stripe payment confirm hone ke baad frontend automatically backend
              ka <b>/checkout/place-order</b> call karega.
            </p>
          </div>
        </div>
      </aside>
    </section>
  );
}

function PaymentStatusItem({
  active,
  icon,
  title,
  copy,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={[
          "grid h-10 w-10 shrink-0 place-items-center rounded-full",
          active ? "bg-[#15100c] text-white" : "bg-white text-[#8b867f]",
        ].join(" ")}
      >
        <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      </span>

      <div>
        <h4 className="text-[14px] font-semibold uppercase tracking-[0.12em]">
          {title}
        </h4>
        <p className="mt-1 text-[13px] leading-5 text-[#6d6760]">{copy}</p>
      </div>
    </div>
  );
}

function PaymentErrorCard({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mx-auto max-w-[760px] px-6 py-16">
      <div className="border border-red-200 bg-red-50 px-6 py-8 text-red-700">
        <div className="flex items-start gap-3">
          <XCircle className="mt-1 h-5 w-5 shrink-0" />
          <div>
            <h2 className="text-[22px] font-semibold">{title}</h2>
            <p className="mt-2 text-[15px] leading-6">{message}</p>
          </div>
        </div>

        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="mt-6 inline-flex h-[44px] items-center justify-center bg-[#15100c] px-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-white"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}