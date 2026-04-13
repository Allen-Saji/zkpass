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
  groth16Verifier: "0xae0c2972AC42CB49c089D6E460Bcf0becE1d8C21",
  issuerRegistry: "0xbe34bd0c1702F47CCAE18771D6c45d8e56654F83",
  zkToken: "0x8F16b88998Fc801ba5393523de5D27d3191F4C94",
  zkAirdrop: "0x65C77e41838409FD32D4Bd040a9FEC7B0574426d",
} as const;

export const EXTERNAL_NULLIFIER =
  "4084693458823302036348996913704485430044101317082931210579043319749712868981";

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
