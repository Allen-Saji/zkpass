"use client";

import { useState, useCallback } from "react";
import { Credential } from "@/lib/types";
import { useZKEngine } from "@/hooks/useZKEngine";
import { ZKEngineBadge } from "@/components/ZKEngineBadge";
import { CredentialPanel } from "@/components/CredentialPanel";
import { ProvePanel } from "@/components/ProvePanel";
import { Footer } from "@/components/Footer";

export default function Home() {
  const zkEngine = useZKEngine();
  const [credential, setCredential] = useState<Credential | null>(null);
  const [loadingCred, setLoadingCred] = useState(false);

  const handleLoadCredential = useCallback(async () => {
    setLoadingCred(true);
    try {
      const res = await fetch("/credential.json");
      if (!res.ok) throw new Error("Failed to load credential");
      const data = await res.json();
      setCredential(data);
    } catch (err) {
      console.error("Failed to load credential:", err);
    } finally {
      setLoadingCred(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0ms", animationFillMode: "both" }}
          >
            <h1 className="text-[28px] font-extrabold leading-none tracking-tight">
              <span className="text-white">zk</span>
              <span className="text-accent">pass</span>
            </h1>
          </div>
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "50ms", animationFillMode: "both" }}
          >
            <ZKEngineBadge
              ready={zkEngine.ready}
              loading={zkEngine.loading}
              error={zkEngine.error}
              sizeLoaded={zkEngine.sizeLoaded}
            />
          </div>
        </div>
      </header>

      {/* Tagline */}
      <div className="px-4 pb-8">
        <div className="max-w-[1200px] mx-auto">
          <p
            className="text-lg text-text-secondary animate-fade-in-up"
            style={{ animationDelay: "50ms", animationFillMode: "both" }}
          >
            Prove who you are. Reveal nothing else.
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-4 pb-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CredentialPanel
            credential={credential}
            onLoad={handleLoadCredential}
            loading={loadingCred}
          />
          <ProvePanel credential={credential} zkReady={zkEngine.ready} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
