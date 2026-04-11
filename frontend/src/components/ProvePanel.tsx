"use client";

import { useState, useMemo } from "react";
import { Check, Loader2, Binary, AlertCircle } from "lucide-react";
import { Credential, DisclosureFlags, ProofResult as ProofResultType } from "@/lib/types";
import { computeDisclosureFlags, buildWitnessInput } from "@/lib/buildInput";
import { useProver } from "@/hooks/useProver";
import { JoinPoolSection } from "./JoinPoolSection";

interface ProvePanelProps {
  credential: Credential | null;
  zkReady: boolean;
}

const DISCLOSURE_OPTIONS = [
  { key: "age" as const, label: "Age >= 18", description: "Prove you meet the minimum age requirement" },
  { key: "jurisdiction" as const, label: "Jurisdiction = HK", description: "Prove your jurisdiction is Hong Kong" },
  { key: "kyc" as const, label: "KYC Level >= 2", description: "Prove your KYC level meets the threshold" },
];

function ProofHash({ calldata }: { calldata: string }) {
  const hash = useMemo(() => {
    const raw = calldata.replace(/[\[\]",\s]/g, "").slice(0, 16);
    return `0x${raw}`;
  }, [calldata]);

  return (
    <div className="flex items-center gap-2 font-mono text-[13px] text-accent animate-fade-in-up">
      <span className="text-text-muted">Proof:</span>
      <span className="bg-accent-dim px-2 py-0.5 rounded">{hash}...</span>
    </div>
  );
}

function VerifiedAttribute({ label, verified }: { label: string; verified: boolean }) {
  if (!verified) return null;
  return (
    <div className="flex items-center gap-2 text-sm animate-fade-in-up">
      <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
        <Check className="w-2.5 h-2.5 text-bg-base" strokeWidth={3} />
      </div>
      <span className="text-text-primary">{label}</span>
    </div>
  );
}

export function ProvePanel({ credential, zkReady }: ProvePanelProps) {
  const [flags, setFlags] = useState<DisclosureFlags>({
    age: true,
    jurisdiction: true,
    kyc: true,
  });

  const { status, statusMessage, result, error, prove, reset } = useProver();

  const bitmask = useMemo(() => computeDisclosureFlags(flags), [flags]);
  const anySelected = flags.age || flags.jurisdiction || flags.kyc;
  const canProve = credential !== null && anySelected && zkReady && status === "idle";

  const handleToggle = (key: keyof DisclosureFlags) => {
    if (status !== "idle") return;
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProve = async () => {
    if (!credential || !anySelected) return;
    const input = buildWitnessInput(credential, flags);
    try {
      await prove(input);
    } catch {
      // error handled by hook
    }
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div
      className="bg-bg-surface border border-border rounded-2xl p-6 md:p-8 animate-fade-in-up"
      style={{ animationDelay: "200ms", animationFillMode: "both" }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Binary className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold text-text-primary">Prove Eligibility</h2>
      </div>

      {/* Disclosure checkboxes */}
      <div className="space-y-3 mb-6">
        <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-text-muted mb-3">
          Select attributes to prove
        </p>
        {DISCLOSURE_OPTIONS.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={flags[key]}
              onChange={() => handleToggle(key)}
              disabled={status !== "idle"}
              className="checkbox-custom"
            />
            <span className="text-sm text-text-primary group-hover:text-accent transition-colors duration-150">
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Bitmask display */}
      <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-bg-elevated border border-border mb-6">
        <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-text-muted">
          Disclosure Flags
        </span>
        <span className="font-mono text-base font-semibold text-accent">
          0b{bitmask.toString(2).padStart(3, "0")} = {bitmask}
        </span>
      </div>

      {/* Prove button */}
      {status === "idle" && (
        <button
          onClick={handleProve}
          disabled={!canProve}
          className="w-full cursor-pointer py-3 px-8 rounded-full bg-accent text-bg-base font-bold text-sm
            hover:brightness-110 transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100
            focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          Generate ZK Proof
        </button>
      )}

      {/* Generating state */}
      {status === "generating" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 justify-center py-3">
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
            <span className="text-sm text-text-secondary">{statusMessage}</span>
          </div>
          <div className="h-3 rounded-full bg-bg-elevated overflow-hidden">
            <div
              className="h-full rounded-full bg-accent animate-pulse-glow"
              style={{ width: "60%", transition: "width 300ms ease-out" }}
            />
          </div>
          <p className="text-xs text-text-muted text-center">
            Computing constraints in WASM -- this may take a few seconds...
          </p>
        </div>
      )}

      {/* Error state */}
      {status === "error" && error && (
        <div className="space-y-4">
          <div className="flex items-start gap-2 p-4 rounded-xl bg-error-dim border border-[var(--error)] animate-fade-in">
            <AlertCircle className="w-4 h-4 text-[var(--error)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-[var(--error)] font-medium">Proof generation failed</p>
              <p className="text-xs text-[var(--error)] opacity-70 mt-1 font-mono break-all">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-full cursor-pointer py-3 px-8 rounded-full border border-border text-text-primary font-semibold text-sm
              hover:border-border-hover hover:bg-bg-elevated transition-all duration-150
              focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Proof result */}
      {status === "done" && result && (
        <ProofResultDisplay result={result} flags={flags} />
      )}
    </div>
  );
}

function ProofResultDisplay({
  result,
  flags,
}: {
  result: ProofResultType;
  flags: DisclosureFlags;
}) {
  return (
    <div className="space-y-4">
      {/* Proof hash */}
      <ProofHash calldata={result.calldata} />

      {/* Verified attributes */}
      <div className="space-y-2 py-3">
        {flags.age && (
          <VerifiedAttribute label="Age requirement verified" verified />
        )}
        {flags.jurisdiction && (
          <VerifiedAttribute label="Jurisdiction verified" verified />
        )}
        {flags.kyc && (
          <VerifiedAttribute label="KYC level verified" verified />
        )}
      </div>

      {/* Join Pool */}
      <JoinPoolSection calldata={result.calldata} />
    </div>
  );
}
