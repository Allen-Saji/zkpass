import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_URL = "https://zkpass.allensaji.dev";

export const metadata: Metadata = {
  title: {
    default: "ZKPass - Zero-Knowledge Identity Protocol",
    template: "%s | ZKPass",
  },
  description:
    "Prove who you are. Reveal nothing. ZK-powered selective disclosure, holder binding, and sybil-resistant identity on HashKey Chain.",
  metadataBase: new URL(SITE_URL),
  keywords: [
    "zero-knowledge proof",
    "ZKP",
    "identity",
    "sybil resistance",
    "Groth16",
    "Circom",
    "HashKey Chain",
    "airdrop",
    "selective disclosure",
    "EdDSA",
    "Poseidon",
    "nullifier",
  ],
  authors: [{ name: "Allen Saji", url: "https://allensaji.dev" }],
  creator: "Allen Saji",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "ZKPass",
    title: "ZKPass - Zero-Knowledge Identity Protocol",
    description:
      "Prove who you are. Reveal nothing. ZK-powered selective disclosure, holder binding, and sybil-resistant identity on HashKey Chain.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZKPass - Zero-Knowledge Identity Protocol",
    description:
      "Prove who you are. Reveal nothing. ZK-powered selective disclosure and sybil-resistant identity.",
    creator: "@SajiBhai011",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`} style={{ colorScheme: "dark" }}>
      <body className="min-h-full flex flex-col font-sans">
        <NavBar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
