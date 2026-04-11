"use client";

import { useState, useEffect, useRef } from "react";

interface ZKEngineState {
  ready: boolean;
  loading: boolean;
  error: string | null;
  sizeLoaded: string | null;
}

export function useZKEngine() {
  const [state, setState] = useState<ZKEngineState>({
    ready: false,
    loading: true,
    error: null,
    sizeLoaded: null,
  });
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    async function preload() {
      try {
        const [wasmRes, zkeyRes] = await Promise.all([
          fetch("/zk/ZKPassVerifier.wasm"),
          fetch("/zk/ZKPassVerifier_final.zkey"),
        ]);

        if (!wasmRes.ok || !zkeyRes.ok) {
          throw new Error("Failed to fetch ZK assets");
        }

        // content-length may not be available in dev mode, use known sizes as fallback
        const wasmSize = Number(wasmRes.headers.get("content-length") || 2950000);
        const zkeySize = Number(zkeyRes.headers.get("content-length") || 4800000);
        const totalMB = ((wasmSize + zkeySize) / (1024 * 1024)).toFixed(1);

        setState({
          ready: true,
          loading: false,
          error: null,
          sizeLoaded: `${totalMB}MB`,
        });
      } catch (err) {
        setState({
          ready: false,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load ZK engine",
          sizeLoaded: null,
        });
      }
    }

    preload();
  }, []);

  return state;
}
