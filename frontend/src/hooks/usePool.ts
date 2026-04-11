"use client";

import { useState, useCallback } from "react";
import { BrowserProvider, Contract, parseEther } from "ethers";
import { HASHKEY_TESTNET, CONTRACTS, POOL_ABI, DEPOSIT_AMOUNT } from "@/lib/constants";
import { parseCalldata } from "@/lib/buildInput";
import { PoolStatus } from "@/lib/types";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function usePool() {
  const [status, setStatus] = useState<PoolStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ensureChain = useCallback(async (provider: EthereumProvider) => {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HASHKEY_TESTNET.chainId }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: HASHKEY_TESTNET.chainId,
              chainName: HASHKEY_TESTNET.chainName,
              rpcUrls: [HASHKEY_TESTNET.rpcUrl],
              blockExplorerUrls: [HASHKEY_TESTNET.explorerUrl],
              nativeCurrency: HASHKEY_TESTNET.nativeCurrency,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const joinPool = useCallback(
    async (calldata: string) => {
      setError(null);
      setTxHash(null);

      if (!window.ethereum) {
        setError("MetaMask not detected. Please install MetaMask.");
        setStatus("error");
        return;
      }

      try {
        setStatus("connecting");
        await window.ethereum.request({ method: "eth_requestAccounts" });

        setStatus("switching-chain");
        await ensureChain(window.ethereum);

        setStatus("sending");
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const contract = new Contract(CONTRACTS.zkGatedPool, POOL_ABI, signer);
        const { a, b, c, signals } = parseCalldata(calldata);

        const tx = await contract.deposit(a, b, c, signals, {
          value: parseEther(DEPOSIT_AMOUNT),
        });

        setStatus("confirming");
        setTxHash(tx.hash);
        await tx.wait();

        setStatus("done");
      } catch (err: unknown) {
        const error = err as { code?: number | string; message?: string };
        if (error.code === 4001 || error.code === "ACTION_REJECTED") {
          setError("Transaction rejected by user");
        } else {
          setError(error.message || "Transaction failed");
        }
        setStatus("error");
      }
    },
    [ensureChain]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
  }, []);

  return { status, txHash, error, joinPool, reset };
}
