/* eslint-disable no-restricted-globals */
importScripts("/snarkjs.min.js");

self.onmessage = async function (e) {
  const { wasmPath, zkeyPath, input } = e.data;

  try {
    self.postMessage({ type: "status", message: "Generating witness..." });

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      wasmPath,
      zkeyPath
    );

    self.postMessage({ type: "status", message: "Formatting calldata..." });

    const calldata = await snarkjs.groth16.exportSolidityCallData(
      proof,
      publicSignals
    );

    self.postMessage({
      type: "result",
      proof,
      publicSignals,
      calldata,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      error: error.message || "Proof generation failed",
    });
  }
};
