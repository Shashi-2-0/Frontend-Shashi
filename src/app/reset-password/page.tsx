"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { resetPassword } from "@/lib/api/account.api";
import { useToast } from "@/components/ui/AppToast";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    const urlToken =
      searchParams.get("token") ||
      searchParams.get("resetToken") ||
      searchParams.get("reset_token") ||
      "";

    if (urlToken) {
      setToken(urlToken);

      // URL se token hide karne ke liye.
      // User ko address bar me bhi token nahi dikhega after page load.
      router.replace("/reset-password");
    }
  }, [searchParams, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setState({
        loading: true,
        error: "",
        success: "",
      });

      if (!token.trim()) {
        throw new Error(
          "Reset link is invalid or expired. Please request a new reset link.",
        );
      }

      if (!newPassword.trim()) {
        throw new Error("Please enter a new password.");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("New password and confirm password do not match.");
      }

      await resetPassword({
        token: token.trim(),
        newPassword: newPassword.trim(),
      });

      toast.success(
        "Password reset successful",
        "You can now login with your new password.",
      );

      setState({
        loading: false,
        error: "",
        success: "Password reset successful. Please login now.",
      });

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/account");
      }, 1200);
    } catch (error: any) {
      const message = error?.message || "Unable to reset password.";

      toast.error("Reset failed", message);

      setState({
        loading: false,
        error: message,
        success: "",
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <section className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden border-r border-neutral-200 bg-neutral-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-2xl font-semibold tracking-tight">Shahsi</p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/50">
              Secure account recovery
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">
              Reset password
            </p>
            <h1 className="mt-4 max-w-xl text-6xl font-medium leading-[0.95] tracking-tight">
              Create a new secure password.
            </h1>
            <p className="mt-5 max-w-lg leading-7 text-white/65">
              Your reset link is verified securely in the background. The token
              is not shown on the page.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <ShieldCheck className="h-5 w-5" />
              Secure reset link verification
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <LockKeyhole className="h-5 w-5" />
              Token hidden from the form
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-2xl">
            <a
              href="/account"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to account
            </a>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 sm:p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                Reset Password
              </p>

              <h1 className="mt-5 text-5xl font-semibold tracking-tight">
                Set new password
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-neutral-600">
                Enter your new password below. Your reset token is verified
                securely in the background.
              </p>

              {!token ? (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  Reset token not found. Please open the latest reset password
                  link from your email.
                </div>
              ) : null}

              {state.error ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {state.error}
                </div>
              ) : null}

              {state.success ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                  {state.success}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
                    New Password
                  </label>

                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Enter new password"
                      className="h-16 w-full rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6] pl-14 pr-14 text-base outline-none transition focus:border-neutral-950"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-950"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm new password"
                      className="h-16 w-full rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6] pl-14 pr-5 text-base outline-none transition focus:border-neutral-950"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={state.loading || !token}
                  className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-full bg-neutral-950 px-8 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(23,17,13,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {state.loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push("/account")}
                    className="text-sm text-neutral-600"
                  >
                    Back to{" "}
                    <span className="font-semibold text-neutral-950">
                      Login
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fbfaf6] text-neutral-950">
          <p className="text-sm text-neutral-600">Loading reset password...</p>
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}