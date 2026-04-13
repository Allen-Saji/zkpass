import { NextRequest, NextResponse } from "next/server";

// circomlibjs uses top-level await / WASM internally, so we build lazily
let eddsa: any;
let poseidon: any;
let F: any;

async function initCrypto() {
  if (eddsa && poseidon) return;
  const { buildEddsa, buildPoseidon } = await import("circomlibjs");
  eddsa = await buildEddsa();
  poseidon = await buildPoseidon();
  F = poseidon.F;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { holder, age, jurisdictionCode, kycLevel, identityCommitment } = body;

    // Validate inputs
    if (!holder || age == null || jurisdictionCode == null || kycLevel == null || !identityCommitment) {
      return NextResponse.json(
        { error: "Missing required fields: holder, age, jurisdictionCode, kycLevel, identityCommitment" },
        { status: 400 }
      );
    }

    await initCrypto();

    // Load issuer private key from env
    const privKeyHex = process.env.ISSUER_PRIVATE_KEY;
    if (!privKeyHex) {
      return NextResponse.json(
        { error: "Server misconfigured: missing ISSUER_PRIVATE_KEY" },
        { status: 500 }
      );
    }
    const issuerPrivKey = Buffer.from(privKeyHex, "hex");

    const ageBig = BigInt(age);
    const jurisdictionBig = BigInt(jurisdictionCode);
    const kycBig = BigInt(kycLevel);
    const idCommitBig = BigInt(identityCommitment);

    // Compute credential hash: Poseidon(age, jurisdictionCode, kycLevel, identityCommitment)
    const credHash = poseidon([ageBig, jurisdictionBig, kycBig, idCommitBig]);

    // Sign with EdDSA
    const signature = eddsa.signPoseidon(issuerPrivKey, credHash);

    // Get issuer public key
    const pubKey = eddsa.prv2pub(issuerPrivKey);

    // Compute issuer public key hash
    const pubKeyHash = poseidon([F.toObject(pubKey[0]), F.toObject(pubKey[1])]);

    const credential = {
      holder,
      age: Number(ageBig),
      jurisdictionCode: Number(jurisdictionBig),
      kycLevel: Number(kycBig),
      identityCommitment: idCommitBig.toString(),
      issuedAt: new Date().toISOString(),
      signature: {
        R8: [
          F.toObject(signature.R8[0]).toString(),
          F.toObject(signature.R8[1]).toString(),
        ],
        S: signature.S.toString(),
      },
      issuerPubKey: [
        F.toObject(pubKey[0]).toString(),
        F.toObject(pubKey[1]).toString(),
      ] as [string, string],
      issuerPubKeyHash: F.toObject(pubKeyHash).toString(),
    };

    return NextResponse.json({ credential });
  } catch (err: any) {
    console.error("Issue credential error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
