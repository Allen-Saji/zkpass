#!/bin/bash
set -e

CIRCUIT_NAME="ZKPassVerifier"
CIRCUITS_DIR="$(cd "$(dirname "$0")/../circuits" && pwd)"
BUILD_DIR="$CIRCUITS_DIR/build"
PTAU="$CIRCUITS_DIR/powersOfTau28_hez_final_16.ptau"

mkdir -p "$BUILD_DIR"

echo "=== Step 1: Compile ZKPassVerifier circuit ==="
time circom "$CIRCUITS_DIR/$CIRCUIT_NAME.circom" \
  --r1cs --wasm --sym --inspect \
  -o "$BUILD_DIR" \
  -l "$CIRCUITS_DIR/../node_modules"

echo ""
echo "=== Step 2: Circuit info ==="
snarkjs r1cs info "$BUILD_DIR/$CIRCUIT_NAME.r1cs"

echo ""
echo "=== Step 3: Groth16 setup ==="
time snarkjs groth16 setup \
  "$BUILD_DIR/$CIRCUIT_NAME.r1cs" \
  "$PTAU" \
  "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey"

echo ""
echo "=== Step 4: Contribute to ceremony ==="
snarkjs zkey contribute \
  "$BUILD_DIR/${CIRCUIT_NAME}_0000.zkey" \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  --name="zkpass-dev" -v -e="zkpass dev contribution entropy"

echo ""
echo "=== Step 5: Export verification key ==="
snarkjs zkey export verificationkey \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  "$BUILD_DIR/verification_key.json"

echo ""
echo "=== Step 6: Calculate witness ==="
time snarkjs wtns calculate \
  "$BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm" \
  "$CIRCUITS_DIR/input_zkpass.json" \
  "$BUILD_DIR/witness.wtns"

echo ""
echo "=== Step 7: Generate proof ==="
time snarkjs groth16 prove \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  "$BUILD_DIR/witness.wtns" \
  "$BUILD_DIR/proof.json" \
  "$BUILD_DIR/public.json"

echo ""
echo "=== Step 8: Verify proof (off-chain) ==="
snarkjs groth16 verify \
  "$BUILD_DIR/verification_key.json" \
  "$BUILD_DIR/public.json" \
  "$BUILD_DIR/proof.json"

echo ""
echo "=== Step 9: Export Solidity verifier ==="
snarkjs zkey export solidityverifier \
  "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" \
  "$CIRCUITS_DIR/../contracts/contracts/Groth16Verifier.sol"

echo ""
echo "=== Step 10: Generate calldata ==="
snarkjs zkey export soliditycalldata \
  "$BUILD_DIR/public.json" \
  "$BUILD_DIR/proof.json"

echo ""
echo "=== DONE! Full ZKPass pipeline complete ==="
echo "Public signals:"
cat "$BUILD_DIR/public.json"
echo ""
echo "WASM size: $(du -sh "$BUILD_DIR/${CIRCUIT_NAME}_js/${CIRCUIT_NAME}.wasm" | cut -f1)"
echo "Zkey size: $(du -sh "$BUILD_DIR/${CIRCUIT_NAME}_final.zkey" | cut -f1)"
