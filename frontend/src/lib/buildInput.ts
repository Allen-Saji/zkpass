import { Credential, DisclosureFlags, WitnessInput } from "./types";
import { EXTERNAL_NULLIFIER } from "./constants";

export function computeDisclosureFlags(flags: DisclosureFlags): number {
  let bitmask = 0;
  if (flags.age) bitmask |= 1;
  if (flags.jurisdiction) bitmask |= 2;
  if (flags.kyc) bitmask |= 4;
  return bitmask;
}

export function buildWitnessInput(
  credential: Credential,
  flags: DisclosureFlags,
  holderSecret: string
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
    holderSecret,
    minAge: "18",
    allowedJurisdiction: "852",
    minKycLevel: "1",
    disclosureFlags: disclosureFlags.toString(),
    issuerPubKeyHash: credential.issuerPubKeyHash,
    externalNullifier: EXTERNAL_NULLIFIER,
  };
}

export function parseCalldata(calldata: string) {
  const parsed = JSON.parse(`[${calldata}]`);
  const a: [bigint, bigint] = [BigInt(parsed[0][0]), BigInt(parsed[0][1])];
  const b: [[bigint, bigint], [bigint, bigint]] = [
    [BigInt(parsed[1][0][0]), BigInt(parsed[1][0][1])],
    [BigInt(parsed[1][1][0]), BigInt(parsed[1][1][1])],
  ];
  const c: [bigint, bigint] = [BigInt(parsed[2][0]), BigInt(parsed[2][1])];
  const signals: bigint[] = parsed[3].map((s: string) => BigInt(s));

  return { a, b, c, signals };
}
