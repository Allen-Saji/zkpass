// Credential issuer mock: generates EdDSA-signed credentials for ZKPass
// Uses Baby JubJub curve with Poseidon hashing (matches circuit)
import { buildEddsa, buildPoseidon } from "circomlibjs";
import { writeFileSync } from "fs";

async function main() {
  const eddsa = await buildEddsa();
  const poseidon = await buildPoseidon();
  const F = poseidon.F;

  // Hardcoded issuer private key (dev only)
  const issuerPrivKey = Buffer.from(
    "0001020304050607080900010203040506070809000102030405060708090001",
    "hex"
  );

  // User credential attributes
  const age = 25n;
  const jurisdictionCode = 852n; // Hong Kong
  const kycLevel = 2n; // Full KYC

  // Compute credential hash: Poseidon(age, jurisdictionCode, kycLevel)
  const credHash = poseidon([age, jurisdictionCode, kycLevel]);

  // Sign the credential hash with EdDSA
  // signPoseidon expects msg as a field element (internal representation)
  const signature = eddsa.signPoseidon(issuerPrivKey, credHash);

  // Get issuer public key
  const pubKey = eddsa.prv2pub(issuerPrivKey);

  // Compute issuer public key hash
  const pubKeyHash = poseidon([F.toObject(pubKey[0]), F.toObject(pubKey[1])]);

  // Build witness input for the circuit
  const witnessInput = {
    // Private inputs
    age: age.toString(),
    jurisdictionCode: jurisdictionCode.toString(),
    kycLevel: kycLevel.toString(),
    issuerPubKey: [
      F.toObject(pubKey[0]).toString(),
      F.toObject(pubKey[1]).toString(),
    ],
    issuerSig: [
      F.toObject(signature.R8[0]).toString(),
      F.toObject(signature.R8[1]).toString(),
      signature.S.toString(),
    ],
    // Public inputs
    minAge: "18",
    allowedJurisdiction: "852",
    minKycLevel: "1",
    disclosureFlags: "7", // all flags on (0b111)
    issuerPubKeyHash: F.toObject(pubKeyHash).toString(),
  };

  writeFileSync(
    "circuits/input_zkpass.json",
    JSON.stringify(witnessInput, null, 2)
  );
  console.log("Credential written to circuits/input_zkpass.json");
  console.log("Public key hash:", witnessInput.issuerPubKeyHash);
  console.log("Disclosure flags:", witnessInput.disclosureFlags, "(all checks on)");

  // Also generate a credential JSON (for the frontend)
  const credential = {
    holder: "0xDemoUser",
    age: Number(age),
    jurisdictionCode: Number(jurisdictionCode),
    kycLevel: Number(kycLevel),
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
    ],
    issuerPubKeyHash: F.toObject(pubKeyHash).toString(),
  };

  writeFileSync(
    "circuits/credential.json",
    JSON.stringify(credential, null, 2)
  );
  console.log("Credential JSON written to circuits/credential.json");
}

main().catch(console.error);
