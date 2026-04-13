"use client";

import { useState, useEffect } from "react";
import { Credential } from "@/lib/types";
import { JURISDICTION_MAP, KYC_LEVEL_MAP, ISSUER_NAME } from "@/lib/constants";
import { getOrCreateHolderSecret, saveCredential, exportCredential } from "@/lib/credentialStore";
import { computeIdentityCommitment } from "@/lib/poseidon";
import { PassportCard } from "@/components/PassportCard";
import { Shield, Loader2, Download, CheckCircle, AlertCircle, Key } from "lucide-react";
import Link from "next/link";

type IssueStatus = "idle" | "computing" | "signing" | "done" | "error";

export default function IssuePage() {
  const [holder, setHolder] = useState("");
  const [age, setAge] = useState(25);
  const [jurisdictionCode, setJurisdictionCode] = useState(852);
  const [kycLevel, setKycLevel] = useState(2);
  const [status, setStatus] = useState<IssueStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [holderSecret, setHolderSecret] = useState<string | null>(null);

  useEffect(() => {
    const secret = getOrCreateHolderSecret();
    setHolderSecret(secret);
  }, []);

  const handleIssue = async () => {
    if (!holderSecret) return;
    setStatus("computing");
    setError(null);
    setCredential(null);

    try {
      // Compute identity commitment in browser
      const identityCommitment = await computeIdentityCommitment(holderSecret);

      setStatus("signing");

      // Call backend issuer API
      const res = await fetch("/api/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holder: holder || "0xDemoUser",
          age,
          jurisdictionCode,
          kycLevel,
          identityCommitment,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to issue credential");
      }

      const { credential: cred } = await res.json();
      setCredential(cred);
      saveCredential(cred);
      setStatus("done");
    } catch (err: any) {
      setError(err.message || "Failed to issue credential");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">Get Your Identity Credential</h1>
        <p className="text-text-secondary">
          Simulates a licensed KYC provider verifying your identity and issuing a signed credential.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Issuer Form */}
        <div className="rounded-2xl border border-border bg-bg-surface p-6 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">
              KYC Provider Portal
            </span>
          </div>

          <p className="text-xs text-text-muted mb-6">
            In production, this would be a licensed KYC provider (e.g., HashKey, Jumio).
            The credential is signed server-side with the issuer&apos;s private key.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1.5">
                Holder Address
              </label>
              <input
                type="text"
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                placeholder="0xDemoUser"
                className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-sm font-mono focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={1}
                  max={150}
                  className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-sm font-mono focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1.5">
                  Jurisdiction
                </label>
                <select
                  value={jurisdictionCode}
                  onChange={(e) => setJurisdictionCode(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-sm focus:border-accent focus:outline-none transition-colors"
                >
                  {Object.entries(JURISDICTION_MAP).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name} ({code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-text-secondary uppercase tracking-wider block mb-1.5">
                  KYC Level
                </label>
                <select
                  value={kycLevel}
                  onChange={(e) => setKycLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border text-sm focus:border-accent focus:outline-none transition-colors"
                >
                  {Object.entries(KYC_LEVEL_MAP)
                    .filter(([k]) => Number(k) > 0)
                    .map(([level, name]) => (
                      <option key={level} value={level}>
                        {name} ({level})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Holder secret display */}
            {holderSecret && (
              <div className="rounded-lg bg-bg-base border border-border p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Key className="w-3 h-3 text-warning" />
                  <span className="text-xs text-warning font-medium">Your Identity Secret</span>
                </div>
                <p className="text-[10px] text-text-muted mb-1">
                  Generated locally. Never sent to any server. Back this up.
                </p>
                <p className="font-mono text-[10px] text-text-secondary break-all select-all">
                  {holderSecret.slice(0, 40)}...
                </p>
              </div>
            )}

            <button
              onClick={handleIssue}
              disabled={status === "computing" || status === "signing"}
              className="w-full py-3 rounded-xl bg-accent text-bg-base font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {status === "computing" && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Computing identity commitment...
                </>
              )}
              {status === "signing" && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing credential...
                </>
              )}
              {(status === "idle" || status === "done" || status === "error") && (
                <>
                  <Shield className="w-4 h-4" />
                  Verify &amp; Issue Credential
                </>
              )}
            </button>

            {error && (
              <div className="flex items-center gap-2 text-error text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right: Credential Result */}
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {!credential && status !== "done" && (
            <div className="rounded-2xl border border-border border-dashed bg-bg-surface/50 p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <Shield className="w-12 h-12 text-text-muted mb-4" />
              <p className="text-text-muted text-sm">
                Your credential will appear here after issuance
              </p>
            </div>
          )}

          {credential && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Credential Issued</span>
              </div>

              <PassportCard credential={credential} />

              <div className="flex gap-3">
                <button
                  onClick={() => exportCredential(credential)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </button>
                <Link
                  href="/claim"
                  className="flex-1 py-2.5 rounded-xl bg-accent text-bg-base text-sm font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  Claim Airdrop
                </Link>
              </div>

              <p className="text-xs text-text-muted text-center">
                Credential saved to your browser. You can now claim the airdrop.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
