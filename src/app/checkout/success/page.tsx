"use client";

import React, { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    localStorage.removeItem("cartPaymentClientSecret");
    localStorage.removeItem("cartCheckoutOrderId");

    window.dispatchEvent(new Event("cart-updated"));
  }, []);

  return (
    <main className="min-h-screen bg-[#fbf8f1] text-[#15100c]">
      <SiteHeader />

      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-[760px] border border-[#ddd5c9] bg-white p-10 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />

          <h1 className="mt-6 text-[34px] font-semibold">
            Payment Successful
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6d6760]">
            Your order has been placed successfully. You can check your order details from your account.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/orders"
              className="inline-flex h-[48px] items-center justify-center bg-[#111111] px-8 text-[12px] font-bold uppercase tracking-[0.18em] text-white"
            >
              View Orders
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