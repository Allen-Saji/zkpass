"use client";

import { useEffect, useState } from "react";

// Animated architecture flow showing the ZKPass pipeline
export function ArchitectureFlow() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 900 340"
        className="w-full min-w-[700px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Animated dash */}
          <style>{`
            .flow-line { stroke-dasharray: 8 4; }
            .flow-line-active { animation: dashFlow 1s linear infinite; }
            @keyframes dashFlow { to { stroke-dashoffset: -24; } }
            .node-pulse { animation: nodePulse 2s ease-in-out infinite; }
            @keyframes nodePulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
            .fade-in { animation: fadeIn 500ms ease-out forwards; }
          `}</style>
        </defs>

        {/* Background regions */}
        {/* Off-chain region */}
        <rect x="10" y="10" width="560" height="320" rx="16" fill="#1A1B1F" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <text x="30" y="38" fill="rgba(224,232,255,0.3)" fontSize="11" fontFamily="monospace">OFF-CHAIN</text>

        {/* On-chain region */}
        <rect x="590" y="10" width="300" height="320" rx="16" fill="rgba(108,255,50,0.03)" stroke="rgba(108,255,50,0.15)" strokeWidth="1" />
        <text x="610" y="38" fill="rgba(108,255,50,0.4)" fontSize="11" fontFamily="monospace">ON-CHAIN (HashKey)</text>

        {/* Step 1: Issuer */}
        <g className={activeStep === 0 ? "node-pulse" : ""}>
          <rect x="40" y="70" width="140" height="80" rx="12" fill={activeStep === 0 ? "#222226" : "#1e1e22"} stroke={activeStep === 0 ? "#6CFF32" : "rgba(255,255,255,0.08)"} strokeWidth={activeStep === 0 ? 2 : 1} />
          <text x="110" y="100" textAnchor="middle" fill={activeStep === 0 ? "#6CFF32" : "#fff"} fontSize="13" fontWeight="600">KYC Issuer</text>
          <text x="110" y="120" textAnchor="middle" fill="rgba(224,232,255,0.5)" fontSize="10">EdDSA Sign</text>
          <text x="110" y="135" textAnchor="middle" fill="rgba(224,232,255,0.3)" fontSize="9">Baby JubJub</text>
        </g>

        {/* Arrow 1: Issuer -> Credential */}
        <line x1="180" y1="110" x2="220" y2="110" className={`flow-line ${activeStep === 0 ? "flow-line-active" : ""}`} stroke={activeStep === 0 ? "#6CFF32" : "rgba(255,255,255,0.15)"} strokeWidth="2" />
        <polygon points="218,105 228,110 218,115" fill={activeStep === 0 ? "#6CFF32" : "rgba(255,255,255,0.15)"} />
        {activeStep === 0 && <text x="205" y="95" textAnchor="start" fill="#6CFF32" fontSize="9" fontFamily="monospace">credential</text>}

        {/* Step 2: Credential + Secret */}
        <g className={activeStep === 1 ? "node-pulse" : ""}>
          <rect x="230" y="60" width="150" height="100" rx="12" fill={activeStep === 1 ? "#222226" : "#1e1e22"} stroke={activeStep === 1 ? "#6CFF32" : "rgba(255,255,255,0.08)"} strokeWidth={activeStep === 1 ? 2 : 1} />
          <text x="305" y="88" textAnchor="middle" fill={activeStep === 1 ? "#6CFF32" : "#fff"} fontSize="13" fontWeight="600">User Browser</text>
          <text x="305" y="108" textAnchor="middle" fill="rgba(224,232,255,0.5)" fontSize="9">holderSecret (private)</text>
          <text x="305" y="123" textAnchor="middle" fill="rgba(224,232,255,0.5)" fontSize="9">identityCommitment</text>
          <text x="305" y="148" textAnchor="middle" fill="rgba(224,232,255,0.3)" fontSize="9">Poseidon(secret)</text>
        </g>

        {/* Arrow 2: Browser -> ZK Proof */}
        <line x1="305" y1="160" x2="305" y2="195" className={`flow-line ${activeStep === 1 ? "flow-line-active" : ""}`} stroke={activeStep === 1 ? "#6CFF32" : "rgba(255,255,255,0.15)"} strokeWidth="2" />
        <polygon points="300,193 305,203 310,193" fill={activeStep === 1 ? "#6CFF32" : "rgba(255,255,255,0.15)"} />
        {activeStep === 1 && <text x="330" y="182" fill="#6CFF32" fontSize="8" fontFamily="monospace">witness</text>}

        {/* Step 3: ZK Proof Generation */}
        <g className={activeStep === 2 ? "node-pulse" : ""}>
          <rect x="220" y="205" width="170" height="100" rx="12" fill={activeStep === 2 ? "#222226" : "#1e1e22"} stroke={activeStep === 2 ? "#6CFF32" : "rgba(255,255,255,0.08)"} strokeWidth={activeStep === 2 ? 2 : 1} />
          <text x="305" y="232" textAnchor="middle" fill={activeStep === 2 ? "#6CFF32" : "#fff"} fontSize="13" fontWeight="600">ZK Proof Engine</text>
          <text x="305" y="252" textAnchor="middle" fill="rgba(224,232,255,0.5)" fontSize="9">snarkjs Groth16</text>
          <text x="305" y="267" textAnchor="middle" fill="rgba(224,232,255,0.5)" fontSize="9">10,303 constraints</text>
          <text x="305" y="282" textAnchor="middle" fill="rgba(224,232,255,0.3)" fontSize="9">WASM Web Worker</text>
          <text x="305" y="296" textAnchor="middle" fill="rgba(224,232,255,0.3)" fontSize="8">disclosure bitmask: 0b101</text>
        </g>

        {/* Arrow 3: Proof -> Selective Disclosure labels */}
        {/* Outputs box */}
        <g className={activeStep === 2 ? "node-pulse" : ""}>
          <rect x="40" y="210" width="160" height="90" rx="10" fill="transparent" stroke={activeStep === 2 ? "rgba(108,255,50,0.3)" : "rgba(255,255,255,0.06)"} strokeWidth="1" strokeDasharray="4 3" />
          <text x="120" y="232" textAnchor="middle" fill="rgba(224,232,255,0.4)" fontSize="9" fontWeight="600">PRIVATE (hidden)</text>
          <text x="120" y="252" textAnchor="middle" fill="rgba(224,232,255,0.3)" fontSize="9">age = 25</text>
          <text x="120" y="267" textAnchor="middle" fill="rgba(224,232,255,0.3)" fontSize="9">jurisdiction = 852</text>
          <text x="120" y="282" textAnchor="middle" fill="rgba(224,232,255,0.3)" fontSize="9">holderSecret = ****</text>
        </g>

        {/* Arrow 4: Proof -> On-chain */}
        <line x1="390" y1="255" x2="610" y2="120" className={`flow-line ${activeStep === 3 ? "flow-line-active" : ""}`} stroke={activeStep === 3 ? "#6CFF32" : "rgba(255,255,255,0.15)"} strokeWidth="2" />
        <polygon points="605,116 615,118 608,126" fill={activeStep === 3 ? "#6CFF32" : "rgba(255,255,255,0.15)"} />
        {activeStep === 3 && <text x="500" y="175" textAnchor="middle" fill="#6CFF32" fontSize="8" fontFamily="monospace" transform="rotate(-20, 500, 175)">proof (a, b, c) + signals</text>}

        {/* Step 4: On-chain Verification */}
        <g className={activeStep === 3 ? "node-pulse" : ""}>
          <rect x="610" y="60" width="270" height="80" rx="12" fill={activeStep === 3 ? "rgba(108,255,50,0.08)" : "rgba(108,255,50,0.03)"} stroke={activeStep === 3 ? "#6CFF32" : "rgba(108,255,50,0.15)"} strokeWidth={activeStep === 3 ? 2 : 1} />
          <text x="745" y="88" textAnchor="middle" fill={activeStep === 3 ? "#6CFF32" : "#fff"} fontSize="12" fontWeight="600">Groth16Verifier.sol</text>
          <text x="745" y="106" textAnchor="middle" fill="rgba(224,232,255,0.5)" fontSize="9">BN254 pairing check</text>
          <text x="745" y="120" textAnchor="middle" fill="rgba(224,232,255,0.5)" fontSize="9">e(A,B) = e(a,b) * e(vk,g) * e(C,d)</text>
        </g>

        {/* Arrow 5: Verifier -> Registry + Airdrop */}
        <line x1="745" y1="140" x2="745" y2="165" className={`flow-line ${activeStep === 3 ? "flow-line-active" : ""}`} stroke={activeStep === 3 ? "#6CFF32" : "rgba(108,255,50,0.15)"} strokeWidth="2" />

        {/* Step 5: Registry + Airdrop */}
        <g className={activeStep === 4 ? "node-pulse" : ""}>
          <rect x="610" y="170" width="130" height="70" rx="10" fill={activeStep === 4 ? "rgba(108,255,50,0.08)" : "rgba(108,255,50,0.03)"} stroke={activeStep === 4 ? "#6CFF32" : "rgba(108,255,50,0.15)"} strokeWidth={activeStep === 4 ? 2 : 1} />
          <text x="675" y="196" textAnchor="middle" fill={activeStep === 4 ? "#6CFF32" : "rgba(224,232,255,0.8)"} fontSize="11" fontWeight="600">IssuerRegistry</text>
          <text x="675" y="212" textAnchor="middle" fill="rgba(224,232,255,0.4)" fontSize="9">trusted issuers</text>
          <text x="675" y="226" textAnchor="middle" fill="rgba(224,232,255,0.3)" fontSize="8">isActiveIssuer()</text>
        </g>

        <g className={activeStep === 4 ? "node-pulse" : ""}>
          <rect x="750" y="170" width="130" height="70" rx="10" fill={activeStep === 4 ? "rgba(108,255,50,0.08)" : "rgba(108,255,50,0.03)"} stroke={activeStep === 4 ? "#6CFF32" : "rgba(108,255,50,0.15)"} strokeWidth={activeStep === 4 ? 2 : 1} />
          <text x="815" y="196" textAnchor="middle" fill={activeStep === 4 ? "#6CFF32" : "rgba(224,232,255,0.8)"} fontSize="11" fontWeight="600">ZKAirdrop</text>
          <text x="815" y="212" textAnchor="middle" fill="rgba(224,232,255,0.4)" fontSize="9">nullifier check</text>
          <text x="815" y="226" textAnchor="middle" fill="rgba(224,232,255,0.3)" fontSize="8">transfer tokens</text>
        </g>

        {/* Result */}
        <g className={activeStep === 4 ? "node-pulse" : ""}>
          <rect x="680" y="260" width="130" height="50" rx="10" fill={activeStep === 4 ? "rgba(108,255,50,0.15)" : "rgba(108,255,50,0.05)"} stroke={activeStep === 4 ? "#6CFF32" : "rgba(108,255,50,0.1)"} strokeWidth="1" />
          <text x="745" y="283" textAnchor="middle" fill={activeStep === 4 ? "#6CFF32" : "rgba(108,255,50,0.6)"} fontSize="11" fontWeight="600">100 ZKPT</text>
          <text x="745" y="298" textAnchor="middle" fill="rgba(224,232,255,0.3)" fontSize="8">claimed!</text>
        </g>
        <line x1="745" y1="240" x2="745" y2="260" className={`flow-line ${activeStep === 4 ? "flow-line-active" : ""}`} stroke={activeStep === 4 ? "#6CFF32" : "rgba(108,255,50,0.1)"} strokeWidth="1" />

        {/* Step indicators */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            cx={400 + i * 25}
            cy="335"
            r={activeStep === i ? 4 : 3}
            fill={activeStep === i ? "#6CFF32" : "rgba(255,255,255,0.15)"}
            className={activeStep === i ? "" : "cursor-pointer"}
            onClick={() => setActiveStep(i)}
          />
        ))}
      </svg>
    </div>
  );
}
