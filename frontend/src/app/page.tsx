"use client";

import Link from "next/link";
import {
  Shield,
  UserCheck,
  Fingerprint,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Coins,
  Vote,
  Ticket,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-20 animate-fade-in-up">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          Prove who you are.
          <br />
          <span className="text-accent">Reveal nothing.</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8">
          ZKPass is a zero-knowledge identity protocol. Get a credential once,
          prove any attribute on any chain -- without exposing your data.
          Selective disclosure, holder binding, sybil resistance. All in the browser.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/issue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-base font-semibold rounded-xl hover:brightness-110 transition-all"
          >
            Try the Demo
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text-secondary font-medium rounded-xl hover:border-border-hover hover:text-text-primary transition-all"
          >
            Open Wallet
          </Link>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-20">
        <Link href="/how-it-works" className="block text-sm font-semibold text-accent uppercase tracking-widest text-center mb-10 hover:underline underline-offset-4">
          How it works
        </Link>
        <div className="grid md:grid-cols-3 gap-6">
          <StepCard
            icon={<UserCheck className="w-6 h-6" />}
            step="01"
            title="Get a Credential"
            description="A trusted issuer verifies your identity and signs a credential with EdDSA. Bound to your secret -- only you can use it."
            delay={0}
          />
          <StepCard
            icon={<Fingerprint className="w-6 h-6" />}
            step="02"
            title="Selective Disclosure"
            description="Choose which attributes to prove. Age >= 18 without revealing your birthday. Jurisdiction without revealing KYC level. You control what's shared."
            delay={100}
          />
          <StepCard
            icon={<Lock className="w-6 h-6" />}
            step="03"
            title="Verify On-Chain"
            description="Submit a Groth16 proof to any EVM chain. The contract verifies the math, checks the issuer registry, and enforces one-proof-per-identity via nullifiers."
            delay={200}
          />
        </div>
      </div>

      {/* What makes it different */}
      <div className="mb-20">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-widest text-center mb-10">
          What makes it real
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <FeatureCard
            icon={<Lock className="w-5 h-5" />}
            title="Holder Binding"
            description="Credentials are bound to your identity secret via Poseidon hash. Stolen credential JSON is useless without the secret."
          />
          <FeatureCard
            icon={<Fingerprint className="w-5 h-5" />}
            title="Nullifier-Based Sybil Resistance"
            description="Deterministic nullifier per identity per scope. Same person, 100 wallets, still only one claim."
          />
          <FeatureCard
            icon={<Eye className="w-5 h-5" />}
            title="Selective Disclosure"
            description="3-bit bitmask controls which attributes are proven. Unset flags skip the constraint entirely. The verifier never sees hidden attributes."
          />
          <FeatureCard
            icon={<Shield className="w-5 h-5" />}
            title="On-Chain Issuer Registry"
            description="Trusted issuer public keys registered on-chain. Proofs from unregistered issuers are rejected. Issuers can be revoked."
          />
        </div>
      </div>

      {/* Use cases */}
      <div className="mb-20">
        <h2 className="text-sm font-semibold text-accent uppercase tracking-widest text-center mb-10">
          Use cases
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <UseCaseCard
            icon={<Coins className="w-5 h-5" />}
            title="Sybil-Resistant Airdrops"
            description="One claim per identity, regardless of wallets."
            active
          />
          <UseCaseCard
            icon={<Vote className="w-5 h-5" />}
            title="Private DAO Voting"
            description="Prove membership, vote anonymously, one-person-one-vote."
          />
          <UseCaseCard
            icon={<Ticket className="w-5 h-5" />}
            title="Compliance Gating"
            description="KYC-gated DeFi pools, token sales, or restricted content."
          />
        </div>
      </div>

      {/* Architecture callout */}
      <div className="rounded-2xl border border-border bg-bg-surface p-8 text-center mb-12">
        <Shield className="w-8 h-8 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Built with real cryptography</h3>
        <p className="text-text-secondary max-w-xl mx-auto text-sm">
          Groth16 proofs over BN254. EdDSA signatures on Baby JubJub.
          Poseidon hashing for credentials, nullifiers, and identity commitments.
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

      {/* Demo CTA */}
      <div className="text-center">
        <p className="text-sm text-text-muted mb-4">
          This demo showcases the full flow: credential issuance, identity wallet, selective disclosure, and a sybil-resistant airdrop claim on HashKey Chain Testnet.
        </p>
        <Link
          href="/issue"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-base font-semibold rounded-xl hover:brightness-110 transition-all"
        >
          Try it Now
          <ArrowRight className="w-4 h-4" />
        </Link>
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5 flex gap-4">
      <div className="w-9 h-9 rounded-lg bg-accent-dim flex items-center justify-center text-accent flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function UseCaseCard({
  icon,
  title,
  description,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 text-center ${
        active
          ? "border-accent bg-accent-dim"
          : "border-border bg-bg-surface"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-3 ${
          active ? "bg-accent text-bg-base" : "bg-accent-dim text-accent"
        }`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-text-secondary">{description}</p>
      {active && (
        <span className="inline-block mt-2 text-[10px] text-accent font-medium uppercase tracking-wider">
          Live Demo
        </span>
      )}
    </div>
  );
}
