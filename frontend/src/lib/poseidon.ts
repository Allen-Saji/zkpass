// Lazy-loaded Poseidon hash for client-side use
// Used to compute identityCommitment = Poseidon(holderSecret)

let poseidonFn: any;
let F: any;

export async function initPoseidon() {
  if (poseidonFn) return;
  const { buildPoseidon } = await import("circomlibjs");
  poseidonFn = await buildPoseidon();
  F = poseidonFn.F;
}

export async function poseidonHash(inputs: bigint[]): Promise<string> {
  await initPoseidon();
  const hash = poseidonFn(inputs);
  return F.toObject(hash).toString();
}

export async function computeIdentityCommitment(holderSecret: string): Promise<string> {
  return poseidonHash([BigInt(holderSecret)]);
}
