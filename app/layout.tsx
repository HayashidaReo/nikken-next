import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AuthErrorBoundary } from "@/components/providers/auth-error-boundary";
import { TournamentProvider } from "@/components/providers/tournament-provider";
import { QueryProvider } from "@/lib/query-provider";
import { PwaUnregister } from "@/components/pwa-unregister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const isPwaEnabled = process.env.ENABLE_PWA === "true";

export const metadata: Metadata = {
  title: "Nikken Next App",
  description: "日本拳法大会運営支援アプリ",
  ...(isPwaEnabled
    ? {
      manifest: "/manifest.json",
      appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Nikken Next",
      },
    }
    : {}),
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {!isPwaEnabled && <PwaUnregister />}
        <QueryProvider>
          <AuthErrorBoundary>
            <AuthProvider>
              <TournamentProvider>
                <NotificationProvider>
                  {children}
                </NotificationProvider>
              </TournamentProvider>
            </AuthProvider>
          </AuthErrorBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
