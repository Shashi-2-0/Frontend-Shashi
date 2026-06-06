"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import { forgotPassword } from "@/lib/api/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setState({
        loading: false,
        error: "Email required hai.",
        success: "",
      });
      return;
    }

    try {
      setState({
        loading: true,
        error: "",
        success: "",
      });

      const response = await forgotPassword({
        email: email.trim().toLowerCase(),
      });

      console.log("FORGOT PASSWORD RESPONSE:", response);

      sessionStorage.setItem("resetEmail", email.trim().toLowerCase());

      setState({
        loading: false,
        error: "",
        success:
          response?.message ||
          "Password reset link/token email par send ho gaya. Email check karo.",
      });
    } catch (error: any) {
      setState({
        loading: false,
        error: error?.message || "Forgot password request failed.",
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
                  Reset
                  <br />
                  access.
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
                  Registered email enter karo. Password reset token/link email
                  par aayega.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white/10 p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                  Backend Endpoint
                </p>

                <p className="mt-3 text-sm leading-6 text-white/75">
                  POST /auth/forgot-password
                </p>
              </div>
            </div>
          </section>

          <section className="p-6 md:p-8 lg:p-10">
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Forgot password
            </p>

            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Recover your account
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Apna registered email enter karo. Reset token/link email par
              receive hoga.
            </p>

            {state.error ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {state.error}
              </div>
            ) : null}

            {state.success ? (
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-700">
                {state.success}
                <div className="mt-4">
                  <Link
                    href="/reset-password"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-neutral-950 px-5 text-xs font-semibold text-white"
                  >
                    Go to Reset Password
                  </Link>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Email
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                  <Mail className="h-4 w-4 text-neutral-500" />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={state.loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white disabled:opacity-60"
              >
                {state.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {state.loading ? "Sending..." : "Send Reset Link"}
                {!state.loading ? <ArrowRight className="h-4 w-4" /> : null}
              </button>

              <p className="text-center text-sm text-neutral-500">
                Remember password?{" "}
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