"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Heart,
  Home,
  Loader2,
  Package,
  Palette,
  RefreshCcw,
  RotateCcw,
  Ruler,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  XCircle,
  Eye,
EyeOff,
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
import {
  getWishlist,
  removeFromWishlist,
  unwrapWishlistItems,
  type WishlistItem,
} from "@/lib/api/wishlist.api";
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

function readFirst(...values: unknown[]) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }

  return "";
}

function getWishlistProduct(item: WishlistItem): any {
  return item.product || {};
}

function getWishlistProductId(item: WishlistItem) {
  const product = getWishlistProduct(item);

  return readFirst(item.productId, product.productId, product.id);
}

function getWishlistProductTitle(item: WishlistItem) {
  const product = getWishlistProduct(item);

  return readFirst(product.title, product.name, "Product title missing");
}

function getWishlistProductImage(item: WishlistItem) {
  const product = getWishlistProduct(item);

  return readFirst(
    product.imageUrl,
    product.thumbnail,
    product.image,
    product.primaryImage,
    product.media?.url,
    product.media?.secureUrl,
    product.primaryMedia?.url,
    product.primaryMedia?.secureUrl
  );
}

function getWishlistProductMeta(item: WishlistItem) {
  const product = getWishlistProduct(item);

  const brand = readFirst(product.brand);
  const category = readFirst(
    product.category,
    product.primaryCategory,
    Array.isArray(product.categoryPath)
      ? product.categoryPath.join(" / ")
      : product.categoryPath
  );
  const color = readFirst(product.color);

  return [brand, category, color].filter(Boolean).join(" · ");
}

function getWishlistProductPrice(item: WishlistItem) {
  const product = getWishlistProduct(item);

  const value =
    product.salePrice ??
    product.listingPrice ??
    product.price ??
    product.rentalPrice ??
    product.retailPrice ??
    0;

  const numeric = Number(value);

  return Number.isFinite(numeric) ? numeric : 0;
}

function getWishlistProductHref(item: WishlistItem) {
  const product = getWishlistProduct(item);
  const slug = readFirst(product.slug, getWishlistProductId(item));

  const categoryPathRaw = product.categoryPath;
  const categoryPath = Array.isArray(categoryPathRaw)
    ? categoryPathRaw.join("/")
    : readFirst(categoryPathRaw, product.primaryCategory, product.category);

  if (categoryPath && slug) {
    return `/${categoryPath}/${encodeURIComponent(slug)}`;
  }

  if (slug) {
    return `/products/${encodeURIComponent(slug)}`;
  }

  return "#";
}

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
  [
    "Sorrel Stretch Satin Dress",
    "Event: May 19, 2026",
    "Return by May 23",
    "Backup size L",
  ],
  [
    "Azra Bondi Chiffon Dress",
    "Event: June 2, 2026",
    "Reserved",
    "Backup size A10",
  ],
];

const bridalParties = [
  ["Sofia Wedding", "June 22, 2026", "4 members", "2 paid · 3 selected"],
  ["Lina Garden Party", "July 8, 2026", "6 members", "Palette pending"],
];

const returns = [
  [
    "Sorrel Stretch Satin Dress",
    "Rental return",
    "Return due May 23",
    "Fit feedback needed",
  ],
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
  {
    id: "subscription",
    label: "Subscription",
    icon: <RefreshCcw className="h-4 w-4" />,
  },
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

  const [showLoginPassword, setShowLoginPassword] = useState(false);
const [showSignupPassword, setShowSignupPassword] = useState(false);
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

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");
  const [removingWishlistId, setRemovingWishlistId] = useState("");

  const summary = useMemo(
    () => ({
      activeOrders: orders.length,
      bridalParties: bridalParties.length,
      wishlistItems: wishlistItems.length,
      resaleListings: resaleListings.length,
    }),
    [wishlistItems.length]
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
        setCurrentUser(null);
        setWishlistItems([]);
        setWishlistError("");
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
      await loadAccountWishlist();
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

  async function loadAccountWishlist() {
    try {
      setWishlistLoading(true);
      setWishlistError("");

      const response = await getWishlist({
        page: 1,
        limit: 60,
      });

      const items = unwrapWishlistItems(response);
      setWishlistItems(items);
    } catch (error: any) {
      console.error("Account wishlist load failed:", error);

      const message = String(error?.message || "");

      if (
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("401")
      ) {
        clearSavedToken();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setWishlistItems([]);
        setWishlistError("Session expired. Please login again.");
        return;
      }

      setWishlistItems([]);
      setWishlistError(message || "Wishlist API failed.");
    } finally {
      setWishlistLoading(false);
    }
  }

  async function handleRemoveWishlistItem(item: WishlistItem) {
    const productId = getWishlistProductId(item);

    if (!productId) return;

    try {
      setRemovingWishlistId(productId);
      setWishlistError("");

      await removeFromWishlist(productId);

      setWishlistItems((prev) =>
        prev.filter((entry) => getWishlistProductId(entry) !== productId)
      );

      toast.success("Removed from wishlist", "Product removed successfully.");
    } catch (error: any) {
      const message = error?.message || "Unable to remove wishlist item.";

      console.error("Account wishlist remove failed:", error);
      setWishlistError(message);
      toast.error("Wishlist remove failed", message);
    } finally {
      setRemovingWishlistId("");
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
    setWishlistItems([]);
    setWishlistError("");
    setRemovingWishlistId("");
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
            showLoginPassword={showLoginPassword}
setShowLoginPassword={setShowLoginPassword}
showSignupPassword={showSignupPassword}
setShowSignupPassword={setShowSignupPassword}
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

                {activeSection === "wishlist" && (
                  <WishlistPanel
                    items={wishlistItems}
                    loading={wishlistLoading}
                    error={wishlistError}
                    removingId={removingWishlistId}
                    onRemove={handleRemoveWishlistItem}
                    onRefresh={loadAccountWishlist}
                  />
                )}

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
          ) : (
            <Link
              href="/"
              className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white"
            >
              Shop now
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function AuthCard({
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
  showLoginPassword,
  setShowLoginPassword,
  showSignupPassword,
  setShowSignupPassword,
  handleLogin,
  handleSignup,
  handleForgotPassword,
}: {
  authMode: AuthMode;
  setAuthMode: React.Dispatch<React.SetStateAction<AuthMode>>;
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
  
  showLoginPassword: boolean;
setShowLoginPassword: React.Dispatch<React.SetStateAction<boolean>>;
showSignupPassword: boolean;
setShowSignupPassword: React.Dispatch<React.SetStateAction<boolean>>;
  handleLogin: (e: React.FormEvent<HTMLFormElement>) => void;
  handleSignup: (e: React.FormEvent<HTMLFormElement>) => void;
  handleForgotPassword: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="mx-auto grid max-w-[1100px] overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-neutral-200 lg:grid-cols-[1fr_0.9fr]">
      <div className="bg-neutral-950 p-8 text-white md:p-12">
        <p className="text-xs uppercase tracking-[0.22em] text-white/50">
          Account access
        </p>
        <h1 className="mt-5 text-5xl font-medium tracking-tight">
          Your Shahsi wardrobe starts here.
        </h1>
        <p className="mt-5 max-w-xl leading-7 text-white/70">
          Login to manage orders, rentals, saved fit profile, wishlist, bridal
          parties, returns, resale listings, and Gownloop lifecycle.
        </p>

      </div>

      <div className="p-8 md:p-12">
       <div className="mb-8 grid grid-cols-2 rounded-full bg-[#f4efe8] p-1 text-sm">
  <button
    type="button"
    onClick={() => setAuthMode("login")}
    className={[
      "h-[52px] rounded-full px-4 font-medium transition",
      authMode === "login" || authMode === "forgot"
        ? "bg-white text-[#15100c] shadow-sm"
        : "text-[#15100c] hover:bg-white/50",
    ].join(" ")}
  >
    Login
  </button>

  <button
    type="button"
    onClick={() => setAuthMode("signup")}
    className={[
      "h-[52px] rounded-full px-4 font-medium transition",
      authMode === "signup"
        ? "bg-white text-[#15100c] shadow-sm"
        : "text-[#15100c] hover:bg-white/50",
    ].join(" ")}
  >
    Signup
  </button>
</div>

        {authError ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {authError}
          </div>
        ) : null}

        {authMessage ? (
          <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {authMessage}
          </div>
        ) : null}

        {authMode === "login" ? (
          <form onSubmit={handleLogin} className="grid gap-4">
            <AuthInput
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(value) =>
                setLoginForm((prev) => ({ ...prev, email: value }))
              }
            />
           <AuthInput
  label="Password"
  type={showLoginPassword ? "text" : "password"}
  value={loginForm.password}
  onChange={(value) =>
    setLoginForm((prev) => ({ ...prev, password: value }))
  }
  isPassword
  showPassword={showLoginPassword}
  onTogglePassword={() => setShowLoginPassword((value) => !value)}
/>

            <div className="-mt-1 flex justify-end">
  <button
    type="button"
    onClick={() => {
      setForgotForm({ email: loginForm.email });
      setAuthMode("forgot");
    }}
    className="text-[11px] font-semibold uppercase tracking-[0.20em] text-[#7a746e] transition hover:text-[#15100c]"
  >
    Forgot Password?
  </button>
</div>

            <button
              type="submit"
              disabled={authLoading}
              className="mt-3 inline-flex h-13 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
            >
              {authLoading ? "Please wait..." : "Login"}
            </button>
          </form>
        ) : null}

        {authMode === "signup" ? (
          <form onSubmit={handleSignup} className="grid gap-4">
            <AuthInput
              label="Name"
              value={signupForm.name}
              onChange={(value) =>
                setSignupForm((prev) => ({ ...prev, name: value }))
              }
            />
            <AuthInput
              label="Email"
              type="email"
              value={signupForm.email}
              onChange={(value) =>
                setSignupForm((prev) => ({ ...prev, email: value }))
              }
            />
            <AuthInput
              label="Phone"
              value={signupForm.phone}
              onChange={(value) =>
                setSignupForm((prev) => ({ ...prev, phone: value }))
              }
            />
           <AuthInput
  label="Password"
  type={showSignupPassword ? "text" : "password"}
  value={signupForm.password}
  onChange={(value) =>
    setSignupForm((prev) => ({ ...prev, password: value }))
  }
  isPassword
  showPassword={showSignupPassword}
  onTogglePassword={() => setShowSignupPassword((value) => !value)}
/>

            <button
              type="submit"
              disabled={authLoading}
              className="mt-3 inline-flex h-13 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
            >
              {authLoading ? "Please wait..." : "Create account"}
            </button>
          </form>
        ) : null}

        {authMode === "forgot" ? (
          <form onSubmit={handleForgotPassword} className="grid gap-4">
            <AuthInput
              label="Email"
              type="email"
              value={forgotForm.email}
              onChange={(value) => setForgotForm({ email: value })}
            />

            <button
              type="submit"
              disabled={authLoading}
              className="mt-3 inline-flex h-13 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
            >
              {authLoading ? "Please wait..." : "Send reset link"}
            </button>

            <button
  type="button"
  onClick={() => setAuthMode("login")}
  className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8d0c4] bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#15100c] transition hover:border-[#15100c]"
>
  Back to Login
</button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function AuthInput({
  label,
  value,
  onChange,
  type = "text",
  isPassword = false,
  showPassword = false,
  onTogglePassword,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>

      <span className="relative block">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={[
            "h-13 w-full rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 outline-none focus:border-neutral-950",
            isPassword ? "pr-12" : "",
          ].join(" ")}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-neutral-500 transition hover:bg-[#eee8df] hover:text-neutral-950"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        ) : null}
      </span>
    </label>
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
  setActiveSection: React.Dispatch<React.SetStateAction<AccountSection>>;
}) {
  return (
    <section className="rounded-[2rem] bg-neutral-950 p-8 text-white md:p-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">
            /account · {userEmail}
          </p>

          <h1 className="mt-5 max-w-2xl text-5xl font-medium leading-[0.95] tracking-tight md:text-6xl">
            Your Shahsi wardrobe, events, orders, and fit profile.
          </h1>

          <p className="mt-5 max-w-2xl leading-7 text-white/70">
            Manage orders, rentals, Gownloop subscription, saved fit profile,
            wishlist, bridal parties, returns, and resale listings from one
            luxury account hub.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950"
            >
              Continue shopping
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setActiveSection("fit")}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
            >
              Open fit profile
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard label="Active Orders" value={summary.activeOrders} />
          <MetricCard label="Bridal Parties" value={summary.bridalParties} />
          <MetricCard label="Wishlist" value={summary.wishlistItems} />
          <MetricCard label="Resale Listings" value={summary.resaleListings} />
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.4rem] bg-white/10 p-6">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">
        {label}
      </p>
      <p className="mt-4 text-3xl font-medium">{value}</p>
    </div>
  );
}

function AccountNav({
  activeSection,
  setActiveSection,
  userEmail,
}: {
  activeSection: AccountSection;
  setActiveSection: React.Dispatch<React.SetStateAction<AccountSection>>;
  userEmail: string;
}) {
  return (
    <aside className="h-fit rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-5 rounded-[1.5rem] bg-[#f4efe8] p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-neutral-950 text-white">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold">Shahsi Member</p>
            <p className="truncate text-xs text-neutral-500">{userEmail}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-1">
        {sections.map((section) => {
          const active = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center justify-between rounded-2xl px-4 py-4 text-left transition ${
                active
                  ? "bg-neutral-950 text-white"
                  : "text-neutral-950 hover:bg-[#f4efe8]"
              }`}
            >
              <span className="flex items-center gap-3 font-medium">
                {section.icon}
                {section.label}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function Overview({
  setActiveSection,
  profileForm,
  bmi,
}: {
  setActiveSection: React.Dispatch<React.SetStateAction<AccountSection>>;
  profileForm: UserProfilePayload;
  bmi: string | null;
}) {
  return (
    <div className="grid gap-8">
      <Panel
        title="Account Overview"
        eyebrow="Dashboard"
        copy="Quick shortcuts for the account lifecycle."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => setActiveSection("orders")}
            className="rounded-[1.5rem] bg-[#fbfaf6] p-5 text-left ring-1 ring-neutral-200"
          >
            <ShoppingBag className="h-5 w-5" />
            <h3 className="mt-4 font-medium">Orders</h3>
            <p className="mt-1 text-sm text-neutral-500">
              View order history and current statuses.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("wishlist")}
            className="rounded-[1.5rem] bg-[#fbfaf6] p-5 text-left ring-1 ring-neutral-200"
          >
            <Heart className="h-5 w-5" />
            <h3 className="mt-4 font-medium">Wishlist</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Open saved products from backend wishlist.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("fit")}
            className="rounded-[1.5rem] bg-[#fbfaf6] p-5 text-left ring-1 ring-neutral-200"
          >
            <Ruler className="h-5 w-5" />
            <h3 className="mt-4 font-medium">Saved fit profile</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Height {profileForm.height} cm · BMI {bmi || "-"}
            </p>
          </button>
        </div>
      </Panel>

      <div className="grid gap-8 xl:grid-cols-2">
        <OrdersPanel compact />
        <FitProfileSummary profileForm={profileForm} bmi={bmi} />
      </div>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  copy,
  children,
}: {
  title: string;
  eyebrow: string;
  copy?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-neutral-200">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-4xl font-medium tracking-tight">{title}</h2>
        {copy ? <p className="mt-3 text-neutral-600">{copy}</p> : null}
      </div>

      {children}
    </section>
  );
}

function OrdersPanel({ compact = false }: { compact?: boolean }) {
  return (
    <Panel
      title="Orders"
      eyebrow="Commerce"
      copy="Order preview from account dashboard."
    >
      <div className="grid gap-4">
        {orders.slice(0, compact ? 2 : orders.length).map((order) => (
          <div
            key={order.id}
            className="grid gap-4 rounded-[1.5rem] bg-[#fbfaf6] p-4 ring-1 ring-neutral-200 md:grid-cols-[96px_1fr_auto]"
          >
            <img
              src={order.image}
              alt={order.title}
              className="h-24 w-24 rounded-2xl object-cover"
            />

            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                {order.id} · {order.type}
              </p>
              <h3 className="mt-2 font-medium">{order.title}</h3>
              <p className="mt-1 text-sm text-neutral-500">{order.date}</p>
            </div>

            <div className="md:text-right">
              <p className="font-medium">{order.total}</p>
              <p className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium ring-1 ring-neutral-200">
                {order.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function RentalsPanel() {
  return (
    <Panel
      title="Rentals"
      eyebrow="Rental lifecycle"
      copy="Rental reservations and return readiness."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {rentals.map(([name, event, returnText, backup]) => (
          <InfoTile
            key={name}
            icon={<Package className="h-5 w-5" />}
            title={name}
            lines={[event, returnText, backup]}
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
      copy="Subscription preview for membership, monthly rotation, closet, keep/buy, swap, and feedback learning."
    >
      <div className="rounded-[1.5rem] bg-neutral-950 p-6 text-white">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">
          Current plan
        </p>
        <h3 className="mt-2 text-3xl font-medium">Gownloop Signature</h3>
        <p className="mt-3 text-white/70">
          Next box ships June 1. Prioritizing A-line midi dresses in jewel
          tones.
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

function FitProfileSummary({
  profileForm,
  bmi,
}: {
  profileForm: UserProfilePayload;
  bmi: string | null;
}) {
  return (
    <Panel
      title="Fit Profile"
      eyebrow="Fit intelligence"
      copy="Saved measurements preview."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoTile
          icon={<Ruler className="h-5 w-5" />}
          title={`${profileForm.height} cm`}
          lines={["Height"]}
        />
        <InfoTile
          icon={<BadgeCheck className="h-5 w-5" />}
          title={`${profileForm.weight} kg`}
          lines={["Weight"]}
        />
        <InfoTile
          icon={<Sparkles className="h-5 w-5" />}
          title={bmi || "-"}
          lines={["BMI"]}
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
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  updateProfileField: <K extends keyof UserProfilePayload>(
    key: K,
    value: UserProfilePayload[K]
  ) => void;
  reloadProfile: () => void;
}) {
  return (
    <Panel
      title="Saved Fit Profile"
      eyebrow="Measurements"
      copy="Update measurements that power recommendations."
    >
      {profileError ? (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {profileError}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-5">
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField
            label="Height cm"
            value={profileForm.height}
            onChange={(value) => updateProfileField("height", value as any)}
          />
          <NumberField
            label="Weight kg"
            value={profileForm.weight}
            onChange={(value) => updateProfileField("weight", value as any)}
          />
          <NumberField
            label="Chest cm"
            value={profileForm.chest}
            onChange={(value) => updateProfileField("chest", value as any)}
          />
          <NumberField
            label="Waist cm"
            value={profileForm.waist}
            onChange={(value) => updateProfileField("waist", value as any)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Body type"
            value={String(profileForm.bodyType || "")}
            options={bodyTypes}
            onChange={(value) => updateProfileField("bodyType", value as any)}
          />
          <SelectField
            label="Fit preference"
            value={String(profileForm.fitPreference || "")}
            options={fitPreferences}
            onChange={(value) =>
              updateProfileField("fitPreference", value as any)
            }
          />
        </div>

        <div className="rounded-[1.5rem] bg-[#fbfaf6] p-5 ring-1 ring-neutral-200">
          <p className="text-sm text-neutral-500">Current BMI</p>
          <p className="mt-1 text-3xl font-medium">{bmi || "-"}</p>
          <p className="mt-2 text-sm text-neutral-500">
            Profile status: {profileExists ? "existing profile" : "new profile"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={profileSaving}
            className="rounded-full bg-neutral-950 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-60"
          >
            {profileSaving
              ? "Saving..."
              : profileExists
                ? "Update profile"
                : "Create profile"}
          </button>

          <button
            type="button"
            onClick={reloadProfile}
            disabled={profileLoading}
            className="rounded-full border border-neutral-950 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            {profileLoading ? "Loading..." : "Reload"}
          </button>
        </div>
      </form>
    </Panel>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-13 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 outline-none focus:border-neutral-950"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-13 rounded-2xl border border-neutral-200 bg-[#fbfaf6] px-4 outline-none focus:border-neutral-950"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function WishlistPanel({
  items,
  loading,
  error,
  removingId,
  onRemove,
  onRefresh,
}: {
  items: WishlistItem[];
  loading: boolean;
  error: string;
  removingId: string;
  onRemove: (item: WishlistItem) => void;
  onRefresh: () => void;
}) {
  return (
    <Panel
      title="Wishlist"
      eyebrow="Saved products"
      copy="Your saved products are loaded from backend wishlist."
    >
      {error ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Wishlist error</p>
            <p>{error}</p>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6]">
          <div className="flex items-center gap-3 text-sm text-neutral-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading wishlist from backend...
          </div>
        </div>
      ) : null}

      {!loading && !error && !items.length ? (
        <div className="rounded-[1.5rem] border border-neutral-200 bg-[#fbfaf6] px-6 py-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white">
            <Heart className="h-6 w-6" />
          </div>

          <h3 className="mt-5 text-xl font-medium">Your wishlist is empty</h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-600">
            Product heart pe click karke saved products yahan show honge.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-neutral-950 px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
          >
            Shop Products
          </Link>
        </div>
      ) : null}

      {!loading && items.length ? (
        <>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-sm text-neutral-600">
              {items.length} saved product{items.length === 1 ? "" : "s"}
            </p>

            <button
              type="button"
              onClick={onRefresh}
              className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition hover:bg-white"
            >
              Refresh
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {items.map((item) => {
              const productId = getWishlistProductId(item);
              const removing = removingId === productId;

              return (
                <ProductCard
                  key={item.id || productId}
                  item={item}
                  removing={removing}
                  onRemove={onRemove}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </Panel>
  );
}

function ProductCard({
  item,
  removing,
  onRemove,
}: {
  item: WishlistItem;
  removing: boolean;
  onRemove: (item: WishlistItem) => void;
}) {
  const title = getWishlistProductTitle(item);
  const image = getWishlistProductImage(item);
  const meta = getWishlistProductMeta(item);
  const price = getWishlistProductPrice(item);
  const href = getWishlistProductHref(item);

  return (
    <article className="group">
      <div className="relative overflow-hidden bg-[#f3eee6]">
        <Link href={href} className="block overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="aspect-[3/4] w-full object-cover object-top transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center bg-[#efe5d8] px-4 text-center text-sm text-neutral-500">
              Backend media missing
            </div>
          )}
        </Link>

      <button
  type="button"
  onClick={() => onRemove(item)}
  disabled={removing}
  className="absolute right-5 top-5 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#dc2626] shadow-sm transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
  aria-label="Remove from wishlist"
  title="Remove from wishlist"
>
  {removing ? (
    <Loader2 className="h-5 w-5 animate-spin text-[#dc2626]" />
  ) : (
    <Heart className="h-7 w-7 fill-[#dc2626] text-[#dc2626] stroke-[#dc2626] stroke-[1.8]" />
  )}
</button>
      </div>

      <div className="pt-4">
        <Link
          href={href}
          className="line-clamp-2 text-[15px] font-semibold leading-6 text-[#15100c] transition hover:text-[#b98262]"
        >
          {title}
        </Link>

        {meta ? (
          <p className="mt-1 line-clamp-1 text-sm text-neutral-500">
            {meta}
          </p>
        ) : null}

        <p className="mt-3 text-[15px] font-semibold text-[#15100c]">
          ${price}
        </p>

        <Link
          href={href}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 border border-[#15100c] text-xs font-semibold uppercase tracking-[0.18em] transition hover:bg-[#15100c] hover:text-white"
        >
          <ShoppingBag className="h-4 w-4" />
          View Product
        </Link>
      </div>
    </article>
  );
}

function BridalPartiesPanel({ compact = false }: { compact?: boolean }) {
  return (
    <Panel
      title="Bridal Parties"
      eyebrow="Group ordering"
      copy="Wedding workspaces and member status preview."
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
        <Link
          href="/bridal-party"
          className="mt-5 inline-flex rounded-full bg-neutral-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white"
        >
          Open bridal party
        </Link>
      ) : null}
    </Panel>
  );
}

function ReturnsPanel() {
  return (
    <Panel
      title="Returns"
      eyebrow="Returns feedback"
      copy="Returns, exchanges, and fit feedback preview."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {returns.map(([name, type, status, note]) => (
          <InfoTile
            key={name}
            icon={<RotateCcw className="h-5 w-5" />}
            title={name}
            lines={[type, status, note]}
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
      eyebrow="Reseller marketplace"
      copy="Seller listings and garment status preview."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {resaleListings.map(([name, price, measurement, status]) => (
          <InfoTile
            key={name}
            icon={<Shirt className="h-5 w-5" />}
            title={name}
            lines={[price, measurement, status]}
          />
        ))}
      </div>
    </Panel>
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
    <div className="rounded-[1.5rem] bg-[#fbfaf6] p-5 ring-1 ring-neutral-200">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-white">
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
      <div className="mt-2 grid gap-1">
        {lines.map((line) => (
          <p key={line} className="text-sm text-neutral-500">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/50">
        {label}
      </p>
      <p className="mt-2 font-medium">{value}</p>
    </div>
  );
}

function AccountFlow() {
  return (
    <section className="bg-[#f4efe8] py-14">
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
          <FlowStep
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Order"
            copy="Buy, rent, MTO"
          />
          <FlowStep
            icon={<Ruler className="h-5 w-5" />}
            title="Fit"
            copy="Save profile"
          />
          <FlowStep
            icon={<Users className="h-5 w-5" />}
            title="Party"
            copy="Coordinate group"
          />
          <FlowStep
            icon={<RefreshCcw className="h-5 w-5" />}
            title="Gownloop"
            copy="Rotate closet"
          />
          <FlowStep
            icon={<Shirt className="h-5 w-5" />}
            title="Resale"
            copy="List again"
          />
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
    [
      "Account",
      "Customer dashboard, saved data, activity, shortcuts, account-level navigation",
    ],
    [
      "Orders",
      "Order history, order status, checkout history, fulfillment tracking",
    ],
    [
      "Rental",
      "Rental windows, return deadlines, backup sizes, event readiness",
    ],
    [
      "Subscription",
      "Gownloop plan, monthly box, closet management, swap/keep flow",
    ],
    [
      "User Profile",
      "Saved fit profile, measurements, style preferences, saved sizes",
    ],
    [
      "Bridal Party",
      "Wedding workspaces, group orders, member statuses, payment readiness",
    ],
    [
      "Returns Feedback",
      "Return/exchange reasons, fit feedback, style feedback, learning signals",
    ],
    [
      "Reseller Marketplace",
      "Seller listings, garment measurements, condition and listing status",
    ],
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