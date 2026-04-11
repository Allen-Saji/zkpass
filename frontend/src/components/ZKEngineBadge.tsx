"use client";

import { Zap, Loader2, AlertCircle } from "lucide-react";

interface ZKEngineBadgeProps {
  ready: boolean;
  loading: boolean;
  error: string | null;
  sizeLoaded: string | null;
}

export function ZKEngineBadge({ ready, loading, error, sizeLoaded }: ZKEngineBadgeProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-error-dim border border-[var(--error)] text-[var(--error)] text-xs font-mono">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>ZK engine error</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border text-text-secondary text-xs font-mono">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading ZK engine...</span>
      </div>
    );
  }

  if (ready) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-dim border border-border-accent text-accent text-xs font-mono">
        <Zap className="w-3.5 h-3.5" />
        <span>ZK engine loaded ({sizeLoaded})</span>
      </div>
    );
  }

  return null;
}
