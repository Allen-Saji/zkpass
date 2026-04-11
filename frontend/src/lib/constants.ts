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
  zkGatedPool: "0x50193Ff688db42c98f3cFb2B49E5FAD4236cb1Cd",
  groth16Verifier: "0xba1D2B7A58Be84fCc07e1cC085AB39cB495604F2",
} as const;

export const POOL_ABI = [
  {
    inputs: [
      { internalType: "uint256[2]", name: "a", type: "uint256[2]" },
      { internalType: "uint256[2][2]", name: "b", type: "uint256[2][2]" },
      { internalType: "uint256[2]", name: "c", type: "uint256[2]" },
      { internalType: "uint256[5]", name: "publicSignals", type: "uint256[5]" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "isVerified",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const DEPOSIT_AMOUNT = "0.001"; // HSK

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
