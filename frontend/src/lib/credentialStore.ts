import { Credential } from "./types";

const CREDENTIALS_KEY = "zkpass_credentials";
const HOLDER_SECRET_KEY = "zkpass_holder_secret";

export function saveCredential(credential: Credential): void {
  const credentials = loadCredentials();
  // Replace if same issuer + holder, otherwise append
  const idx = credentials.findIndex(
    (c) =>
      c.issuerPubKeyHash === credential.issuerPubKeyHash &&
      c.holder === credential.holder
  );
  if (idx >= 0) {
    credentials[idx] = credential;
  } else {
    credentials.push(credential);
  }
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}

export function loadCredentials(): Credential[] {
  const raw = localStorage.getItem(CREDENTIALS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

export function deleteCredential(issuerPubKeyHash: string, holder: string): void {
  const credentials = loadCredentials().filter(
    (c) => !(c.issuerPubKeyHash === issuerPubKeyHash && c.holder === holder)
  );
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}

export function exportCredential(credential: Credential): void {
  const blob = new Blob([JSON.stringify(credential, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zkpass-credential-${credential.holder.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getHolderSecret(): string | null {
  return localStorage.getItem(HOLDER_SECRET_KEY);
}

export function setHolderSecret(secret: string): void {
  localStorage.setItem(HOLDER_SECRET_KEY, secret);
}

export function generateHolderSecret(): string {
  const bytes = new Uint8Array(31);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const secret = BigInt("0x" + hex).toString();
  setHolderSecret(secret);
  return secret;
}

export function getOrCreateHolderSecret(): string {
  const existing = getHolderSecret();
  if (existing) return existing;
  return generateHolderSecret();
}
