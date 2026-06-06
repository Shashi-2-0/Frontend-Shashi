"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function LoginRedirectPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `/account?${query}` : "/account");
  }, [router, searchParams]);

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-4 py-10 text-neutral-950">
      <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-xl items-center justify-center">
        <div className="w-full rounded-[2.5rem] bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>

          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Shahsi Account
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Redirecting to Your Account
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Please wait while we take you to your account page.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function LoginRedirectPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fbfaf6] px-4 py-10 text-neutral-950">
          <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-xl items-center justify-center">
            <div className="w-full rounded-[2.5rem] bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>

              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
                Shahsi Account
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Loading login...
              </h1>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Please wait.
              </p>
            </div>
          </section>
        </main>
      }
    >
      <LoginRedirectPageContent />
    </Suspense>
  );
}