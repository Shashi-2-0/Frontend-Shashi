import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/AppToast";

export const metadata: Metadata = {
  title: "Shahsi",
  description: "Premium fashion commerce platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}