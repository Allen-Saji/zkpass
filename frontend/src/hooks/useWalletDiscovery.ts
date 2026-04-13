"use client";

import { useState, useEffect, useCallback } from "react";

export interface DiscoveredWallet {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: any;
}

// EIP-6963: Multi-wallet discovery
// Detects all installed wallets instead of fighting over window.ethereum
export function useWalletDiscovery() {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const [selected, setSelected] = useState<DiscoveredWallet | null>(null);

  useEffect(() => {
    const discovered: DiscoveredWallet[] = [];

    const handler = (event: any) => {
      const { info, provider } = event.detail;
      // Deduplicate by uuid
      if (!discovered.find((w) => w.info.uuid === info.uuid)) {
        discovered.push({ info, provider });
        setWallets([...discovered]);
      }
    };

    window.addEventListener("eip6963:announceProvider", handler);
    // Request all wallets to announce themselves
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Fallback: if no EIP-6963 wallets found after 500ms, check window.ethereum
    const fallbackTimer = setTimeout(() => {
      if (discovered.length === 0 && (window as any).ethereum) {
        const fallbackWallet: DiscoveredWallet = {
          info: {
            uuid: "fallback",
            name: "Browser Wallet",
            icon: "",
            rdns: "unknown",
          },
          provider: (window as any).ethereum,
        };
        discovered.push(fallbackWallet);
        setWallets([...discovered]);
      }
    }, 500);

    return () => {
      window.removeEventListener("eip6963:announceProvider", handler);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const selectWallet = useCallback((wallet: DiscoveredWallet) => {
    setSelected(wallet);
  }, []);

  return { wallets, selected, selectWallet };
}
