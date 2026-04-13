"use client";

import { useState, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import { HASHKEY_TESTNET, CONTRACTS, AIRDROP_ABI } from "@/lib/constants";
import { parseCalldata } from "@/lib/buildInput";
import { ClaimStatus } from "@/lib/types";

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

export function useClaim() {
  const [status, setStatus] = useState<ClaimStatus>("idle");
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

  const claimAirdrop = useCallback(
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

        const contract = new Contract(CONTRACTS.zkAirdrop, AIRDROP_ABI, signer);
        const { a, b, c, signals } = parseCalldata(calldata);

        const tx = await contract.claim(a, b, c, signals);

        setStatus("confirming");
        setTxHash(tx.hash);
        await tx.wait();

        setStatus("done");
      } catch (err: unknown) {
        const error = err as { code?: number | string; message?: string; reason?: string };
        if (error.code === 4001 || error.code === "ACTION_REJECTED") {
          setError("Transaction rejected by user");
        } else if (error.reason?.includes("AlreadyClaimed") || error.message?.includes("AlreadyClaimed")) {
          setError("Already claimed! Each identity can only claim once.");
        } else if (error.reason?.includes("UntrustedIssuer") || error.message?.includes("UntrustedIssuer")) {
          setError("Credential issuer is not registered in the on-chain registry.");
        } else if (error.reason?.includes("InvalidProof") || error.message?.includes("InvalidProof")) {
          setError("ZK proof verification failed on-chain.");
        } else if (error.reason?.includes("WrongNullifierScope") || error.message?.includes("WrongNullifierScope")) {
          setError("Proof was generated for a different airdrop scope.");
        } else {
          setError(error.reason || error.message || "Transaction failed");
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

  return { status, txHash, error, claimAirdrop, reset };
}
