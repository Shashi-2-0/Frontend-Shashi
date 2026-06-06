"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Mail, RefreshCcw, ShieldCheck } from "lucide-react";
import { resendEmailOtp, verifyEmailOtp } from "@/lib/api/auth.api";

export default function VerifyEmailPage() {
  const [form, setForm] = useState({
    email: "",
    otp: "",
  });

  const [state, setState] = useState({
    loading: false,
    sending: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email =
      params.get("email") || sessionStorage.getItem("verifyEmail") || "";

    setForm((prev) => ({
      ...prev,
      email,
    }));
  }, []);

  async function handleResendOtp() {
    if (!form.email.trim()) {
      setState({
        loading: false,
        sending: false,
        error: "Email required hai.",
        success: "",
      });
      return;
    }

    try {
      setState({
        loading: false,
        sending: true,
        error: "",
        success: "",
      });

      const response = await resendEmailOtp({
        email: form.email.trim(),
      });

      setState({
        loading: false,
        sending: false,
        error: "",
        success: response.message || "OTP email par resend ho gaya.",
      });
    } catch (error: any) {
      setState({
        loading: false,
        sending: false,
        error: error?.message || "OTP resend failed.",
        success: "",
      });
    }
  }

  async function handleVerifyEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.email.trim()) {
      setState({
        loading: false,
        sending: false,
        error: "Email required hai.",
        success: "",
      });
      return;
    }

    if (!form.otp.trim()) {
      setState({
        loading: false,
        sending: false,
        error: "OTP required hai.",
        success: "",
      });
      return;
    }

    try {
      setState({
        loading: true,
        sending: false,
        error: "",
        success: "",
      });

      const response = await verifyEmailOtp({
        email: form.email.trim(),
        otp: form.otp.trim(),
      });

      setState({
        loading: false,
        sending: false,
        error: "",
        success: response.message || "Email verified successfully. Login karo.",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 900);
    } catch (error: any) {
      setState({
        loading: false,
        sending: false,
        error: error?.message || "Email OTP verify failed.",
        success: "",
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-4 py-10 text-neutral-950">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[980px] items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-neutral-200 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-neutral-950 p-10 text-white lg:block">
            <div className="flex h-full min-h-[520px] flex-col justify-between">
              <div>
                <div className="inline-flex rounded-full bg-white/10 p-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <h1 className="mt-8 font-serif text-6xl italic leading-none">
                  Verify
                  <br />
                  email.
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
                  Registered email par OTP aayega. OTP verify hone ke baad account activate ho jayega.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white/10 p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                  Backend Endpoint
                </p>

                <p className="mt-3 text-sm leading-6 text-white/75">
                  Resend OTP: /auth/resend-email-otp
                  <br />
                  Verify OTP: /auth/verify-email-otp
                </p>
              </div>
            </div>
          </section>

          <section className="p-6 md:p-8 lg:p-10">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                Email verification
              </p>

              <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                Verify your email
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Email aur OTP enter karo. Agar OTP nahi mila to resend button dabao.
              </p>
            </div>

            {state.error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {state.error}
              </div>
            ) : null}

            {state.success ? (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                {state.success}
              </div>
            ) : null}

            <form onSubmit={handleVerifyEmail} className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Email
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                  <Mail className="h-4 w-4 text-neutral-500" />

                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  OTP
                </span>

                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={form.otp}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      otp: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm tracking-[0.3em] outline-none focus:border-neutral-950"
                  placeholder="123456"
                />
              </label>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={state.sending}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 text-sm font-semibold text-neutral-700 disabled:opacity-60"
              >
                {state.sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}

                {state.sending ? "Resending OTP..." : "Send / Resend OTP"}
              </button>

              <button
                type="submit"
                disabled={state.loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white disabled:opacity-60"
              >
                {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {state.loading ? "Verifying..." : "Verify Email"}
              </button>

              <p className="text-center text-sm text-neutral-500">
                Already verified?{" "}
                <Link href="/login" className="font-semibold text-neutral-950">
                  Login
                </Link>
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}