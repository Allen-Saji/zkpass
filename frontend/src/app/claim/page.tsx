"use client";

import { useState, useEffect, useMemo } from "react";
import { Credential, DisclosureFlags } from "@/lib/types";
import { HASHKEY_TESTNET, CONTRACTS, CLAIM_AMOUNT, EXTERNAL_NULLIFIER } from "@/lib/constants";
import { loadCredentials, getHolderSecret } from "@/lib/credentialStore";
import { buildWitnessInput, computeDisclosureFlags } from "@/lib/buildInput";
import { useProver } from "@/hooks/useProver";
import { useClaim } from "@/hooks/useClaim";
import { useAirdropStats } from "@/hooks/useAirdropStats";
import { useZKEngine } from "@/hooks/useZKEngine";
import { PassportCard } from "@/components/PassportCard";
import {
  Coins,
  Fingerprint,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  XCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function ClaimPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [holderSecret, setHolderSecret] = useState<string | null>(null);
  const [flags, setFlags] = useState<DisclosureFlags>({
    age: true,          // required by contract
    jurisdiction: true, // required by contract
    kyc: false,         // optional
  });

  const prover = useProver();
  const claim = useClaim();
  const { stats, loading: statsLoading, refetch: refetchStats } = useAirdropStats();
  const zkEngine = useZKEngine();

  useEffect(() => {
    setCredentials(loadCredentials());
    setHolderSecret(getHolderSecret());
  }, []);

  const selectedCredential = credentials[selectedIdx] || null;

  const redactedFields = useMemo(() => {
    const set = new Set<string>();
    if (!flags.age) set.add("age");
    if (!flags.jurisdiction) set.add("jurisdiction");
    if (!flags.kyc) set.add("kyc");
    return set;
  }, [flags]);

  const bitmask = computeDisclosureFlags(flags);

  const handleGenerateAndClaim = async () => {
    if (!selectedCredential || !holderSecret) return;

    try {
      const input = buildWitnessInput(selectedCredential, flags, holderSecret);
      const result = await prover.prove(input);
      await claim.claimAirdrop(result.calldata);
      refetchStats();
    } catch {
      // Error state handled by hooks
    }
  };

  const isWorking =
    prover.status === "generating" ||
    claim.status === "connecting" ||
    claim.status === "switching-chain" ||
    claim.status === "sending" ||
    claim.status === "confirming";

  if (credentials.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center animate-fade-in-up">
        <ShieldAlert className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Credentials Found</h2>
        <p className="text-text-secondary mb-6">
          You need a verified credential before you can claim the airdrop.
        </p>
        <Link
          href="/issue"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-base font-semibold rounded-xl hover:brightness-110 transition-all"
        >
          Get Credential
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">Claim Your Airdrop</h1>
        <p className="text-text-secondary">
          Prove your identity with a ZK proof and claim {CLAIM_AMOUNT} ZKPT tokens.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up">
        <StatCard
          label="Claims Made"
          value={statsLoading ? "..." : stats?.totalClaims.toString() || "0"}
        />
        <StatCard
          label="Per Claim"
          value={`${CLAIM_AMOUNT} ZKPT`}
        />
        <StatCard
          label="Remaining"
          value={
            statsLoading
              ? "..."
              : stats
              ? `${Number(stats.remainingTokens).toLocaleString()} ZKPT`
              : "..."
          }
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Credential + Disclosure */}
        <div className="space-y-6 animate-fade-in-up">
          {/* Credential selector */}
          {credentials.length > 1 && (
            <div>
              <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1.5">
                Select Credential
              </label>
              <select
                value={selectedIdx}
                onChange={(e) => setSelectedIdx(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-sm focus:border-accent focus:outline-none"
              >
                {credentials.map((c, i) => (
                  <option key={i} value={i}>
                    {c.holder} -- {c.issuerPubKeyHash.slice(0, 12)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Passport card with selective disclosure */}
          {selectedCredential && (
            <PassportCard
              credential={selectedCredential}
              redactedFields={redactedFields}
            />
          )}

          {/* Disclosure flags */}
          <div className="rounded-2xl border border-border bg-bg-surface p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold">Selective Disclosure</span>
              <span className="text-xs font-mono text-text-muted">
                0b{bitmask.toString(2).padStart(3, "0")} = {bitmask}
              </span>
            </div>
            <div className="space-y-3">
              <FlagCheckbox
                label="Age >= 18"
                checked={flags.age}
                onChange={() => {}}
                locked
              />
              <FlagCheckbox
                label="Jurisdiction = HK"
                checked={flags.jurisdiction}
                onChange={() => {}}
                locked
              />
              <FlagCheckbox
                label="KYC Level >= 1 (optional)"
                checked={flags.kyc}
                onChange={(v) => setFlags((f) => ({ ...f, kyc: v }))}
              />
            </div>
            <p className="text-[10px] text-text-muted mt-2">
              Age and jurisdiction are required by this airdrop contract. KYC is optional -- toggle to prove more.
            </p>
          </div>
        </div>

        {/* Right: Prove + Claim */}
        <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {/* ZK Engine status */}
          <div className="flex items-center gap-2 text-xs">
            {zkEngine.ready ? (
              <>
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span className="text-accent font-medium">
                  ZK engine ready ({zkEngine.sizeLoaded})
                </span>
              </>
            ) : zkEngine.loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-text-muted animate-spin" />
                <span className="text-text-muted">Loading ZK engine...</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-error" />
                <span className="text-error">ZK engine failed to load</span>
              </>
            )}
          </div>

          {/* Main action button */}
          <button
            onClick={handleGenerateAndClaim}
            disabled={isWorking || !zkEngine.ready || !holderSecret || claim.status === "done"}
            className="w-full py-4 rounded-xl bg-accent text-bg-base font-bold text-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
          >
            {prover.status === "generating" && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating ZK Proof...
              </>
            )}
            {claim.status === "connecting" && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting wallet...
              </>
            )}
            {claim.status === "switching-chain" && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Switching to HashKey Chain...
              </>
            )}
            {claim.status === "sending" && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting proof on-chain...
              </>
            )}
            {claim.status === "confirming" && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Confirming transaction...
              </>
            )}
            {claim.status === "done" && (
              <>
                <CheckCircle className="w-5 h-5" />
                Claimed!
              </>
            )}
            {!isWorking && claim.status !== "done" && prover.status !== "generating" && (
              <>
                <Fingerprint className="w-5 h-5" />
                Generate Proof &amp; Claim {CLAIM_AMOUNT} ZKPT
              </>
            )}
          </button>

          {/* Prover status */}
          {prover.status === "generating" && prover.statusMessage && (
            <div className="rounded-xl border border-border bg-bg-surface p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
                <span className="text-xs font-medium text-text-secondary">
                  {prover.statusMessage}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-bg-input overflow-hidden">
                <div className="h-full bg-accent rounded-full animate-pulse-glow" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {/* Proof result */}
          {prover.result && claim.status !== "done" && (
            <div className="rounded-xl border border-border-accent bg-bg-surface p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-accent">Proof Generated</span>
              </div>
              <p className="font-mono text-xs text-text-muted truncate">
                Nullifier: {prover.result.publicSignals[0]?.slice(0, 24)}...
              </p>
            </div>
          )}

          {/* Success state */}
          {claim.status === "done" && claim.txHash && (
            <div className="rounded-2xl border border-accent bg-accent-dim p-6 text-center animate-fade-in-up">
              <Coins className="w-10 h-10 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-1">Airdrop Claimed!</h3>
              <p className="text-sm text-text-secondary mb-4">
                {CLAIM_AMOUNT} ZKPT tokens sent to your wallet.
              </p>
              <a
                href={`${HASHKEY_TESTNET.explorerUrl}/tx/${claim.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline"
              >
                {claim.txHash.slice(0, 10)}...{claim.txHash.slice(-8)}
                <ExternalLink className="w-3 h-3" />
              </a>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-text-muted">
                  Try claiming again to see the sybil resistance in action.
                </p>
                <button
                  onClick={() => {
                    claim.reset();
                    prover.reset();
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Error states */}
          {(prover.error || claim.error) && (
            <div className="rounded-xl border border-error bg-error-dim p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                <span className="text-sm font-medium text-error">
                  {claim.error?.includes("AlreadyClaimed")
                    ? "Already Claimed!"
                    : prover.error?.includes("Assert Failed")
                    ? "Proof Generation Failed"
                    : "Error"}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {prover.error?.includes("Assert Failed")
                  ? "Your credential does not satisfy the selected disclosure checks. This can happen if:"
                  : claim.error || prover.error}
              </p>
              {prover.error?.includes("Assert Failed") && (
                <ul className="text-xs text-text-secondary mt-2 space-y-1 list-none">
                  {flags.age && (
                    <li className="flex items-center gap-1.5">
                      {selectedCredential && selectedCredential.age >= 18
                        ? <CheckCircle className="w-3 h-3 text-accent flex-shrink-0" />
                        : <XCircle className="w-3 h-3 text-error flex-shrink-0" />}
                      Age {'>='} 18 (yours: {selectedCredential?.age})
                    </li>
                  )}
                  {flags.jurisdiction && (
                    <li className="flex items-center gap-1.5">
                      {selectedCredential && selectedCredential.jurisdictionCode === 852
                        ? <CheckCircle className="w-3 h-3 text-accent flex-shrink-0" />
                        : <XCircle className="w-3 h-3 text-error flex-shrink-0" />}
                      Jurisdiction = HK/852 (yours: {selectedCredential?.jurisdictionCode})
                    </li>
                  )}
                  {flags.kyc && (
                    <li className="flex items-center gap-1.5">
                      {selectedCredential && selectedCredential.kycLevel >= 1
                        ? <CheckCircle className="w-3 h-3 text-accent flex-shrink-0" />
                        : <XCircle className="w-3 h-3 text-error flex-shrink-0" />}
                      KYC Level {'>='} 1 (yours: {selectedCredential?.kycLevel})
                    </li>
                  )}
                  <li className="text-text-muted pt-1">
                    Uncheck failing attributes or re-issue your credential with correct values.
                  </li>
                </ul>
              )}
              <button
                onClick={() => {
                  claim.reset();
                  prover.reset();
                }}
                className="mt-3 text-xs text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            </div>
          )}

          {/* Info box */}
          <div className="rounded-xl border border-border bg-bg-surface p-4 text-xs text-text-muted space-y-2">
            <p>
              <strong className="text-text-secondary">Holder binding:</strong> Your proof is bound to your identity secret.
              Stolen credentials are useless without it.
            </p>
            <p>
              <strong className="text-text-secondary">Nullifier:</strong> A deterministic hash of your identity + this airdrop.
              Same identity = same nullifier = one claim only, regardless of wallet.
            </p>
            <p>
              <strong className="text-text-secondary">Selective disclosure:</strong> Toggle checkboxes above to control
              which attributes are proven on-chain. Unchecked attributes stay private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-4 text-center">
      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold font-mono">{value}</p>
    </div>
  );
}

function FlagCheckbox({
  label,
  checked,
  onChange,
  locked,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
}) {
  return (
    <label className={`flex items-center gap-3 group ${locked ? "cursor-default" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={locked}
        className="checkbox-custom"
      />
      <span className={`text-sm transition-colors ${locked ? "text-text-muted" : "text-text-secondary group-hover:text-text-primary"}`}>
        {label}
        {locked && <span className="ml-1.5 text-[10px] text-accent font-medium">REQUIRED</span>}
      </span>
    </label>
  );
}
