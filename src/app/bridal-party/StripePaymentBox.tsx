"use client";

import React, { useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripe || !elements) {
      setMessage("Stripe abhi ready nahi hai.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bridal-party?payment=success`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        setMessage(result.error.message || "Payment failed.");
        return;
      }

      setMessage("Payment successful.");
      onSuccess();
    } catch (error: any) {
      setMessage(error?.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {message ? (
        <p className="rounded-2xl bg-[#fbfaf6] px-4 py-3 text-sm text-neutral-700">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Processing..." : "Complete Payment"}
      </button>
    </form>
  );
}

export default function StripePaymentBox({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string;
  onSuccess: () => void;
}) {
  if (!clientSecret) return null;

  return (
    <div className="mt-5 rounded-[24px] border border-neutral-200 bg-white p-5">
      <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-neutral-400">
        Secure Stripe Payment
      </p>

      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: "stripe",
          },
        }}
      >
        <CheckoutForm onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}