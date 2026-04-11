import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "zkpass — Zero-Knowledge Identity Passport",
  description:
    "Prove who you are. Reveal nothing else. ZK-powered identity verification on HashKey Chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`} style={{ colorScheme: "dark" }}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
