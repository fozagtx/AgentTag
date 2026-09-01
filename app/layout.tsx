import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
  title: "CoFound | Ideation canvas",
  description: "Combine sponsor tools into an idea you can ship. Download it when you are done.",
  icons: {
    icon: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrains.variable} min-h-screen bg-[#f7f7f5] text-[#161616] antialiased selection:bg-[#ffb347] selection:text-[#161616]`}
        style={{ fontFamily: "var(--font-sans), Inter, sans-serif" }}
      >
        <Script src="/client.js" strategy="afterInteractive" />
        {children}
      </body>
    </html>
  );
}
