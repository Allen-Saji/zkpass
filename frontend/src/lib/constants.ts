export const HASHKEY_TESTNET = {
  chainId: "0x85",
  chainIdDecimal: 133,
  chainName: "HashKey Chain Testnet",
  rpcUrl: "https://testnet.hsk.xyz",
  explorerUrl: "https://testnet-explorer.hsk.xyz",
  nativeCurrency: {
    name: "HSK",
    symbol: "HSK",
    decimals: 18,
  },
} as const;

export const CONTRACTS = {
  groth16Verifier: "0x2a0e4d7420450fC3D2d90Afa8CaCeD2b3afeE2cd",
  issuerRegistry: "0xeCCDe01775e0Fe1e71fCbc8Cf0aa3c3637d76ab1",
  zkToken: "0x51a366E33Ac4743207FE355FbFD8dD2072F860A7",
  zkAirdrop: "0x5861c72437b6e1a601967534e0077F6FD0b37D6a",
} as const;

export const EXTERNAL_NULLIFIER =
  "6843529764631688057528082670445704075987550823295116028335510468311249770383";

export const CLAIM_AMOUNT = "100"; // ZKPT per claim

export const AIRDROP_ABI = [
  {
    inputs: [
      { internalType: "uint256[2]", name: "a", type: "uint256[2]" },
      { internalType: "uint256[2][2]", name: "b", type: "uint256[2][2]" },
      { internalType: "uint256[2]", name: "c", type: "uint256[2]" },
      { internalType: "uint256[8]", name: "publicSignals", type: "uint256[8]" },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalClaims",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "remainingTokens",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "externalNullifier",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "nullifier", type: "uint256" }],
    name: "isNullifierUsed",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const TOKEN_ABI = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const ZK_PATHS = {
  wasm: "/zk/ZKPassVerifier.wasm",
  zkey: "/zk/ZKPassVerifier_final.zkey",
} as const;

export const JURISDICTION_MAP: Record<number, string> = {
  852: "HK",
  1: "US",
  44: "UK",
  86: "CN",
  81: "JP",
  65: "SG",
};

export const KYC_LEVEL_MAP: Record<number, string> = {
  0: "None",
  1: "Basic",
  2: "Full",
  3: "Enhanced",
};

export const ISSUER_NAME = "ZKPass Dev Issuer";
export const ISSUER_PUB_KEY_HASH =
  "8093821485214269328389004542394237209037452657522929891144731833981969398000";
