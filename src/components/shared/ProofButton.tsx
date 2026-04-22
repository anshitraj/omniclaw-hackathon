'use client';

/**
 * ProofButton — the Arc settlement proof CTA
 * Handles three states:
 *  1. Live proof URL available → active "View on ArcScan" link
 *  2. Demo transaction → disabled button with clear "DEMO" explanation
 *  3. URL unavailable → "Proof unavailable yet" fallback
 */

import { Globe, ExternalLink, Lock } from 'lucide-react';

interface ProofButtonProps {
  arcScanUrl?: string | null;
  isDemoTx?: boolean;
  className?: string;
}

export default function ProofButton({ arcScanUrl, isDemoTx, className = '' }: ProofButtonProps) {
  /* ── Live proof available ── */
  if (arcScanUrl && !isDemoTx) {
    return (
      <a
        href={arcScanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl font-semibold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
        style={{
          background: 'rgba(159,232,112,0.1)',
          border: '1px solid rgba(159,232,112,0.25)',
          color: '#9fe870',
        }}
      >
        <Globe className="w-4 h-4" />
        View Settlement Proof on ArcScan
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </a>
    );
  }

  /* ── Demo transaction ── */
  if (isDemoTx) {
    return (
      <div
        className={`flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl text-sm select-none cursor-not-allowed ${className}`}
        style={{
          background: 'rgba(124,92,252,0.06)',
          border: '1px solid rgba(124,92,252,0.15)',
          color: '#566680',
        }}
        title="Demo mode: no on-chain transaction was made."
      >
        <Lock className="w-4 h-4 opacity-60" />
        <span>Simulated TX</span>
        <span
          className="ml-1 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold"
          style={{ background: 'rgba(124,92,252,0.12)', color: '#7c5cfc' }}
        >
          DEMO
        </span>
        <span className="text-[11px] opacity-60">· no on-chain proof</span>
      </div>
    );
  }

  /* ── Proof not yet available (live but no URL) ── */
  return (
    <div
      className={`flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl text-sm select-none ${className}`}
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border-subtle)',
        color: 'var(--color-text-muted)',
      }}
    >
      <Globe className="w-4 h-4 opacity-50" />
      Arc proof pending confirmation
    </div>
  );
}
