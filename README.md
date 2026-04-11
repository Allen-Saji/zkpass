# zkpass

ZK identity passport for HashKey Chain. Prove who you are. Reveal nothing else.

Multi-attribute selective disclosure using zero-knowledge proofs. Users prove they meet eligibility requirements (age, jurisdiction, KYC level) without revealing their actual data.

Built for the [HashKey Chain Horizon Hackathon](https://dorahacks.io/hackathon/2045/detail) -- ZKID track.

## How it works

```
Credential Issuer          User Browser              HashKey Chain
       |                        |                         |
  signs credential         loads credential          Groth16Verifier.sol
  (EdDSA/Baby JubJub)     selects disclosure         ZKGatedPool.sol
       |                   generates ZK proof              |
       +----> JSON ------->  (snarkjs WASM)                |
                                |                          |
                           checkboxes:                     |
                           [x] Age >= 18                   |
                           [x] Jurisdiction = HK           |
                           [ ] KYC Level                   |
                                |                          |
                           "Prove" button                  |
                           (web worker)                    |
                                +-------- tx ----------->  |
                                                     verify + deposit
```

1. A trusted issuer signs user credentials with EdDSA (Baby JubJub curve)
2. User loads their credential in the browser
3. User selects which attributes to disclose via checkboxes
4. A 3-bit disclosure bitmask controls which checks are enforced
5. ZK proof is generated in-browser using snarkjs WASM (off main thread)
6. Proof is submitted on-chain to a gated DeFi pool
7. The contract verifies the Groth16 proof and grants access

The contract never sees the user's age, jurisdiction, or KYC level. It only sees that the proof is valid for the selected disclosure flags.

## Tech stack

| Layer | Technology |
|-------|-----------|
| ZK circuits | Circom 2, Groth16, snarkjs |
| Credential signing | EdDSA (Baby JubJub) via circomlib |
| Hashing | Poseidon |
| Smart contracts | Solidity 0.8.20, Hardhat |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Wallet | MetaMask, ethers.js v6 |
| Chain | HashKey Chain Testnet (Chain ID 133) |

## Deployed contracts

| Contract | Address |
|----------|---------|
| Groth16Verifier | [`0xba1D2B7A58Be84fCc07e1cC085AB39cB495604F2`](https://testnet-explorer.hsk.xyz/address/0xba1D2B7A58Be84fCc07e1cC085AB39cB495604F2) |
| ZKGatedPool | [`0x50193Ff688db42c98f3cFb2B49E5FAD4236cb1Cd`](https://testnet-explorer.hsk.xyz/address/0x50193Ff688db42c98f3cFb2B49E5FAD4236cb1Cd) |

## Circuit details

**ZKPassVerifier.circom** -- 9,240 constraints

Private inputs: age, jurisdictionCode, kycLevel, issuerPubKey[2], issuerSig[3]

Public inputs: minAge, allowedJurisdiction, minKycLevel, disclosureFlags (3-bit bitmask), issuerPubKeyHash

Selective disclosure via bitmask decomposition:
- Bit 0: age check (age >= minAge)
- Bit 1: jurisdiction check (jurisdictionCode == allowedJurisdiction)
- Bit 2: KYC level check (kycLevel >= minKycLevel)

Unset flags skip the constraint entirely. The proof is valid regardless of the attribute value when its flag is off.

## Project structure

```
zkpass/
  circuits/
    AgeCheck.circom           # simple age verification (pipeline test)
    ZKPassVerifier.circom     # multi-attribute selective disclosure
    credential.json           # mock EdDSA-signed credential
    input_zkpass.json         # witness input for testing
  contracts/
    contracts/
      Groth16Verifier.sol     # auto-generated from snarkjs
      ZKGatedPool.sol         # ZK-gated DeFi pool
    test/
      ZKGatedPool.ts          # contract tests
    scripts/
      deploy.ts               # deployment script
    deployments.json          # deployed addresses
  frontend/
    src/
      app/                    # Next.js app router
      components/             # UI components
      hooks/                  # useZKEngine, useProver, usePool
      lib/                    # types, constants, buildInput
    public/
      zk/                     # WASM + zkey for browser proving
      zkWorker.js             # web worker for proof generation
      credential.json         # demo credential
  scripts/
    build-age-check.sh        # build + prove AgeCheck circuit
    build-zkpass.sh           # build + prove ZKPassVerifier
    generate-credential.mjs   # generate mock EdDSA credentials
```

## Setup

### Prerequisites

- Node.js 22+
- Circom 2 (`cargo install --path circom` from [iden3/circom](https://github.com/iden3/circom))
- snarkjs (`npm install -g snarkjs`)

### Build circuits

```bash
# Download Powers of Tau ceremony file
wget https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_16.ptau -O circuits/powersOfTau28_hez_final_16.ptau

# Generate test credential
npm install
node scripts/generate-credential.mjs

# Build and prove (compiles circuit, generates proof, exports Solidity verifier)
bash scripts/build-zkpass.sh
```

### Deploy contracts

```bash
cd contracts
npm install
cp .env.example .env  # add your private key
npx hardhat test
npx hardhat run scripts/deploy.ts --network hashkeyTestnet
```

### Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000. Load the demo credential, select disclosure checkboxes, generate a proof, and join the gated pool.

## How selective disclosure works

The disclosure flags are a 3-bit bitmask decomposed inside the circuit using `Num2Bits(3)`. Each bit controls whether its corresponding check is enforced:

```
flag * (1 - check.out) === 0
```

When `flag = 1`: the check result must be 1 (constraint enforced).
When `flag = 0`: the constraint is trivially `0 * anything === 0` (check skipped).

This means a user can prove "I'm over 18 and in Hong Kong" without revealing their KYC level, by setting `disclosureFlags = 0b011 = 3`.

## License

MIT
