"use client";

import { useState, useCallback } from "react";
import { BrowserProvider, Contract } from "ethers";
import { HASHKEY_TESTNET, CONTRACTS, AIRDROP_ABI } from "@/lib/constants";
import { parseCalldata } from "@/lib/buildInput";
import { ClaimStatus } from "@/lib/types";

export function useClaim() {
  const [status, setStatus] = useState<ClaimStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ensureChain = useCallback(async (provider: any) => {
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
    async (calldata: string, walletProvider?: any) => {
      setError(null);
      setTxHash(null);

      const provider = walletProvider || (window as any).ethereum;
      if (!provider) {
        setError("No wallet detected. Please install MetaMask or another EVM wallet.");
        setStatus("error");
        return;
      }

      try {
        setStatus("connecting");
        await provider.request({ method: "eth_requestAccounts" });

        setStatus("switching-chain");
        await ensureChain(provider);

        setStatus("sending");
        const ethersProvider = new BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();

        const contract = new Contract(CONTRACTS.zkAirdrop, AIRDROP_ABI, signer);
        const { a, b, c, signals } = parseCalldata(calldata);

        const tx = await contract.claim(a, b, c, signals);

        setStatus("confirming");
        setTxHash(tx.hash);
        await tx.wait();

        setStatus("done");
      } catch (err: unknown) {
        const error = err as { code?: number | string; message?: string; reason?: string; data?: string };
        const msg = [error.reason, error.message, error.data].join(" ");

        // Custom error selectors (first 4 bytes of keccak256)
        // AlreadyClaimed()     = 0x646cf558
        // InvalidProof()       = 0x09bde339
        // UntrustedIssuer()    = 0x...
        // WrongNullifierScope()= 0x...
        // InsufficientDisclosure() = 0x...

        if (error.code === 4001 || error.code === "ACTION_REJECTED") {
          setError("Transaction rejected by user.");
        } else if (msg.includes("AlreadyClaimed") || msg.includes("0x646cf558")) {
          setError("Already claimed! Each identity can only claim once.");
        } else if (msg.includes("UntrustedIssuer")) {
          setError("Credential issuer is not registered in the on-chain registry.");
        } else if (msg.includes("InvalidProof")) {
          setError("ZK proof verification failed on-chain.");
        } else if (msg.includes("WrongNullifierScope")) {
          setError("Proof was generated for a different airdrop scope.");
        } else if (msg.includes("InsufficientDisclosure")) {
          setError("Required disclosure flags not set. Age and jurisdiction must be proven.");
        } else if (msg.includes("execution reverted") || msg.includes("CALL_EXCEPTION")) {
          setError("Transaction reverted on-chain. The proof may be invalid or already used.");
        } else {
          setError(error.reason || "Transaction failed. Check your wallet and try again.");
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
