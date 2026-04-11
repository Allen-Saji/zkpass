export interface Credential {
  holder: string;
  age: number;
  jurisdictionCode: number;
  kycLevel: number;
  issuedAt: string;
  signature: {
    R8: [string, string];
    S: string;
  };
  issuerPubKey: [string, string];
  issuerPubKeyHash: string;
}

export interface DisclosureFlags {
  age: boolean;
  jurisdiction: boolean;
  kyc: boolean;
}

export interface WitnessInput {
  age: string;
  jurisdictionCode: string;
  kycLevel: string;
  issuerPubKey: [string, string];
  issuerSig: [string, string, string];
  minAge: string;
  allowedJurisdiction: string;
  minKycLevel: string;
  disclosureFlags: string;
  issuerPubKeyHash: string;
}

export interface ProofResult {
  proof: unknown;
  publicSignals: string[];
  calldata: string;
}

export interface ZKWorkerMessage {
  type: "status" | "result" | "error";
  message?: string;
  proof?: unknown;
  publicSignals?: string[];
  calldata?: string;
  error?: string;
}

export type ProveStatus =
  | "idle"
  | "generating"
  | "done"
  | "error";

export type PoolStatus =
  | "idle"
  | "connecting"
  | "switching-chain"
  | "sending"
  | "confirming"
  | "done"
  | "error";
