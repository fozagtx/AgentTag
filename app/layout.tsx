import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppChrome from "@/components/AppChrome";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgentTag | Add book a call to your portfolio",
  description: "Paste your portfolio. Agents can book a call from it.",
  icons: {
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrains.variable} min-h-screen bg-[#07080a] text-white antialiased selection:bg-[#ff6b4a] selection:text-white`}
        style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
