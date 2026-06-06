"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2, Phone, ShieldCheck } from "lucide-react";

import { useToast } from "@/components/ui/AppToast";
import { sendPhoneOtp, verifyPhoneOtp } from "@/lib/api/auth.api";

type ApiState = {
  loading: boolean;
  error: string;
  success: string;
};

const actionButtonClass =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(23,17,13,0.18)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60";

export default function VerifyPhonePage() {
  const toast = useToast();

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  const [apiState, setApiState] = useState<ApiState>({
    loading: false,
    error: "",
    success: "",
  });

  function cleanPhoneNumber(value: string) {
    return value.replace(/[^\d]/g, "");
  }

  async function handleSendOtp() {
    const cleanPhone = cleanPhoneNumber(phoneNumber);

    if (!countryCode.trim()) {
      toast.error("Country code required");
      setApiState({
        loading: false,
        error: "Country code required hai.",
        success: "",
      });
      return;
    }

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Valid phone number required");
      setApiState({
        loading: false,
        error: "Valid phone number enter karo.",
        success: "",
      });
      return;
    }

    try {
      setApiState({ loading: true, error: "", success: "" });

      const response = await sendPhoneOtp({
        countryCode: countryCode.trim(),
        phoneNumber: cleanPhone,
      });

      console.log("SEND PHONE OTP RESPONSE:", response);

      setOtpSent(true);

      const data = response?.data || response;
      const providerError = data?.providerError || data?.message || "";

      if (data?.phoneOtpSent === false) {
        setApiState({
          loading: false,
          error: "",
          success:
            "OTP generate ho gaya, lekin SMS provider ne message send nahi kiya. Backend logs se OTP le kar verify kar sakte ho.",
        });

        toast.info(
          "OTP generated",
          "SMS send nahi hua. Backend logs se OTP le lo."
        );

        if (providerError) {
          console.warn("PHONE OTP PROVIDER WARNING:", providerError);
        }

        return;
      }

      setApiState({
        loading: false,
        error: "",
        success: "OTP sent successfully. Phone par OTP check karo.",
      });

      toast.success("OTP sent", "Phone par OTP check karo.");
    } catch (error: any) {
      const message = error?.message || "Phone OTP send nahi ho paya.";

      setApiState({
        loading: false,
        error: message,
        success: "",
      });

      toast.error("OTP send failed", message);
    }
  }

  async function handleVerifyOtp() {
    const cleanPhone = cleanPhoneNumber(phoneNumber);
    const cleanOtp = otp.trim();

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error("Phone number required");
      return;
    }

    if (!cleanOtp || cleanOtp.length < 4) {
      toast.error("OTP required", "Valid OTP enter karo.");
      setApiState({
        loading: false,
        error: "Valid OTP enter karo.",
        success: "",
      });
      return;
    }

    try {
      setApiState({ loading: true, error: "", success: "" });

      const response = await verifyPhoneOtp({
        countryCode: countryCode.trim(),
        phoneNumber: cleanPhone,
        otp: cleanOtp,
      });

      console.log("VERIFY PHONE OTP RESPONSE:", response);

      setVerified(true);

      setApiState({
        loading: false,
        error: "",
        success: "Phone number verified successfully.",
      });

      toast.success("Phone verified", "Mobile number verify ho gaya.");
    } catch (error: any) {
      const message = error?.message || "Phone OTP verify nahi ho paya.";

      setApiState({
        loading: false,
        error: message,
        success: "",
      });

      toast.error("OTP verify failed", message);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-4 py-10 text-neutral-950">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200 sm:p-8">
          <div className="mb-7 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f2ea]">
              <Phone className="h-6 w-6" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
                Shahsi Auth
              </p>

              <h1 className="mt-1 text-3xl font-semibold">
                Verify Mobile Number
              </h1>

              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Phone number par OTP send karo, phir OTP enter karke mobile
                verify karo.
              </p>
            </div>
          </div>

          {apiState.error ? (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {apiState.error}
            </div>
          ) : null}

          {apiState.success ? (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
              {apiState.success}
            </div>
          ) : null}

          {verified ? (
            <div className="mb-5 rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700" />

                <div>
                  <p className="font-semibold text-emerald-900">
                    Mobile number verified
                  </p>

                  <p className="mt-1 text-sm leading-6 text-emerald-800">
                    Tumhara phone number successfully verify ho gaya.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-[130px_1fr]">
              <Input
                label="Country Code"
                value={countryCode}
                placeholder="+91"
                onChange={setCountryCode}
              />

              <Input
                label="Phone Number"
                value={phoneNumber}
                type="tel"
                inputMode="tel"
                placeholder="8570055054"
                onChange={(value) => setPhoneNumber(cleanPhoneNumber(value))}
              />
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={apiState.loading}
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 text-sm font-semibold text-white ${actionButtonClass}`}
            >
              {apiState.loading && !otpSent ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
              {otpSent ? "Resend Phone OTP" : "Send Phone OTP"}
            </button>

            {otpSent ? (
              <div className="mt-3 rounded-[24px] border border-neutral-200 bg-[#fbfaf6] p-5">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-neutral-200">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-semibold text-neutral-950">
                      Enter verification OTP
                    </p>

                    <p className="mt-1 text-sm leading-6 text-neutral-500">
                      Backend se OTP milte hi yahan enter karke verify karo.
                      Backend fix ke baad SMS direct aa jayega.
                    </p>
                  </div>
                </div>

                <Input
                  label="OTP"
                  value={otp}
                  inputMode="numeric"
                  placeholder="123456"
                  onChange={(value) => setOtp(value.replace(/[^\d]/g, ""))}
                />

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={apiState.loading}
                  className={`mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white ${actionButtonClass}`}
                >
                  {apiState.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Verify Phone OTP
                </button>
              </div>
            ) : null}
          </div>

          <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
            Note: Twilio trial issue ki wajah se agar SMS send nahi hota, to
            backend logs se OTP le kar verify test kar sakte ho. Backend fix ke
            baad same UI real SMS OTP ke saath chalega.
          </p>
        </div>
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>

      <input
        type={type}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
      />
    </label>
  );
}