"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Heart,
  Home,
  Package,
  Palette,
  RefreshCcw,
  RotateCcw,
  Ruler,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import {
  clearSavedToken,
  createUserProfile,
  forgotPassword,
  getCurrentUser,
  getSavedToken,
  getUserProfile,
  loginUser,
  registerUser,
  saveTokenFromResponse,
  updateUserProfile,
  type UserProfilePayload,
} from "@/lib/api/account.api";
import { useToast } from "@/components/ui/AppToast";

type AuthMode = "login" | "signup" | "forgot";

type AccountSection =
  | "overview"
  | "orders"
  | "rentals"
  | "subscription"
  | "fit"
  | "wishlist"
  | "bridal"
  | "returns"
  | "resale";

type Order = {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  total: string;
  image: string;
};

const bodyTypes = ["average", "slim", "athletic", "curvy", "plus-size"];
const fitPreferences = ["regular", "tight", "relaxed", "loose"];

const defaultProfileForm: UserProfilePayload = {
  height: 170,
  weight: 65,
  chest: 95,
  waist: 80,
  bodyType: "average",
  fitPreference: "regular",
};

const orders: Order[] = [
  {
    id: "SH-10294",
    title: "Mira Chiffon Dress · Sage",
    type: "Retail + Bridal Group",
    status: "Shipped",
    date: "May 12, 2026",
    total: "$396",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "SH-10221",
    title: "Mira Pleated One Shoulder Gown · Emerald",
    type: "Made-to-order",
    status: "In production",
    date: "May 4, 2026",
    total: "$169",
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=900&auto=format&fit=crop",
  },
  {
    id: "SH-10188",
    title: "Sorrel Stretch Satin Dress · Ganache",
    type: "Rental",
    status: "Return due",
    date: "Apr 28, 2026",
    total: "$58",
    image:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop",
  },
];

const rentals = [
  ["Sorrel Stretch Satin Dress", "Event: May 19, 2026", "Return by May 23", "Backup size L"],
  ["Azra Bondi Chiffon Dress", "Event: June 2, 2026", "Reserved", "Backup size A10"],
];

const wishlist = [
  {
    name: "Azra Bondi Chiffon Dress",
    meta: "Sky Blue · High fit · +72 colors",
    price: "$99",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Debra Convertible Dress",
    meta: "Champagne · Group ready",
    price: "$119",
    image:
      "https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=900&auto=format&fit=crop",
  },
  {
    name: "Valentine Floral Burnout Dress",
    meta: "Olive Floral · Garden edit",
    price: "$129",
    image:
      "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=900&auto=format&fit=crop",
  },
];

const bridalParties = [
  ["Sofia Wedding", "June 22, 2026", "4 members", "2 paid · 3 selected"],
  ["Lina Garden Party", "July 8, 2026", "6 members", "Palette pending"],
];

const returns = [
  ["Sorrel Stretch Satin Dress", "Rental return", "Return due May 23", "Fit feedback needed"],
  ["Niamh Corset Dress", "Exchange", "Waist too snug", "Fit Engine updated"],
];

const resaleListings = [
  ["Mira Chiffon Dress · Sage", "$68", "Measurement verified", "Listed"],
  ["Debra Convertible Dress · Champagne", "$70", "Needs hip measurement", "Draft"],
];

const sections: Array<{
  id: AccountSection;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: "overview", label: "Overview", icon: <Home className="h-4 w-4" /> },
  { id: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { id: "rentals", label: "Rentals", icon: <Package className="h-4 w-4" /> },
  { id: "subscription", label: "Subscription", icon: <RefreshCcw className="h-4 w-4" /> },
  { id: "fit", label: "Saved fit profile", icon: <Ruler className="h-4 w-4" /> },
  { id: "wishlist", label: "Wishlist", icon: <Heart className="h-4 w-4" /> },
  { id: "bridal", label: "Bridal parties", icon: <Users className="h-4 w-4" /> },
  { id: "returns", label: "Returns", icon: <RotateCcw className="h-4 w-4" /> },
  { id: "resale", label: "Resale listings", icon: <Shirt className="h-4 w-4" /> },
];

export default function AccountPage() {
  const toast = useToast();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [forgotForm, setForgotForm] = useState({ email: "" });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSection, setActiveSection] =
    useState<AccountSection>("overview");

  const [profileForm, setProfileForm] =
    useState<UserProfilePayload>(defaultProfileForm);

  const [profileExists, setProfileExists] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const summary = useMemo(
    () => ({
      activeOrders: orders.length,
      bridalParties: bridalParties.length,
      wishlistItems: wishlist.length,
      resaleListings: resaleListings.length,
    }),
    []
  );

  const bmi = useMemo(() => {
    if (!profileForm.height || !profileForm.weight) return null;
    const heightInMeter = profileForm.height / 100;
    return (profileForm.weight / (heightInMeter * heightInMeter)).toFixed(1);
  }, [profileForm.height, profileForm.weight]);

  function normalizeProfile(data: any): UserProfilePayload {
    const profile =
      data?.data ||
      data?.profile ||
      data?.userProfile ||
      data?.user_profile ||
      data;

    return {
      height: Number(profile?.height ?? defaultProfileForm.height),
      weight: Number(profile?.weight ?? defaultProfileForm.weight),
      chest: Number(profile?.chest ?? defaultProfileForm.chest),
      waist: Number(profile?.waist ?? defaultProfileForm.waist),
      bodyType: profile?.bodyType ?? defaultProfileForm.bodyType,
      fitPreference:
        profile?.fitPreference ?? defaultProfileForm.fitPreference,
    };
  }

  async function checkAuthAndLoad() {
    try {
      setCheckingAuth(true);

      const token = getSavedToken();

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        const userResponse = await getCurrentUser();
        setCurrentUser(userResponse?.user || userResponse?.data || userResponse);
      } catch {
        setCurrentUser(null);
      }

      await loadProfile();
    } finally {
      setCheckingAuth(false);
    }
  }

  async function loadProfile() {
    try {
      setProfileLoading(true);
      setProfileError("");

      const response = await getUserProfile();

      setProfileExists(true);
      setProfileForm(normalizeProfile(response));
    } catch (error: any) {
      const msg = String(error?.message || "");

      if (
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("404")
      ) {
        setProfileExists(false);
        setProfileForm(defaultProfileForm);
      } else if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("401")
      ) {
        setIsLoggedIn(false);
        clearSavedToken();
        setProfileError("Session expired. Please login again.");
      } else {
        setProfileError(msg || "Unable to load profile.");
      }
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setAuthLoading(true);
      setAuthError("");
      setAuthMessage("");

      const response = await loginUser({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      const token = saveTokenFromResponse(response);

      if (!token) {
        throw new Error("Unable to start your session. Please try again.");
      }

      toast.success("You are logged in", "Welcome back to Shahsi.");

      setIsLoggedIn(true);
      setAuthMessage("");
      await checkAuthAndLoad();
    } catch (error: any) {
      const message = error?.message || "Login failed.";
      toast.error("Login failed", message);
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setAuthLoading(true);
      setAuthError("");
      setAuthMessage("");

      const payload: any = {
        name: signupForm.name.trim(),
        email: signupForm.email.trim(),
        password: signupForm.password,
      };

      if (signupForm.phone.trim()) {
        payload.phone = signupForm.phone.trim();
      }

      const response = await registerUser(payload);
      const token = saveTokenFromResponse(response);

      if (token) {
        toast.success("Account created", "Your Shahsi account has been created.");
        setIsLoggedIn(true);
        setAuthMessage("");
        await checkAuthAndLoad();
      } else {
        toast.success("Account created", "Please login to continue.");
        setAuthMode("login");
        setAuthMessage("");
      }
    } catch (error: any) {
      const message = error?.message || "Signup failed.";
      toast.error("Signup failed", message);
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setAuthLoading(true);
      setAuthError("");
      setAuthMessage("");

      await forgotPassword({
        email: forgotForm.email.trim(),
      });

      toast.success(
        "Reset link sent",
        "Please check your email for password reset instructions."
      );

      setAuthMessage("");
      setAuthMode("login");
    } catch (error: any) {
      const message = error?.message || "Unable to send reset password email.";
      toast.error("Reset failed", message);
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setProfileSaving(true);
      setProfileError("");

      if (profileExists) {
        await updateUserProfile(profileForm);
        toast.success(
          "Profile updated",
          "Your measurements have been updated successfully."
        );
      } else {
        await createUserProfile(profileForm);
        setProfileExists(true);
        toast.success(
          "Profile created",
          "Your measurements have been saved successfully."
        );
      }

      await loadProfile();
    } catch (error: any) {
      const msg = String(error?.message || "");

      if (
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("401")
      ) {
        clearSavedToken();
        setIsLoggedIn(false);
        toast.error("Session expired", "Please login again.");
        setProfileError("Session expired. Please login again.");
      } else {
        toast.error("Profile save failed", msg || "Unable to save profile.");
        setProfileError(msg || "Unable to save profile.");
      }
    } finally {
      setProfileSaving(false);
    }
  }

  function handleLogout() {
    clearSavedToken();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setProfileExists(false);
    setProfileForm(defaultProfileForm);
    setAuthMode("login");
    setAuthError("");
    setAuthMessage("");

    toast.success("You are logged out", "You have been signed out successfully.");
  }

  function updateProfileField<K extends keyof UserProfilePayload>(
    key: K,
    value: UserProfilePayload[K]
  ) {
    setProfileForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#fbfaf6] px-4 py-10 text-neutral-950">
        <section className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-neutral-200">
          Checking account...
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-neutral-950">
      <PromoBar />
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <section className="mx-auto max-w-[1500px] px-4 py-7 lg:px-8">
        {!isLoggedIn ? (
          <AuthCard
            authMode={authMode}
            setAuthMode={setAuthMode}
            authLoading={authLoading}
            authError={authError}
            authMessage={authMessage}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            signupForm={signupForm}
            setSignupForm={setSignupForm}
            forgotForm={forgotForm}
            setForgotForm={setForgotForm}
            handleLogin={handleLogin}
            handleSignup={handleSignup}
            handleForgotPassword={handleForgotPassword}
          />
        ) : (
          <>
            <Hero
              summary={summary}
              userEmail={
                currentUser?.email ||
                currentUser?.user?.email ||
                "member@shahsi.com"
              }
              setActiveSection={setActiveSection}
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
              <AccountNav
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                userEmail={
                  currentUser?.email ||
                  currentUser?.user?.email ||
                  "Shahsi member"
                }
              />

              <section className="grid gap-8">
                {activeSection === "overview" && (
                  <Overview
                    setActiveSection={setActiveSection}
                    profileForm={profileForm}
                    bmi={bmi}
                  />
                )}

                {activeSection === "orders" && <OrdersPanel />}
                {activeSection === "rentals" && <RentalsPanel />}
                {activeSection === "subscription" && <SubscriptionPanel />}

                {activeSection === "fit" && (
                  <FitProfilePanel
                    profileForm={profileForm}
                    bmi={bmi}
                    profileExists={profileExists}
                    profileLoading={profileLoading}
                    profileSaving={profileSaving}
                    profileError={profileError}
                    onSubmit={handleProfileSubmit}
                    updateProfileField={updateProfileField}
                    reloadProfile={loadProfile}
                  />
                )}

                {activeSection === "wishlist" && <WishlistPanel />}
                {activeSection === "bridal" && <BridalPartiesPanel />}
                {activeSection === "returns" && <ReturnsPanel />}
                {activeSection === "resale" && <ResalePanel />}
              </section>
            </div>
          </>
        )}
      </section>

      {isLoggedIn ? (
        <>
          <AccountFlow />
          <ModuleOwnership />
        </>
      ) : null}
    </main>
  );
}

function PromoBar() {
  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-2 px-4 py-3 text-center text-xs uppercase tracking-[0.16em] text-neutral-600 md:flex-row lg:px-8">
        <span>Account dashboard</span>
        <span>Orders · rentals · Gownloop · resale</span>
        <span>Fit profile powers every recommendation</span>
      </div>
    </div>
  );
}

function Header({
  isLoggedIn,
  onLogout,
}: {
  isLoggedIn: boolean;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fbfaf6]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-5 lg:px-8">
      <Link
  href="/"
  className="group inline-flex flex-col"
  aria-label="Go to Shahsi homepage"
>
  <p className="text-2xl font-semibold tracking-tight transition group-hover:text-[#b98262]">
    Shahsi
  </p>
  <p className="hidden text-xs uppercase tracking-[0.18em] text-neutral-500 transition group-hover:text-[#b98262] sm:block">
    Account hub
  </p>
</Link>

        <nav className="hidden items-center gap-8 text-sm lg:flex">
          <a>Orders</a>
          <a>Rentals</a>
          <a>Gownloop</a>
          <a>Fit Profile</a>
          <a>Bridal Parties</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="rounded-full border border-neutral-300 p-3 hover:bg-white">
            <Search className="h-4 w-4" />
          </button>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-neutral-950 px-5 py-3 text-sm font-medium"
            >
              Logout
            </button>
          ) : null}

          <button className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white">
            Shop now
          </button>
        </div>
      </div>
    </header>
  );
}

function AuthCard(props: {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  authLoading: boolean;
  authError: string;
  authMessage: string;
  loginForm: { email: string; password: string };
  setLoginForm: React.Dispatch<
    React.SetStateAction<{ email: string; password: string }>
  >;
  signupForm: { name: string; email: string; phone: string; password: string };
  setSignupForm: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      phone: string;
      password: string;
    }>
  >;
  forgotForm: { email: string };
  setForgotForm: React.Dispatch<React.SetStateAction<{ email: string }>>;
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSignup: (e: React.FormEvent<HTMLFormElement>) => void;
  handleForgotPassword: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const {
    authMode,
    setAuthMode,
    authLoading,
    authError,
    authMessage,
    loginForm,
    setLoginForm,
    signupForm,
    setSignupForm,
    forgotForm,
    setForgotForm,
    handleLogin,
    handleSignup,
    handleForgotPassword,
  } = props;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 py-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
      <section className="rounded-[2.25rem] bg-neutral-950 p-8 text-white md:p-12">
        <p className="text-xs uppercase tracking-[0.24em] text-white/55">
          Shahsi Account
        </p>
        <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-6xl">
          Your wardrobe, events, orders, and fit profile in one place.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-white/70">
          Login or create your account to manage measurements, orders, rentals,
          wishlist, bridal parties, returns, and resale listings.
        </p>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
        <div className="mb-6 grid grid-cols-2 rounded-full bg-[#f7f2ea] p-1">
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
              authMode === "login" || authMode === "forgot"
                ? "bg-neutral-950 text-white"
                : "text-neutral-600 hover:bg-white"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
              authMode === "signup"
                ? "bg-neutral-950 text-white"
                : "text-neutral-600 hover:bg-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        <h2 className="text-3xl font-medium">
          {authMode === "login"
            ? "Welcome Back"
            : authMode === "signup"
              ? "Create Account"
              : "Forgot Password"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-600">
          {authMode === "login"
            ? "Login to manage your Shahsi account."
            : authMode === "signup"
              ? "Create your Shahsi account to save your profile."
              : "Enter your email and we will send password reset instructions."}
        </p>

        {authError ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {authError}
          </div>
        ) : null}

        {authMessage ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {authMessage}
          </div>
        ) : null}

        {authMode === "login" ? (
          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            <AuthInput
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(value) =>
                setLoginForm((prev) => ({ ...prev, email: value }))
              }
              placeholder="you@example.com"
            />

            <AuthInput
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(value) =>
                setLoginForm((prev) => ({ ...prev, password: value }))
              }
              placeholder="Enter password"
            />

            <button
              type="button"
              onClick={() => {
                setForgotForm({ email: loginForm.email });
                setAuthMode("forgot");
              }}
              className="text-sm font-semibold text-neutral-700 underline underline-offset-4"
            >
              Forgot password?
            </button>

            <SubmitButton loading={authLoading} text="Login" loadingText="Logging in..." />
          </form>
        ) : null}

        {authMode === "signup" ? (
          <form onSubmit={handleSignup} className="mt-6 space-y-5">
            <AuthInput
              label="Name"
              value={signupForm.name}
              onChange={(value) =>
                setSignupForm((prev) => ({ ...prev, name: value }))
              }
              placeholder="Your name"
            />

            <AuthInput
              label="Email"
              type="email"
              value={signupForm.email}
              onChange={(value) =>
                setSignupForm((prev) => ({ ...prev, email: value }))
              }
              placeholder="you@example.com"
            />

            <AuthInput
              label="Phone Optional"
              type="tel"
              value={signupForm.phone}
              onChange={(value) =>
                setSignupForm((prev) => ({ ...prev, phone: value }))
              }
              placeholder="Phone number"
              required={false}
            />

            <AuthInput
              label="Password"
              type="password"
              value={signupForm.password}
              onChange={(value) =>
                setSignupForm((prev) => ({ ...prev, password: value }))
              }
              placeholder="Create password"
            />

            <SubmitButton
              loading={authLoading}
              text="Create Account"
              loadingText="Creating..."
            />
          </form>
        ) : null}

        {authMode === "forgot" ? (
          <form onSubmit={handleForgotPassword} className="mt-6 space-y-5">
            <AuthInput
              label="Email"
              type="email"
              value={forgotForm.email}
              onChange={(value) =>
                setForgotForm((prev) => ({ ...prev, email: value }))
              }
              placeholder="you@example.com"
            />

            <SubmitButton
              loading={authLoading}
              text="Send Reset Link"
              loadingText="Sending..."
            />

            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className="w-full rounded-full border border-neutral-300 px-6 py-3 text-sm font-semibold"
            >
              Back to Login
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}

function Hero({
  summary,
  userEmail,
  setActiveSection,
}: {
  summary: {
    activeOrders: number;
    bridalParties: number;
    wishlistItems: number;
    resaleListings: number;
  };
  userEmail: string;
  setActiveSection: (section: AccountSection) => void;
}) {
  return (
    <section className="overflow-hidden rounded-[2.25rem] bg-neutral-950 text-white shadow-sm">
      <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:p-12">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">
            /account · {userEmail}
          </p>
          <h1 className="mt-4 text-5xl font-medium leading-[0.98] tracking-tight md:text-6xl">
            Your Shahsi wardrobe, events, orders, and fit profile.
          </h1>
          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Manage orders, rentals, Gownloop subscription, saved fit profile,
            wishlist, bridal parties, returns, and resale listings from one
            luxury account hub.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-950">
              Continue shopping <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSection("fit")}
              className="rounded-full border border-white/30 px-6 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white"
            >
              Open fit profile
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <HeroMetric icon={<ShoppingBag className="h-4 w-4" />} label="Active orders" value={`${summary.activeOrders}`} />
          <HeroMetric icon={<Users className="h-4 w-4" />} label="Bridal parties" value={`${summary.bridalParties}`} />
          <HeroMetric icon={<Heart className="h-4 w-4" />} label="Wishlist" value={`${summary.wishlistItems}`} />
          <HeroMetric icon={<Shirt className="h-4 w-4" />} label="Resale listings" value={`${summary.resaleListings}`} />
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
      <div className="mb-3 flex items-center gap-2 text-white/75">
        {icon}
        <span className="text-xs uppercase tracking-[0.14em]">{label}</span>
      </div>
      <p className="text-3xl font-medium">{value}</p>
    </div>
  );
}

function AccountNav({
  activeSection,
  setActiveSection,
  userEmail,
}: {
  activeSection: AccountSection;
  setActiveSection: (section: AccountSection) => void;
  userEmail: string;
}) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-neutral-200">
        <div className="mb-4 rounded-2xl bg-[#f7f2ea] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-950 text-white">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium">Shahsi Member</p>
              <p className="truncate text-sm text-neutral-500">{userEmail}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                activeSection === section.id
                  ? "bg-neutral-950 text-white"
                  : "hover:bg-neutral-100"
              }`}
            >
              <span className="flex items-center gap-2">
                {section.icon}
                {section.label}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function Overview({
  setActiveSection,
  profileForm,
  bmi,
}: {
  setActiveSection: (section: AccountSection) => void;
  profileForm: UserProfilePayload;
  bmi: string | null;
}) {
  return (
    <>
      <section className="grid gap-5 md:grid-cols-4">
        <QuickCard icon={<ShoppingBag className="h-5 w-5" />} title="Orders" value="3 active" copy="Track current orders" onClick={() => setActiveSection("orders")} />
        <QuickCard icon={<Package className="h-5 w-5" />} title="Rentals" value="2 rentals" copy="Event windows" onClick={() => setActiveSection("rentals")} />
        <QuickCard icon={<RefreshCcw className="h-5 w-5" />} title="Gownloop" value="Active" copy="Next box June 1" onClick={() => setActiveSection("subscription")} />
        <QuickCard icon={<Ruler className="h-5 w-5" />} title="Fit Profile" value="Connected" copy="Measurements active" onClick={() => setActiveSection("fit")} />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <OrdersPanel compact />
        <FitProfileSummary profileForm={profileForm} bmi={bmi} />
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <BridalPartiesPanel compact />
        <SubscriptionPanel compact />
      </section>
    </>
  );
}

function QuickCard({
  icon,
  title,
  value,
  copy,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  copy: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-[1.5rem] bg-white p-5 text-left shadow-sm ring-1 ring-neutral-200 transition hover:-translate-y-0.5"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f2ea]">
        {icon}
      </div>
      <p className="text-sm text-neutral-500">{title}</p>
      <p className="mt-1 text-2xl font-medium">{value}</p>
      <p className="mt-2 text-sm text-neutral-600">{copy}</p>
    </button>
  );
}

function FitProfileSummary({
  profileForm,
  bmi,
}: {
  profileForm: UserProfilePayload;
  bmi: string | null;
}) {
  return (
    <Panel
      title="Saved Fit Profile"
      eyebrow="User profile"
      copy="This section is connected with backend user profile measurements."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Height" value={`${profileForm.height} cm`} />
        <Metric label="Weight" value={`${profileForm.weight} kg`} />
        <Metric label="Chest" value={`${profileForm.chest} cm`} />
        <Metric label="Waist" value={`${profileForm.waist} cm`} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoTile
          icon={<Sparkles className="h-5 w-5" />}
          title="Fit Engine"
          lines={[
            `Body type: ${profileForm.bodyType}`,
            `Fit preference: ${profileForm.fitPreference}`,
            `BMI: ${bmi || "-"}`,
          ]}
        />
        <InfoTile
          icon={<Palette className="h-5 w-5" />}
          title="Style Engine"
          lines={[
            "Best colors: sage, emerald, champagne",
            "Modesty: moderate",
            "Body-shape guidance: A-line",
          ]}
        />
      </div>
    </Panel>
  );
}

function FitProfilePanel({
  profileForm,
  bmi,
  profileExists,
  profileLoading,
  profileSaving,
  profileError,
  onSubmit,
  updateProfileField,
  reloadProfile,
}: {
  profileForm: UserProfilePayload;
  bmi: string | null;
  profileExists: boolean;
  profileLoading: boolean;
  profileSaving: boolean;
  profileError: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  updateProfileField: <K extends keyof UserProfilePayload>(
    key: K,
    value: UserProfilePayload[K]
  ) => void;
  reloadProfile: () => void;
}) {
  return (
    <Panel
      title="Saved Fit Profile"
      eyebrow="User profile"
      copy="Only this measurements section is functional right now. Other account modules are static until backend APIs are connected."
    >
      {profileLoading ? (
        <div className="mb-5 rounded-2xl border border-neutral-200 bg-[#f7f2ea] px-4 py-3 text-sm text-neutral-600">
          Loading profile...
        </div>
      ) : null}

      {profileError ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {profileError}
        </div>
      ) : null}

      <form onSubmit={onSubmit}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <NumberInput
            label="Height cm"
            value={profileForm.height}
            onChange={(value) => updateProfileField("height", value)}
          />
          <NumberInput
            label="Weight kg"
            value={profileForm.weight}
            onChange={(value) => updateProfileField("weight", value)}
          />
          <NumberInput
            label="Chest cm"
            value={profileForm.chest}
            onChange={(value) => updateProfileField("chest", value)}
          />
          <NumberInput
            label="Waist cm"
            value={profileForm.waist}
            onChange={(value) => updateProfileField("waist", value)}
          />

          <div>
            <label className="mb-2 block text-sm font-medium">Body Type</label>
            <select
              value={profileForm.bodyType}
              onChange={(e) => updateProfileField("bodyType", e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 bg-[#fbfaf6] px-4 py-3 text-sm capitalize outline-none focus:border-neutral-950"
            >
              {bodyTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Fit Preference
            </label>
            <select
              value={profileForm.fitPreference}
              onChange={(e) =>
                updateProfileField("fitPreference", e.target.value)
              }
              className="w-full rounded-2xl border border-neutral-300 bg-[#fbfaf6] px-4 py-3 text-sm capitalize outline-none focus:border-neutral-950"
            >
              {fitPreferences.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <Metric label="BMI" value={bmi || "-"} />
          <Metric label="Status" value={profileExists ? "Saved" : "New"} />
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={profileSaving}
            className="rounded-full bg-neutral-950 px-7 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {profileSaving
              ? "Saving..."
              : profileExists
                ? "Update Measurements"
                : "Create Measurements"}
          </button>

          <button
            type="button"
            onClick={reloadProfile}
            className="rounded-full border border-neutral-300 px-7 py-3 text-sm font-semibold"
          >
            Refresh
          </button>
        </div>
      </form>
    </Panel>
  );
}

function OrdersPanel({ compact = false }: { compact?: boolean }) {
  const visible = compact ? orders.slice(0, 2) : orders;

  return (
    <Panel
      title="Orders"
      eyebrow="Order history"
      copy="Static preview for retail, rental, made-to-order, bridal group, subscription, and resale order activity."
    >
      <div className="grid gap-4">
        {visible.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </Panel>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <article className="grid gap-4 rounded-[1.5rem] border border-neutral-200 p-4 md:grid-cols-[96px_1fr_auto] md:items-center">
      <img
        src={order.image}
        alt={order.title}
        className="h-28 w-full rounded-2xl object-cover md:h-24 md:w-24"
      />

      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge>{order.status}</Badge>
          <Badge>{order.type}</Badge>
        </div>
        <h3 className="font-medium">{order.title}</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {order.id} · {order.date}
        </p>
      </div>

      <div className="text-left md:text-right">
        <p className="text-xl font-medium">{order.total}</p>
        <button className="mt-2 text-sm font-medium underline underline-offset-4">
          Track
        </button>
      </div>
    </article>
  );
}

function RentalsPanel() {
  return (
    <Panel
      title="Rentals"
      eyebrow="Rental windows"
      copy="Static rental preview. Backend integration will connect rental windows, backup sizes, and return deadlines later."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {rentals.map(([title, event, status, backup]) => (
          <InfoTile
            key={title}
            icon={<Package className="h-5 w-5" />}
            title={title}
            lines={[event, status, backup]}
          />
        ))}
      </div>
    </Panel>
  );
}

function SubscriptionPanel({ compact = false }: { compact?: boolean }) {
  return (
    <Panel
      title="Gownloop Subscription"
      eyebrow="Subscription"
      copy="Static subscription preview for membership, monthly rotation, closet, keep/buy, swap, and feedback learning."
    >
      <div className="rounded-[1.5rem] bg-neutral-950 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">
          Current plan
        </p>
        <h3 className="mt-2 text-3xl font-medium">Gownloop Signature</h3>
        <p className="mt-3 text-white/70">
          Next box ships June 1. Prioritizing A-line midi dresses in jewel tones.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <DarkMetric label="Items" value="2/month" />
          <DarkMetric label="Swap" value="Priority" />
          <DarkMetric label="Billing" value="Active" />
        </div>
      </div>

      {!compact ? (
        <button className="mt-5 rounded-full border border-neutral-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em]">
          Manage subscription
        </button>
      ) : null}
    </Panel>
  );
}

function WishlistPanel() {
  return (
    <Panel
      title="Wishlist"
      eyebrow="Saved products"
      copy="Static wishlist preview. Backend integration will later connect saved products."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {wishlist.map((item) => (
          <ProductCard key={item.name} item={item} />
        ))}
      </div>
    </Panel>
  );
}

function ProductCard({ item }: { item: (typeof wishlist)[number] }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] bg-[#fbfaf6]">
      <img
        src={item.image}
        alt={item.name}
        className="aspect-[4/5] w-full object-cover"
      />
      <div className="p-4">
        <h3 className="font-medium">{item.name}</h3>
        <p className="mt-1 text-sm text-neutral-500">{item.meta}</p>
        <p className="mt-3 text-xl font-medium">{item.price}</p>
        <button className="mt-4 w-full rounded-full bg-neutral-950 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          Move to cart
        </button>
      </div>
    </article>
  );
}

function BridalPartiesPanel({ compact = false }: { compact?: boolean }) {
  return (
    <Panel
      title="Bridal Parties"
      eyebrow="Group ordering"
      copy="Static bridal party preview. Backend integration will later connect wedding workspaces and member statuses."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {bridalParties.map(([name, date, members, status]) => (
          <InfoTile
            key={name}
            icon={<Users className="h-5 w-5" />}
            title={name}
            lines={[date, members, status]}
          />
        ))}
      </div>

      {!compact ? (
        <button className="mt-5 rounded-full bg-neutral-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">
          Create bridal party
        </button>
      ) : null}
    </Panel>
  );
}

function ReturnsPanel() {
  return (
    <Panel
      title="Returns"
      eyebrow="Returns feedback"
      copy="Static returns preview. Backend integration will later connect return and fit feedback APIs."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {returns.map(([title, type, status, signal]) => (
          <InfoTile
            key={title}
            icon={<RotateCcw className="h-5 w-5" />}
            title={title}
            lines={[type, status, signal]}
          />
        ))}
      </div>
    </Panel>
  );
}

function ResalePanel() {
  return (
    <Panel
      title="Resale Listings"
      eyebrow="Marketplace"
      copy="Static resale preview. Backend integration will later connect seller listings, garment measurements, and listing status."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {resaleListings.map(([title, price, validation, status]) => (
          <InfoTile
            key={title}
            icon={<Shirt className="h-5 w-5" />}
            title={title}
            lines={[price, validation, status]}
          />
        ))}
      </div>

      <button className="mt-5 rounded-full bg-neutral-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white">
        Create listing
      </button>
    </Panel>
  );
}

function Panel({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200 md:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl leading-7 text-neutral-600">{copy}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function InfoTile({
  icon,
  title,
  lines,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-[1.5rem] border border-neutral-200 p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>

      <div className="grid gap-2">
        {lines.map((line) => (
          <p key={line} className="text-sm text-neutral-600">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] bg-[#f7f2ea] p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-medium">{value}</p>
    </div>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/50">
        {label}
      </p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#f7f2ea] px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function AuthInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-neutral-300 bg-[#fbfaf6] px-4 py-3 text-sm outline-none focus:border-neutral-950"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-2xl border border-neutral-300 bg-[#fbfaf6] px-4 py-3 text-sm outline-none focus:border-neutral-950"
        required
      />
    </div>
  );
}

function SubmitButton({
  loading,
  text,
  loadingText,
}: {
  loading: boolean;
  text: string;
  loadingText: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-full bg-neutral-950 px-7 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? loadingText : text}
    </button>
  );
}

function AccountFlow() {
  return (
    <section className="bg-[#f7f2ea] py-14">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
            Account flow
          </p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            A single hub for Shahsi’s full lifecycle.
          </h2>
          <p className="mt-4 leading-7 text-neutral-600">
            The account dashboard connects commerce, fit intelligence, bridal
            coordination, rental/subscription lifecycle, returns, and resale.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <FlowStep icon={<ShoppingBag className="h-5 w-5" />} title="Order" copy="Buy, rent, MTO" />
          <FlowStep icon={<Ruler className="h-5 w-5" />} title="Fit" copy="Save profile" />
          <FlowStep icon={<Users className="h-5 w-5" />} title="Party" copy="Coordinate group" />
          <FlowStep icon={<RefreshCcw className="h-5 w-5" />} title="Gownloop" copy="Rotate closet" />
          <FlowStep icon={<Shirt className="h-5 w-5" />} title="Resale" copy="List again" />
        </div>
      </div>
    </section>
  );
}

function FlowStep({
  icon,
  title,
  copy,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-5 text-center shadow-sm ring-1 ring-neutral-200">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f2ea]">
        {icon}
      </div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{copy}</p>
    </div>
  );
}

function ModuleOwnership() {
  const moduleMap = [
    ["Account", "Customer dashboard, saved data, activity, shortcuts, account-level navigation"],
    ["Orders", "Order history, order status, checkout history, fulfillment tracking"],
    ["Rental", "Rental windows, return deadlines, backup sizes, event readiness"],
    ["Subscription", "Gownloop plan, monthly box, closet management, swap/keep flow"],
    ["User Profile", "Saved fit profile, measurements, style preferences, saved sizes"],
    ["Bridal Party", "Wedding workspaces, group orders, member statuses, payment readiness"],
    ["Returns Feedback", "Return/exchange reasons, fit feedback, style feedback, learning signals"],
    ["Reseller Marketplace", "Seller listings, garment measurements, condition and listing status"],
  ];

  return (
    <section className="bg-neutral-950 py-14 text-white">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">
            Modular Monolith Ownership
          </p>
          <h2 className="mt-3 text-4xl font-medium tracking-tight">
            Account Dashboard module map.
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {moduleMap.map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-white/10 p-5">
              <h3 className="font-medium">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}