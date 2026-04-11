"use client";

import { useState, useCallback, useRef } from "react";
import { WitnessInput, ProofResult, ProveStatus, ZKWorkerMessage } from "@/lib/types";
import { ZK_PATHS } from "@/lib/constants";

export function useProver() {
  const [status, setStatus] = useState<ProveStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [result, setResult] = useState<ProofResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const prove = useCallback(async (input: WitnessInput) => {
    setStatus("generating");
    setStatusMessage("Initializing proof engine...");
    setResult(null);
    setError(null);

    return new Promise<ProofResult>((resolve, reject) => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      const worker = new Worker("/zkWorker.js");
      workerRef.current = worker;

      worker.onmessage = (e: MessageEvent<ZKWorkerMessage>) => {
        const data = e.data;

        if (data.type === "status") {
          setStatusMessage(data.message || "Working...");
        } else if (data.type === "result") {
          const proofResult: ProofResult = {
            proof: data.proof!,
            publicSignals: data.publicSignals!,
            calldata: data.calldata!,
          };
          setResult(proofResult);
          setStatus("done");
          setStatusMessage("Proof generated successfully");
          worker.terminate();
          workerRef.current = null;
          resolve(proofResult);
        } else if (data.type === "error") {
          const errMsg = data.error || "Unknown error";
          setError(errMsg);
          setStatus("error");
          setStatusMessage("");
          worker.terminate();
          workerRef.current = null;
          reject(new Error(errMsg));
        }
      };

      worker.onerror = (err) => {
        const errMsg = err.message || "Worker error";
        setError(errMsg);
        setStatus("error");
        setStatusMessage("");
        worker.terminate();
        workerRef.current = null;
        reject(new Error(errMsg));
      };

      worker.postMessage({
        wasmPath: ZK_PATHS.wasm,
        zkeyPath: ZK_PATHS.zkey,
        input,
      });
    });
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setStatusMessage("");
    setResult(null);
    setError(null);
  }, []);

  return { status, statusMessage, result, error, prove, reset };
}
