"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Sparkles,
  User,
} from "lucide-react";

import { signupUser } from "@/lib/api/auth.api";

export default function SignupPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    countryCode: "+91",
    phoneNumber: "",
    emailType: "PERSONAL",
    userSubType: "CUSTOMER",
  });

  const [message, setMessage] = useState({
    error: "",
    success: "",
  });

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      setMessage({ error: "Name required hai.", success: "" });
      return;
    }

    if (!form.email.trim()) {
      setMessage({ error: "Email required hai.", success: "" });
      return;
    }

    if (!form.password.trim()) {
      setMessage({ error: "Password required hai.", success: "" });
      return;
    }

    if (!form.countryCode.trim() || !form.phoneNumber.trim()) {
      setMessage({ error: "Country code aur phone number required hai.", success: "" });
      return;
    }

    try {
      setLoading(true);
      setMessage({ error: "", success: "" });

      const registerPayload = {
  name: form.name.trim(),
  email: form.email.trim().toLowerCase(),
  password: form.password,
  countryCode: form.countryCode.trim(),
  phoneNumber: form.phoneNumber.trim(),
  emailType: form.emailType || "PERSONAL",
  userSubType: form.userSubType || "CUSTOMER",
};

console.log("REGISTER PAYLOAD:", registerPayload);

const response = await signupUser(registerPayload);

     

      sessionStorage.setItem("verifyEmail", form.email.trim());

      setMessage({
        error: "",
        success:
          response.message ||
          "Signup successful. Email OTP verify page par redirect ho raha hai.",
      });

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(form.email.trim())}`);
      }, 700);
    } catch (error: any) {
      setMessage({
        error: error?.message || "Signup failed",
        success: "",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-4 py-10 text-neutral-950">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1200px] items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="mx-auto w-full max-w-[560px] rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
              Create account
            </p>

            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              Signup to Shahsi
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Signup ke baad email OTP verify karo, phir login karke Bridal Party APIs authorize ho jayengi.
            </p>
          </div>

          {message.error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {message.error}
            </div>
          ) : null}

          {message.success ? (
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {message.success}
            </div>
          ) : null}

          <form onSubmit={handleSignup} className="mt-7 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Name
              </span>

              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                <User className="h-4 w-4 text-neutral-500" />

                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Ashish Kumar"
                />
              </div>
            </label>

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
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <div className="grid gap-4 sm:grid-cols-[0.38fr_0.62fr]">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Country Code
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                  <Phone className="h-4 w-4 text-neutral-500" />

                  <input
                    type="text"
                    required
                    value={form.countryCode}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        countryCode: e.target.value,
                      }))
                    }
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="+91"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Phone Number
                </span>

                <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                  <input
                    type="tel"
                    required
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="9876543210"
                  />
                </div>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Password
              </span>

              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 focus-within:border-neutral-950">
                <Lock className="h-4 w-4 text-neutral-500" />

                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Test@123456"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-neutral-500"
                  aria-label="Toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Email Type
              </span>

              <select
                value={form.emailType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    emailType: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm outline-none focus:border-neutral-950"
              >
                <option value="PERSONAL">PERSONAL</option>
                <option value="BUSINESS">BUSINESS</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                User Type
              </span>

              <select
                value={form.userSubType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    userSubType: e.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm outline-none focus:border-neutral-950"
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="BRIDE">BRIDE</option>
                <option value="BRIDESMAID">BRIDESMAID</option>
                <option value="GROOM">GROOM</option>
                <option value="STYLIST">STYLIST</option>
                <option value="VENDOR">VENDOR</option>
                <option value="OTHER">OTHER</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-neutral-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-neutral-950">
                Login
              </Link>
            </p>
          </form>
        </section>

        <section className="hidden rounded-[2.5rem] bg-neutral-950 p-10 text-white lg:block">
          <div className="flex h-full min-h-[620px] flex-col justify-between">
            <div>
              <div className="inline-flex rounded-full bg-white/10 p-4">
                <Sparkles className="h-6 w-6" />
              </div>

              <h1 className="mt-8 font-serif text-6xl italic leading-none">
                Join the
                <br />
                atelier.
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
                Apna account create karo aur bridal party, fitting profile, rentals aur orders ek jagah manage karo.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white/10 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                Next Step
              </p>

              <p className="mt-3 text-sm leading-6 text-white/75">
                Signup ke baad email OTP verify karna hoga. Verify hone ke baad login karke workspace use kar sakte ho.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}