"use client";

import { useState, useEffect, useRef } from "react";
import { Credential } from "@/lib/types";
import {
  loadCredentials,
  deleteCredential,
  exportCredential,
  saveCredential,
  getOrCreateHolderSecret,
  getHolderSecret,
  setHolderSecret,
} from "@/lib/credentialStore";
import { PassportCard } from "@/components/PassportCard";
import {
  Shield,
  Key,
  Download,
  Upload,
  Trash2,
  Fingerprint,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [holderSecret, setSecret] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const secret = getOrCreateHolderSecret();
    setSecret(secret);
    setCredentials(loadCredentials());
  }, []);

  const handleCopySecret = async () => {
    if (!holderSecret) return;
    await navigator.clipboard.writeText(holderSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (cred: Credential) => {
    deleteCredential(cred.issuerPubKeyHash, cred.holder);
    setCredentials(loadCredentials());
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);

        // Check if it's a full backup (identity + credentials)
        if (data.holderSecret && data.credentials) {
          setHolderSecret(data.holderSecret);
          setSecret(data.holderSecret);
          for (const cred of data.credentials) {
            saveCredential(cred);
          }
        } else if (data.holder && data.signature) {
          // Single credential import
          saveCredential(data);
        }

        setCredentials(loadCredentials());
      } catch {
        alert("Invalid credential file");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be imported again
    e.target.value = "";
  };

  const handleExportBackup = () => {
    const backup = {
      holderSecret,
      credentials,
      exportedAt: new Date().toISOString(),
      version: 2,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zkpass-identity-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-10 animate-fade-in-up">
        <h1 className="text-3xl font-bold mb-2">Identity Wallet</h1>
        <p className="text-text-secondary">
          Your credentials and identity secret, stored locally in your browser.
        </p>
        <p className="text-xs text-text-muted mt-1">
          In production, this would be a dedicated identity wallet app (like Polygon ID Wallet).
        </p>
      </div>

      {/* Identity Secret */}
      <div className="rounded-2xl border border-border bg-bg-surface p-6 mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-warning" />
            <span className="text-sm font-semibold">Identity Secret</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
              title={showSecret ? "Hide" : "Reveal"}
            >
              {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleCopySecret}
              className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
              title="Copy"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-accent" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-bg-base border border-border p-3 mb-3">
          <p className="font-mono text-xs break-all select-all">
            {showSecret
              ? holderSecret
              : holderSecret
              ? "\u2022".repeat(40)
              : "Loading..."}
          </p>
        </div>

        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-text-muted">
            This secret binds your identity to your credentials. Without it, your credentials
            are useless. Back it up securely. It never leaves your device.
          </p>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Credentials ({credentials.length})
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            disabled={credentials.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:border-border-hover hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-3 h-3" />
            Export Backup
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors"
          >
            <Upload className="w-3 h-3" />
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Link
            href="/issue"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-bg-base text-xs font-semibold hover:brightness-110 transition-all"
          >
            <Shield className="w-3 h-3" />
            Get New Credential
          </Link>
        </div>
      </div>

      {/* Credentials list */}
      {credentials.length === 0 ? (
        <div
          className="rounded-2xl border border-border border-dashed bg-bg-surface/50 p-16 text-center animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          <Shield className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Credentials Yet</h3>
          <p className="text-sm text-text-secondary mb-6">
            Get your first identity credential from a KYC provider to start using ZKPass.
          </p>
          <Link
            href="/issue"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-bg-base font-semibold rounded-xl hover:brightness-110 transition-all"
          >
            Get Credential
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {credentials.map((cred, i) => (
            <div
              key={`${cred.issuerPubKeyHash}-${cred.holder}`}
              className="animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 50}ms` }}
            >
              <PassportCard credential={cred} />

              <div className="flex items-center gap-2 mt-3 ml-1">
                <Link
                  href="/claim"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-bg-base text-xs font-semibold hover:brightness-110 transition-all"
                >
                  <Fingerprint className="w-3 h-3" />
                  Prove &amp; Claim
                </Link>
                <button
                  onClick={() => exportCredential(cred)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:border-border-hover hover:text-text-primary transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
                <button
                  onClick={() => handleDelete(cred)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:border-error hover:text-error transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
