"use client";

import { ArchitectureFlow } from "@/components/ArchitectureFlow";
import {
  Shield,
  Lock,
  Fingerprint,
  Eye,
  Key,
  Hash,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">How ZKPass Works</h1>
        <p className="text-text-secondary">
          A deep dive into the cryptography, architecture, and trust model behind ZKPass.
        </p>
      </div>

      {/* Animated Architecture Flow */}
      <div className="mb-16 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <h2 className="text-sm font-semibold text-accent uppercase tracking-widest text-center mb-6">
          System Architecture
        </h2>
        <div className="rounded-2xl border border-border bg-bg-surface p-4 overflow-hidden">
          <ArchitectureFlow />
        </div>
        <p className="text-xs text-text-muted text-center mt-3">
          Click the dots or wait for the animation to step through the flow.
        </p>
      </div>

      {/* Deep dives */}
      <div className="space-y-12">

        {/* 1. Credential Issuance */}
        <Section
          icon={<Shield className="w-5 h-5" />}
          number="01"
          title="Credential Issuance"
          subtitle="How credentials are created and signed"
        >
          <p>
            A trusted KYC provider verifies your real-world identity (passport, ID scan, liveness check)
            and creates a credential containing your attributes.
          </p>
          <CodeBlock>{`credential = {
  age: 25,
  jurisdictionCode: 852,    // Hong Kong
  kycLevel: 2,              // Full KYC
  identityCommitment: "..."  // binds to your secret
}`}</CodeBlock>
          <p>
            The issuer computes a Poseidon hash of these attributes and signs it with EdDSA
            on the Baby JubJub elliptic curve:
          </p>
          <CodeBlock>{`credHash = Poseidon(age, jurisdiction, kycLevel, identityCommitment)
signature = EdDSA.sign(issuerPrivateKey, credHash)
// signature = { R8: [x, y], S: scalar }`}</CodeBlock>
          <p>
            The credential JSON is returned to you. The issuer&apos;s private key stays on the server.
            Your actual attributes are never stored on-chain.
          </p>
          <Callout type="info">
            In this demo, the issuer is a Next.js API route. In production, it would be a licensed
            KYC provider like HashKey, Jumio, or Sumsub.
          </Callout>
        </Section>

        {/* 2. Holder Binding */}
        <Section
          icon={<Key className="w-5 h-5" />}
          number="02"
          title="Holder Binding"
          subtitle="Why stolen credentials are useless"
        >
          <p>
            Before requesting a credential, you generate a random <Code>holderSecret</Code> --
            32 bytes of entropy that never leaves your device. Your identity commitment is derived from it:
          </p>
          <CodeBlock>{`holderSecret = random(32 bytes)
identityCommitment = Poseidon(holderSecret)
// This commitment is included in the credential hash`}</CodeBlock>
          <p>
            The credential hash is <Code>Poseidon(age, jurisdiction, kycLevel, identityCommitment)</Code>.
            The issuer signs over this hash. To generate a valid ZK proof, you must know the
            <Code>holderSecret</Code> that produces the correct <Code>identityCommitment</Code>.
          </p>
          <div className="grid md:grid-cols-2 gap-4 my-4">
            <div className="rounded-xl border border-border bg-bg-base p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-error" />
                <span className="text-sm font-semibold text-error">Without holder binding</span>
              </div>
              <p className="text-xs text-text-secondary">
                Anyone who gets your credential JSON can generate proofs as you.
                Steal the JSON from localStorage = steal your identity.
              </p>
            </div>
            <div className="rounded-xl border border-border-accent bg-bg-base p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">With holder binding</span>
              </div>
              <p className="text-xs text-text-secondary">
                The credential is cryptographically bound to your secret.
                Without <Code>holderSecret</Code>, the proof generation fails inside the circuit.
              </p>
            </div>
          </div>
        </Section>

        {/* 3. Selective Disclosure */}
        <Section
          icon={<Eye className="w-5 h-5" />}
          number="03"
          title="Selective Disclosure"
          subtitle="Prove what you want, hide the rest"
        >
          <p>
            A 3-bit bitmask controls which attributes are proven:
          </p>
          <div className="grid grid-cols-3 gap-3 my-4">
            <BitmaskCard bit={0} label="Age >= 18" example="0b001 = 1" />
            <BitmaskCard bit={1} label="Jurisdiction = HK" example="0b010 = 2" />
            <BitmaskCard bit={2} label="KYC >= 1" example="0b100 = 4" />
          </div>
          <p>
            Inside the circuit, each check is conditionally enforced using a simple but elegant pattern:
          </p>
          <CodeBlock>{`// Circom constraint
flagBits.out[0] * (1 - ageCheck.out) === 0

// When flag = 1: ageCheck.out MUST be 1 (enforced)
// When flag = 0: 0 * anything === 0 (skipped)`}</CodeBlock>
          <p>
            Setting <Code>disclosureFlags = 0b011 = 3</Code> proves &quot;age &gt;= 18 AND jurisdiction = HK&quot;
            without revealing your KYC level. The verifier on-chain never sees the hidden attribute --
            it doesn&apos;t even know what value was skipped.
          </p>
        </Section>

        {/* 4. Nullifiers */}
        <Section
          icon={<Fingerprint className="w-5 h-5" />}
          number="04"
          title="Nullifier-Based Sybil Resistance"
          subtitle="One identity, one claim, many wallets"
        >
          <p>
            The circuit computes a deterministic nullifier from your secret and the airdrop scope:
          </p>
          <CodeBlock>{`nullifierHash = Poseidon(holderSecret, externalNullifier)

// externalNullifier = keccak256(airdropContractAddress) % fieldOrder
// Deterministic: same identity + same airdrop = same nullifier
// Different airdrop = different nullifier = unlinkable`}</CodeBlock>
          <p>
            The ZKAirdrop contract stores used nullifiers in a mapping. When you claim:
          </p>
          <CodeBlock>{`// Solidity
if (usedNullifiers[nullifierHash]) revert AlreadyClaimed();
usedNullifiers[nullifierHash] = true;`}</CodeBlock>
          <div className="rounded-xl border border-border bg-bg-base p-4 my-4">
            <h4 className="text-sm font-semibold mb-3">Why this works against sybils:</h4>
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex items-start gap-2">
                <span className="text-accent font-mono mt-0.5">1.</span>
                <span>Alice has 100 wallets but ONE holderSecret</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent font-mono mt-0.5">2.</span>
                <span>She claims from wallet #1 -- nullifier is stored on-chain</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent font-mono mt-0.5">3.</span>
                <span>She tries from wallet #47 -- same secret = same nullifier = REJECTED</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent font-mono mt-0.5">4.</span>
                <span>Bob has a different holderSecret -- different nullifier -- he can claim fine</span>
              </div>
            </div>
          </div>
          <Callout type="info">
            Different <Code>externalNullifier</Code> per airdrop means nullifiers are unlinkable
            across airdrops. No one can correlate that Alice claimed both Airdrop A and Airdrop B.
          </Callout>
        </Section>

        {/* 5. On-Chain Verification */}
        <Section
          icon={<Hash className="w-5 h-5" />}
          number="05"
          title="On-Chain Verification"
          subtitle="What happens when you submit the proof"
        >
          <p>
            The Groth16 proof is verified on-chain using the EIP-197 BN254 pairing precompile.
            The verifier checks the pairing equation:
          </p>
          <CodeBlock>{`e(pi_a, pi_b) == e(alpha, beta) * e(vk_x, gamma) * e(pi_c, delta)

// vk_x = IC[0] + sum(IC[i] * publicSignal[i])
// Uses ecPairing precompile at address 0x08
// Cost: ~200-300k gas`}</CodeBlock>
          <p>The full verification pipeline in <Code>ZKAirdrop.claim()</Code>:</p>
          <div className="space-y-3 my-4">
            <PipelineStep step={1} title="Scope Check" description="externalNullifier matches this airdrop contract" status="gate" />
            <PipelineStep step={2} title="Proof Verification" description="Groth16Verifier.verifyProof(a, b, c, signals) -- BN254 pairing math" status="gate" />
            <PipelineStep step={3} title="Issuer Check" description="IssuerRegistry.isActiveIssuer(issuerPubKeyHash) -- trusted issuer?" status="gate" />
            <PipelineStep step={4} title="Nullifier Check" description="usedNullifiers[nullifierHash] == false -- first claim?" status="gate" />
            <PipelineStep step={5} title="Token Transfer" description="ERC-20 transfer of 100 ZKPT to msg.sender" status="result" />
          </div>
          <p>
            8 public signals are visible on-chain. Everything else -- your age, jurisdiction,
            KYC level, and holder secret -- stays hidden inside the zero-knowledge proof.
          </p>
        </Section>

        {/* 6. Circuit Internals */}
        <Section
          icon={<Lock className="w-5 h-5" />}
          number="06"
          title="Inside the Circuit"
          subtitle="10,303 constraints that make it all work"
        >
          <p>
            The ZKPassVerifier circuit has 9 private inputs, 6 public inputs, and 2 public outputs.
            Here&apos;s what each constraint group does:
          </p>
          <div className="space-y-2 my-4">
            <ConstraintRow name="Identity commitment" constraints="~250" description="Poseidon(holderSecret)" />
            <ConstraintRow name="Nullifier hash" constraints="~500" description="Poseidon(holderSecret, externalNullifier)" />
            <ConstraintRow name="Credential hash" constraints="~1,000" description="Poseidon(age, jurisdiction, kycLevel, identityCommitment)" />
            <ConstraintRow name="Issuer key hash" constraints="~600" description="Poseidon(pubKey[0], pubKey[1])" />
            <ConstraintRow name="EdDSA signature" constraints="~7,000" description="EdDSAPoseidonVerifier over credential hash" />
            <ConstraintRow name="Disclosure checks" constraints="~950" description="Bitmask + GreaterEqThan + IsEqual" />
          </div>
          <p className="text-xs text-text-muted">
            EdDSA verification dominates (~68% of constraints). The selective disclosure logic is lightweight.
            Total proving time: ~2-3 seconds in browser via WASM web worker.
          </p>
        </Section>
      </div>

      {/* CTA */}
      <div className="text-center mt-16 pt-12 border-t border-border">
        <h2 className="text-xl font-bold mb-3">See it in action</h2>
        <p className="text-text-secondary text-sm mb-6 max-w-lg mx-auto">
          Get a credential, generate a ZK proof with selective disclosure,
          and claim tokens on HashKey Chain Testnet.
        </p>
        <Link
          href="/issue"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-bg-base font-semibold rounded-xl hover:brightness-110 transition-all"
        >
          Try the Demo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// --- Sub-components ---

function Section({
  icon,
  number,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  number: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-accent-dim flex items-center justify-center text-accent">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-text-muted">{number}</span>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="pl-[52px] space-y-3 text-sm text-text-secondary leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-xl bg-bg-base border border-border p-4 overflow-x-auto text-xs font-mono text-text-secondary leading-relaxed my-3">
      {children}
    </pre>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded bg-bg-elevated text-accent text-xs font-mono">
      {children}
    </code>
  );
}

function Callout({ children, type }: { children: React.ReactNode; type: "info" | "warning" }) {
  return (
    <div
      className={`rounded-xl border p-4 text-xs my-3 ${
        type === "info"
          ? "border-accent/20 bg-accent-dim text-text-secondary"
          : "border-warning/20 bg-warning/5 text-text-secondary"
      }`}
    >
      {children}
    </div>
  );
}

function BitmaskCard({ bit, label, example }: { bit: number; label: string; example: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-base p-3 text-center">
      <div className="text-lg font-mono font-bold text-accent mb-1">bit {bit}</div>
      <div className="text-xs font-medium text-text-primary mb-0.5">{label}</div>
      <div className="text-[10px] font-mono text-text-muted">{example}</div>
    </div>
  );
}

function PipelineStep({
  step,
  title,
  description,
  status,
}: {
  step: number;
  title: string;
  description: string;
  status: "gate" | "result";
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold ${
          status === "result"
            ? "bg-accent text-bg-base"
            : "bg-accent-dim text-accent"
        }`}
      >
        {step}
      </div>
      <div>
        <span className="text-sm font-semibold">{title}</span>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </div>
  );
}

function ConstraintRow({
  name,
  constraints,
  description,
}: {
  name: string;
  constraints: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-bg-base border border-border px-4 py-2.5">
      <span className="font-mono text-xs text-accent w-16 text-right flex-shrink-0">{constraints}</span>
      <div className="w-px h-6 bg-border" />
      <div>
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-text-muted ml-2">{description}</span>
      </div>
    </div>
  );
}
