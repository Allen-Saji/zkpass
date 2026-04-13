"use client";

import { ExternalLink } from "lucide-react";
import { HASHKEY_TESTNET, CONTRACTS } from "@/lib/constants";

export function Footer() {
  const shortAddr = `${CONTRACTS.zkAirdrop.slice(0, 6)}...${CONTRACTS.zkAirdrop.slice(-4)}`;

  return (
    <footer className="mt-auto py-6 border-t border-border">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
        <span>{HASHKEY_TESTNET.chainName}</span>
        <a
          href={`${HASHKEY_TESTNET.explorerUrl}/address/${CONTRACTS.zkAirdrop}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-text-secondary hover:text-accent transition-colors duration-150 cursor-pointer"
        >
          <span>ZKAirdrop: {shortAddr}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </footer>
  );
}
