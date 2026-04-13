"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/issue", label: "Get Credential" },
  { href: "/wallet", label: "Wallet" },
  { href: "/claim", label: "Claim Airdrop" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="w-5 h-5 text-accent" />
          <span className="font-bold text-lg tracking-tight">
            zk<span className="text-accent">pass</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-dim text-accent"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-mono">HashKey Testnet</span>
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
        </div>
      </div>
    </nav>
  );
}
