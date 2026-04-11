"use client";

import { Wallet, Loader2, ExternalLink, AlertCircle, Check } from "lucide-react";
import { usePool } from "@/hooks/usePool";
import { HASHKEY_TESTNET, DEPOSIT_AMOUNT } from "@/lib/constants";

interface JoinPoolSectionProps {
  calldata: string;
}

export function JoinPoolSection({ calldata }: JoinPoolSectionProps) {
  const { status, txHash, error, joinPool } = usePool();

  const handleJoin = () => {
    joinPool(calldata);
  };

  // Success banner
  if (status === "done" && txHash) {
    return (
      <div className="space-y-3 animate-fade-in-up">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-dim border border-border-accent">
          <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent">
              Successfully joined the pool!
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Deposited {DEPOSIT_AMOUNT} HSK to the ZK-Gated Pool
            </p>
            <a
              href={`${HASHKEY_TESTNET.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono text-accent hover:underline cursor-pointer"
            >
              <span className="truncate max-w-[200px]">{txHash}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Error banner
  if (status === "error" && error) {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-start gap-2 p-4 rounded-xl bg-error-dim border border-[var(--error)]">
          <AlertCircle className="w-4 h-4 text-[var(--error)] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-[var(--error)] font-medium">Transaction failed</p>
            <p className="text-xs text-[var(--error)] opacity-70 mt-1 break-all">
              {error}
            </p>
          </div>
        </div>
        <button
          onClick={handleJoin}
          className="w-full cursor-pointer py-3 px-8 rounded-full border border-border text-text-primary font-semibold text-sm
            hover:border-border-hover hover:bg-bg-elevated transition-all duration-150
            focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  // Loading states
  if (status === "connecting" || status === "switching-chain" || status === "sending" || status === "confirming") {
    const messages: Record<string, string> = {
      connecting: "Connecting wallet...",
      "switching-chain": "Switching to HashKey Chain Testnet...",
      sending: "Sending transaction...",
      confirming: "Confirming transaction...",
    };

    return (
      <div className="space-y-3">
        <button
          disabled
          className="w-full py-3 px-8 rounded-full bg-bg-elevated border border-border text-text-secondary font-semibold text-sm
            flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{messages[status]}</span>
        </button>
        {txHash && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-text-muted justify-center">
            <span>Tx:</span>
            <a
              href={`${HASHKEY_TESTNET.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline cursor-pointer truncate max-w-[200px]"
            >
              {txHash}
            </a>
            <ExternalLink className="w-3 h-3 flex-shrink-0 text-accent" />
          </div>
        )}
      </div>
    );
  }

  // Idle - show join button
  return (
    <div className="pt-2">
      <button
        onClick={handleJoin}
        className="w-full cursor-pointer py-3 px-8 rounded-full bg-accent text-bg-base font-bold text-sm
          hover:brightness-110 transition-all duration-150
          flex items-center justify-center gap-2
          focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        <Wallet className="w-4 h-4" />
        <span>Join Pool -- {DEPOSIT_AMOUNT} HSK</span>
      </button>
    </div>
  );
}
