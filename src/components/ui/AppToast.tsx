"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextValue = {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = createId();

      setToasts((prev) => [
        {
          id,
          type,
          title,
          message,
        },
        ...prev.slice(0, 3),
      ]);

      window.setTimeout(() => {
        removeToast(id);
      }, 3600);
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({
      success: (title: string, message?: string) =>
        pushToast("success", title, message),
      error: (title: string, message?: string) =>
        pushToast("error", title, message),
      info: (title: string, message?: string) =>
        pushToast("info", title, message),
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: (id: string) => void;
}) {
  const styles =
    toast.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : toast.type === "error"
        ? "border-red-200 bg-red-50 text-red-900"
        : "border-neutral-200 bg-white text-neutral-900";

  const icon =
    toast.type === "success" ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-700" />
    ) : toast.type === "error" ? (
      <XCircle className="h-5 w-5 text-red-700" />
    ) : (
      <Info className="h-5 w-5 text-neutral-700" />
    );

  return (
    <div
      className={`animate-[toastSlideIn_0.22s_ease-out] rounded-2xl border p-4 shadow-[0_18px_45px_rgba(23,17,13,0.14)] backdrop-blur ${styles}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon}</div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>

          {toast.message ? (
            <p className="mt-1 text-xs leading-5 opacity-80">
              {toast.message}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="rounded-full p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}