"use client";

import React, { useEffect, useState } from "react";
import { Clock, ShoppingBag } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export default function CheckoutPendingPage() {
  const [orderId, setOrderId] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setOrderId(
      params.get("orderId") ||
        localStorage.getItem("cartCheckoutOrderId") ||
        ""
    );

    setOrderNumber(localStorage.getItem("cartCheckoutOrderNumber") || "");
    setStatus(localStorage.getItem("cartCheckoutStatus") || "");
  }, []);

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#15100c]">
      <SiteHeader />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-[760px] border border-[#ddd5c9] bg-white p-10 text-center">
          <Clock className="mx-auto h-14 w-14 text-[#b98262]" />

          <h1 className="mt-6 text-[34px] font-semibold">
            Order Created
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6d6760]">
            Your order has been created, but payment is still pending.
          </p>

          <div className="mt-6 rounded-xl bg-[#fbf8f1] px-5 py-4 text-left text-sm leading-7">
            {orderNumber ? (
              <p>
                <b>Order Number:</b> {orderNumber}
              </p>
            ) : null}

            {orderId ? (
              <p>
                <b>Order ID:</b> {orderId}
              </p>
            ) : null}

            {status ? (
              <p>
                <b>Status:</b> {status}
              </p>
            ) : null}
          </div>

          <p className="mt-6 text-sm leading-6 text-[#6d6760]">
            Backend checkout API currently returns paymentUrl and paymentSessionId as null. Once payment session generation is enabled, this page can redirect to payment automatically.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/orders"
              className="inline-flex h-[48px] items-center justify-center bg-[#111111] px-8 text-[12px] font-bold uppercase tracking-[0.18em] text-white"
            >
              View Orders
            </a>

            <a
              href="/cart"
              className="inline-flex h-[48px] items-center justify-center border border-[#15100c] px-8 text-[12px] font-bold uppercase tracking-[0.18em] text-[#15100c]"
            >
              Back to Cart
            </a>

            <a
              href="/bridesmaid"
              className="inline-flex h-[48px] items-center justify-center border border-[#15100c] px-8 text-[12px] font-bold uppercase tracking-[0.18em] text-[#15100c]"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}