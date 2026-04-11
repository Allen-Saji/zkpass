pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/eddsaposeidon.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

// ZKPass: Multi-attribute selective disclosure identity verifier
// Proves user attributes (age, jurisdiction, KYC level) meet requirements
// without revealing the actual values. Disclosure flags control which
// checks are enforced via a 3-bit bitmask.
template ZKPassVerifier() {
    // --- Private inputs (known only to prover) ---
    signal input age;
    signal input jurisdictionCode;
    signal input kycLevel;
    signal input issuerPubKey[2];    // Baby JubJub public key [Ax, Ay]
    signal input issuerSig[3];       // EdDSA signature [R8x, R8y, S]

    // --- Public inputs (visible to verifier / on-chain) ---
    signal input minAge;
    signal input allowedJurisdiction;
    signal input minKycLevel;
    signal input disclosureFlags;    // 3-bit bitmask: bit0=age, bit1=jurisdiction, bit2=kyc
    signal input issuerPubKeyHash;

    // === 1. Compute credential hash (Poseidon of attributes) ===
    component credHash = Poseidon(3);
    credHash.inputs[0] <== age;
    credHash.inputs[1] <== jurisdictionCode;
    credHash.inputs[2] <== kycLevel;

    // === 2. Verify issuer public key matches expected hash ===
    component pubKeyHash = Poseidon(2);
    pubKeyHash.inputs[0] <== issuerPubKey[0];
    pubKeyHash.inputs[1] <== issuerPubKey[1];
    pubKeyHash.out === issuerPubKeyHash;

    // === 3. Verify EdDSA signature over credential hash ===
    // This ensures the credential was signed by the trusted issuer
    component sigVerify = EdDSAPoseidonVerifier();
    sigVerify.enabled <== 1;
    sigVerify.Ax <== issuerPubKey[0];
    sigVerify.Ay <== issuerPubKey[1];
    sigVerify.R8x <== issuerSig[0];
    sigVerify.R8y <== issuerSig[1];
    sigVerify.S <== issuerSig[2];
    sigVerify.M <== credHash.out;

    // === 4. Decompose disclosure flags into individual bits ===
    component flagBits = Num2Bits(3);
    flagBits.in <== disclosureFlags;
    // flagBits.out[0] = age flag
    // flagBits.out[1] = jurisdiction flag
    // flagBits.out[2] = kyc flag

    // === 5. Selective disclosure checks ===
    // Pattern: flag * (1 - check.out) === 0
    // When flag=1: check.out must be 1 (constraint enforced)
    // When flag=0: constraint is trivially satisfied (check skipped)

    // Age check: age >= minAge
    component ageCheck = GreaterEqThan(8);
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== minAge;
    flagBits.out[0] * (1 - ageCheck.out) === 0;

    // Jurisdiction check: jurisdictionCode == allowedJurisdiction
    component jurisdictionCheck = IsEqual();
    jurisdictionCheck.in[0] <== jurisdictionCode;
    jurisdictionCheck.in[1] <== allowedJurisdiction;
    flagBits.out[1] * (1 - jurisdictionCheck.out) === 0;

    // KYC level check: kycLevel >= minKycLevel
    component kycCheck = GreaterEqThan(4);
    kycCheck.in[0] <== kycLevel;
    kycCheck.in[1] <== minKycLevel;
    flagBits.out[2] * (1 - kycCheck.out) === 0;
}

component main {public [minAge, allowedJurisdiction, minKycLevel, disclosureFlags, issuerPubKeyHash]} = ZKPassVerifier();
