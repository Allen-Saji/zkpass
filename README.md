# zkpass

Identity-based airdrops with zero-knowledge proofs. Not wallets. People.

Crypto airdrops are broken -- sybil farmers claim with hundreds of wallets. ZKPass ties eligibility to verified identity using ZK proofs with holder binding and nullifier-based sybil resistance. Prove you're a real person, claim once. Zero data leaked.

Built for the [HashKey Chain Horizon Hackathon](https://dorahacks.io/hackathon/2045/detail) -- ZKID track.

## Architecture

```
                                Off-chain                          On-chain (HashKey Chain)
                         +-----------------------+          +---------------------------+
                         |                       |          |                           |
  KYC Provider           |   User's Browser      |          |  IssuerRegistry.sol       |
  (API route)            |                       |          |    - trusted issuer list   |
       |                 |  1. Generate secret    |          |                           |
  EdDSA signs            |     holderSecret       |          |  Groth16Verifier.sol      |
  credential             |                       |          |    - BN254 pairing check   |
       |                 |  2. Compute            |          |                           |
       +---> JSON ------>|     identityCommitment |          |  ZKAirdrop.sol            |
                         |     = Poseidon(secret) |          |    - verify proof          |
                         |                       |          |    - check issuer registry |
                         |  3. Select disclosure  |          |    - check nullifier       |
                         |     [x] Age >= 18     |          |    - transfer tokens       |
                         |     [x] Jurisdiction  |          |                           |
                         |     [ ] KYC Level     |          |  ZKToken.sol (ERC-20)     |
                         |                       |          |    - 1M ZKPT supply       |
                         |  4. Generate proof     |          |                           |
                         |     (snarkjs WASM)     |          +---------------------------+
                         |                       |                      ^
                         |  5. Submit tx --------+----- claim(a,b,c,signals) ---+
                         |                       |
                         +-----------------------+

  What's on-chain:                    What's NOT on-chain:
  - Proof points (a, b, c)           - Actual age, jurisdiction, KYC level
  - Public signals (thresholds)       - Holder secret
  - Nullifier hash                    - Credential data
  - Identity commitment               - Issuer private key
```

## Key features

**Holder binding** -- Credential is bound to holder's secret via `identityCommitment = Poseidon(holderSecret)`. Stolen credentials are useless without the secret, which never leaves the circuit.

**Nullifier-based sybil resistance** -- `nullifierHash = Poseidon(holderSecret, externalNullifier)` is deterministic per (identity, airdrop). Same person with 100 wallets = same nullifier = one claim.

**Selective disclosure** -- 3-bit bitmask controls which attributes are proven. Unset bits skip the constraint entirely. Prove "age >= 18" without revealing jurisdiction.

**On-chain issuer registry** -- Trusted issuer public key hashes registered on-chain. Proofs from unregistered issuers are rejected.

**Server-side credential signing** -- Issuer private key lives on the server (API route), never in the browser. Fixes the trust model.

## Circuit details

**ZKPassVerifier.circom** -- 10,303 constraints (Groth16, BN254)

| Signal | Type | Description |
|--------|------|-------------|
| age, jurisdictionCode, kycLevel | Private | User's attributes |
| issuerPubKey[2], issuerSig[3] | Private | EdDSA signature from issuer |
| holderSecret | Private | Holder's identity secret |
| minAge, allowedJurisdiction, minKycLevel | Public input | Threshold requirements |
| disclosureFlags | Public input | 3-bit bitmask |
| issuerPubKeyHash | Public input | Poseidon hash of issuer key |
| externalNullifier | Public input | Airdrop scope identifier |
| nullifierHash | Public output | Sybil resistance |
| identityCommitment | Public output | Holder binding |

Credential hash: `Poseidon(age, jurisdictionCode, kycLevel, identityCommitment)`

The issuer signs this hash with EdDSA (Baby JubJub curve). The circuit verifies the signature and enforces selective attribute checks.

## Deployed contracts (HashKey Chain Testnet)

| Contract | Address |
|----------|---------|
| Groth16Verifier | [`0xae0c2972AC42CB49c089D6E460Bcf0becE1d8C21`](https://testnet-explorer.hsk.xyz/address/0xae0c2972AC42CB49c089D6E460Bcf0becE1d8C21) |
| IssuerRegistry | [`0xbe34bd0c1702F47CCAE18771D6c45d8e56654F83`](https://testnet-explorer.hsk.xyz/address/0xbe34bd0c1702F47CCAE18771D6c45d8e56654F83) |
| ZKToken | [`0x8F16b88998Fc801ba5393523de5D27d3191F4C94`](https://testnet-explorer.hsk.xyz/address/0x8F16b88998Fc801ba5393523de5D27d3191F4C94) |
| ZKAirdrop | [`0x65C77e41838409FD32D4Bd040a9FEC7B0574426d`](https://testnet-explorer.hsk.xyz/address/0x65C77e41838409FD32D4Bd040a9FEC7B0574426d) |

## Tech stack

| Layer | Technology |
|-------|-----------|
| ZK circuits | Circom 2, Groth16, snarkjs |
| Credential signing | EdDSA (Baby JubJub) via circomlib |
| Hashing | Poseidon (credential hash, identity commitment, nullifier) |
| Smart contracts | Solidity 0.8.20, Hardhat, OpenZeppelin |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Next.js API route (credential issuance) |
| Wallet | MetaMask, ethers.js v6 |
| Chain | HashKey Chain Testnet (Chain ID 133) |

## Project structure

```
zkpass/
  circuits/
    ZKPassVerifier.circom     # main circuit (holder binding + nullifiers)
    AgeCheck.circom           # simple age check (pipeline test)
    build/                    # compiled artifacts (wasm, zkey, proof)
  contracts/
    contracts/
      Groth16Verifier.sol     # auto-generated verifier
      IssuerRegistry.sol      # trusted issuer registry
      ZKAirdrop.sol           # identity-based airdrop with sybil resistance
      ZKToken.sol             # demo ERC-20 token
    test/
      ZKAirdrop.ts            # contract tests
    scripts/
      deploy.ts               # deploy + register issuer
    deployments.json          # deployed addresses
  frontend/
    src/
      app/
        page.tsx              # landing page
        issue/page.tsx        # credential issuance
        wallet/page.tsx       # identity wallet
        claim/page.tsx        # prove + claim airdrop
        api/issue/route.ts    # backend issuer (EdDSA signing)
      components/
        PassportCard.tsx      # credential card with holographic shimmer
        NavBar.tsx            # navigation
        Footer.tsx            # chain info
      hooks/
        useProver.ts          # ZK proof generation (web worker)
        useClaim.ts           # airdrop claim interaction
        useAirdropStats.ts    # on-chain stats reader
        useZKEngine.ts        # WASM/zkey preloader
      lib/
        types.ts              # TypeScript interfaces
        constants.ts          # contract addresses, ABIs
        buildInput.ts         # witness input builder
        credentialStore.ts    # localStorage credential + secret management
        poseidon.ts           # browser-side Poseidon hash
    public/
      zk/                     # WASM + zkey for browser proving
      zkWorker.js             # web worker for proof generation
  scripts/
    build-zkpass.sh           # circuit build pipeline
    generate-credential.mjs   # credential generation script
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

# Install dependencies and generate credential
npm install
node scripts/generate-credential.mjs

# Build circuit (compile, setup, prove, verify, export verifier)
bash scripts/build-zkpass.sh
```

### Deploy contracts

```bash
cd contracts
npm install
cp .env.example .env  # add PRIVATE_KEY
npx hardhat test
npx hardhat run scripts/deploy.ts --network hashkeyTestnet
```

### Run frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # issuer private key
npm run dev
```

Open http://localhost:3000.

## Demo flow

1. **/** -- Landing page: "Airdrops for people, not wallets"
2. **/issue** -- Simulate KYC verification, receive signed credential
3. **/wallet** -- View your identity secret and stored credentials
4. **/claim** -- Select disclosure flags, generate ZK proof, claim 100 ZKPT tokens
5. **Try claiming again** -- "Already Claimed" revert (sybil resistance in action)

## Threat model

| Threat | Mitigation |
|--------|------------|
| Credential theft (someone steals your JSON) | Holder binding: credential is useless without `holderSecret`, which never leaves the circuit |
| Sybil attack (claim with multiple wallets) | Nullifier: `Poseidon(holderSecret, externalNullifier)` is deterministic per identity per airdrop |
| Forged credentials | EdDSA signature verification in-circuit + on-chain issuer registry |
| Compromised issuer | `revokeIssuer()` in IssuerRegistry disables all credentials from that issuer |
| Proof replay (resubmit someone's proof) | Nullifier is already marked as used; tokens go to `msg.sender` regardless |
| Attribute correlation across airdrops | Different `externalNullifier` per airdrop = different `nullifierHash` = unlinkable |

### Known limitations (demo scope)

- No credential expiry/revocation at the credential level
- `holderSecret` stored in localStorage (production: secure enclave / dedicated wallet app)
- Single issuer key (production: key rotation, multiple issuers)
- No challenge/nonce from verifier (production: prevent front-running)

## How selective disclosure works

The disclosure flags are a 3-bit bitmask decomposed inside the circuit using `Num2Bits(3)`. Each bit controls whether its corresponding check is enforced:

```
flag * (1 - check.out) === 0
```

When `flag = 1`: the check result must be 1 (constraint enforced).
When `flag = 0`: the constraint is trivially `0 * anything === 0` (check skipped).

A user can prove "I'm over 18 and in Hong Kong" without revealing their KYC level by setting `disclosureFlags = 0b011 = 3`.

## Multi-chain compatibility

The ZK circuit is chain-agnostic. The credential contains no blockchain data. The same WASM, zkey, and proof work on any EVM chain that deploys the `Groth16Verifier.sol` (identical bytecode). Deploy the verifier + registry on any chain, register the same issuers, and credentials work cross-chain with zero changes.

## License

MIT
