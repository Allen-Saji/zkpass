"use client";

import { useState, useEffect, useCallback } from "react";
import { JsonRpcProvider, Contract, formatEther } from "ethers";
import { HASHKEY_TESTNET, CONTRACTS, AIRDROP_ABI, TOKEN_ABI } from "@/lib/constants";
import { AirdropStats } from "@/lib/types";

export function useAirdropStats() {
  const [stats, setStats] = useState<AirdropStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const provider = new JsonRpcProvider(HASHKEY_TESTNET.rpcUrl);
      const airdrop = new Contract(CONTRACTS.zkAirdrop, AIRDROP_ABI, provider);
      const token = new Contract(CONTRACTS.zkToken, TOKEN_ABI, provider);

      const [totalClaims, remaining, claimAmt] = await Promise.all([
        airdrop.totalClaims(),
        airdrop.remainingTokens(),
        airdrop.claimAmount(),
      ]);

      setStats({
        totalClaims: Number(totalClaims),
        remainingTokens: formatEther(remaining),
        claimAmount: formatEther(claimAmt),
      });
    } catch (err) {
      console.error("Failed to fetch airdrop stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
