"use client";

import Link from "next/link";
import { Shield, UserCheck, Fingerprint, Coins, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-20 animate-fade-in-up">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          Airdrops for <span className="text-accent">people</span>,<br />
          not wallets.
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
          100 wallets, 1 person, 100 claims. That&apos;s broken.
          ZKPass ties airdrop eligibility to verified identity -- not addresses.
          Prove you&apos;re a real person, claim once. Zero data leaked.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/issue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-base font-semibold rounded-xl hover:brightness-110 transition-all"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/claim"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-secondary font-medium rounded-xl hover:border-border-hover hover:text-text-primary transition-all"
          >
            Claim Airdrop
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-20">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-widest text-center mb-10">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard
            icon={<UserCheck className="w-6 h-6" />}
            step="01"
            title="Get Verified"
            description="A trusted KYC provider verifies your identity and signs a credential with EdDSA. Your data stays with you."
            delay={0}
          />
          <StepCard
            icon={<Fingerprint className="w-6 h-6" />}
            step="02"
            title="Generate ZK Proof"
            description="Prove you meet requirements (age, jurisdiction, KYC) without revealing actual values. Proof generated in your browser."
            delay={100}
          />
          <StepCard
            icon={<Coins className="w-6 h-6" />}
            step="03"
            title="Claim Once"
            description="Submit your proof on-chain. The nullifier ensures one claim per identity -- regardless of how many wallets you have."
            delay={200}
          />
        </div>
      </div>

      {/* Architecture callout */}
      <div className="rounded-2xl border border-border bg-bg-surface p-8 text-center">
        <Shield className="w-8 h-8 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Built with real cryptography</h3>
        <p className="text-text-secondary max-w-xl mx-auto text-sm">
          Groth16 ZK proofs over BN254. EdDSA credential signatures on Baby JubJub.
          On-chain issuer registry. Poseidon-based nullifiers for sybil resistance.
          10,303 constraints. Verified on HashKey Chain.
        </p>
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-text-muted font-mono">
          <span>Circom 2.0</span>
          <span className="text-border">|</span>
          <span>snarkjs</span>
          <span className="text-border">|</span>
          <span>Solidity 0.8.20</span>
          <span className="text-border">|</span>
          <span>HashKey Chain</span>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  icon,
  step,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="rounded-2xl border border-border bg-bg-surface p-6 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center text-accent">
          {icon}
        </div>
        <span className="text-xs font-mono text-text-muted">{step}</span>
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
