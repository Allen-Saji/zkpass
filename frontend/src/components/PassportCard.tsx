"use client";

import { Credential } from "@/lib/types";
import { JURISDICTION_MAP, KYC_LEVEL_MAP, ISSUER_NAME } from "@/lib/constants";
import { Shield, Lock, CheckCircle } from "lucide-react";

interface PassportCardProps {
  credential: Credential;
  redactedFields?: Set<string>;
  compact?: boolean;
}

export function PassportCard({ credential, redactedFields, compact }: PassportCardProps) {
  const isRedacted = (field: string) => redactedFields?.has(field) ?? false;

  return (
    <div className="passport-card relative overflow-hidden rounded-2xl border border-border-accent bg-bg-surface p-6">
      {/* Holographic shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none passport-shimmer opacity-20" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">
            ZK Identity Credential
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs text-accent font-medium">Verified</span>
        </div>
      </div>

      {/* Fields */}
      <div className={`relative grid ${compact ? "gap-3" : "gap-4"}`}>
        <PassportField
          label="Holder"
          value={credential.holder}
          mono
          truncate
        />
        <div className="grid grid-cols-3 gap-3">
          <PassportField
            label="Age"
            value={isRedacted("age") ? "***" : credential.age.toString()}
            locked={isRedacted("age")}
          />
          <PassportField
            label="Jurisdiction"
            value={
              isRedacted("jurisdiction")
                ? "***"
                : JURISDICTION_MAP[credential.jurisdictionCode] ||
                  credential.jurisdictionCode.toString()
            }
            locked={isRedacted("jurisdiction")}
          />
          <PassportField
            label="KYC Level"
            value={
              isRedacted("kyc")
                ? "***"
                : KYC_LEVEL_MAP[credential.kycLevel] || credential.kycLevel.toString()
            }
            locked={isRedacted("kyc")}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <PassportField
            label="Issued"
            value={new Date(credential.issuedAt).toLocaleDateString()}
          />
          <PassportField label="Issuer" value={ISSUER_NAME} />
        </div>

        {!compact && (
          <div className="pt-2 border-t border-border">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              Identity Commitment
            </span>
            <p className="font-mono text-xs text-text-secondary mt-0.5 truncate">
              {credential.identityCommitment}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PassportField({
  label,
  value,
  mono,
  truncate,
  locked,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
  locked?: boolean;
}) {
  return (
    <div>
      <span className="text-[10px] text-text-muted uppercase tracking-wider flex items-center gap-1">
        {label}
        {locked && <Lock className="w-2.5 h-2.5" />}
      </span>
      <p
        className={`text-sm mt-0.5 transition-all duration-300 ${
          mono ? "font-mono" : ""
        } ${truncate ? "truncate" : ""} ${
          locked
            ? "text-text-muted blur-[2px] select-none"
            : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
