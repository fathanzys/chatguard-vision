import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChatGuard Vision | AI Chat Audit",
  description: "Sistem deteksi toksisitas chat berbasis AI.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

import { LanguageProvider } from "@/components/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        // Styling dipindahkan ke sini (className) agar aman dari error CSS
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900`}
        // Background pattern menggunakan inline style (aman dari error build tailwind)
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      >
        {children}
      </body>
    </html>
  );
}