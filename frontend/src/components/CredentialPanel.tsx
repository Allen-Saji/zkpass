"use client";

import { Shield, Lock, Check } from "lucide-react";
import { Credential } from "@/lib/types";
import { JURISDICTION_MAP, KYC_LEVEL_MAP } from "@/lib/constants";

interface CredentialPanelProps {
  credential: Credential | null;
  onLoad: () => void;
  loading: boolean;
}

function CredentialField({
  label,
  value,
  redacted = false,
  mono = true,
}: {
  label: string;
  value: string;
  redacted?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0">
      <span className="text-[13px] font-semibold uppercase tracking-[0.05em] text-text-muted">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {redacted && <Lock className="w-3 h-3 text-text-muted" />}
        <span
          className={`text-sm ${mono ? "font-mono" : ""} ${
            redacted ? "text-text-muted" : "text-text-primary"
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function CredentialPanel({ credential, onLoad, loading }: CredentialPanelProps) {
  return (
    <div
      className="bg-bg-surface border border-border rounded-2xl p-6 md:p-8 animate-fade-in-up"
      style={{ animationDelay: "100ms", animationFillMode: "both" }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-accent" />
        <h2 className="text-xl font-bold text-text-primary">Your Credential</h2>
      </div>

      {!credential ? (
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Load a demo credential to begin the verification process.
          </p>
          <button
            onClick={onLoad}
            disabled={loading}
            className="w-full cursor-pointer py-3 px-6 rounded-full border border-border text-text-primary font-semibold text-sm
              hover:border-border-hover hover:bg-bg-elevated transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed
              focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            {loading ? "Loading..." : "Load Demo Credential"}
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <CredentialField
            label="Holder"
            value={`${credential.holder.slice(0, 8)}...`}
          />
          <CredentialField label="Age" value="***" redacted />
          <CredentialField
            label="Jurisdiction"
            value={JURISDICTION_MAP[credential.jurisdictionCode] || credential.jurisdictionCode.toString()}
          />
          <CredentialField
            label="KYC Level"
            value={KYC_LEVEL_MAP[credential.kycLevel] || `Level ${credential.kycLevel}`}
          />
          <CredentialField
            label="Issued"
            value={new Date(credential.issuedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
            mono={false}
          />
          <CredentialField
            label="Signature"
            value="verified"
          />
          <div className="mt-4 flex items-center gap-1.5 text-xs text-accent font-mono">
            <Check className="w-3 h-3" />
            <span>Credential loaded and valid</span>
          </div>
        </div>
      )}
    </div>
  );
}
