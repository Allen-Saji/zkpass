import { Credential, DisclosureFlags, WitnessInput } from "./types";

export function computeDisclosureFlags(flags: DisclosureFlags): number {
  let bitmask = 0;
  if (flags.age) bitmask |= 1;
  if (flags.jurisdiction) bitmask |= 2;
  if (flags.kyc) bitmask |= 4;
  return bitmask;
}

export function buildWitnessInput(
  credential: Credential,
  flags: DisclosureFlags
): WitnessInput {
  const disclosureFlags = computeDisclosureFlags(flags);

  return {
    age: credential.age.toString(),
    jurisdictionCode: credential.jurisdictionCode.toString(),
    kycLevel: credential.kycLevel.toString(),
    issuerPubKey: credential.issuerPubKey,
    issuerSig: [
      credential.signature.R8[0],
      credential.signature.R8[1],
      credential.signature.S,
    ],
    minAge: "18",
    allowedJurisdiction: "852",
    minKycLevel: "1",
    disclosureFlags: disclosureFlags.toString(),
    issuerPubKeyHash: credential.issuerPubKeyHash,
  };
}

export function parseCalldata(calldata: string) {
  // snarkjs.groth16.exportSolidityCallData returns a string like:
  // "["0x..","0x.."],[[...],[...]],["0x..","0x.."],["0x..","0x..","0x..","0x..","0x.."]"
  const parsed = JSON.parse(`[${calldata}]`);
  const a: [bigint, bigint] = [BigInt(parsed[0][0]), BigInt(parsed[0][1])];
  const b: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(parsed[1][0][0]), BigInt(parsed[1][0][1])],
    [BigInt(parsed[1][1][0]), BigInt(parsed[1][1][1])],
  ];
  const c: [bigint, bigint] = [BigInt(parsed[2][0]), BigInt(parsed[2][1])];
  const signals: [bigint, bigint, bigint, bigint, bigint] = [
    BigInt(parsed[3][0]),
    BigInt(parsed[3][1]),
    BigInt(parsed[3][2]),
    BigInt(parsed[3][3]),
    BigInt(parsed[3][4]),
  ];

  return { a, b, c, signals };
}
