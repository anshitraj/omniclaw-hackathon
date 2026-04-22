'use client';

/**
 * WalletChip — compact wallet address + USDC balance display for navbar
 * Handles: live data, loading, missing config, architecture warning states
 */

import { useState, useCallback } from 'react';
import { Wallet, Copy, Check, AlertTriangle } from 'lucide-react';
import { truncateHash } from '@/lib/utils';

interface WalletChipProps {
  label: string;
  actor: 'buyer' | 'seller';
  address?: string | null;
  usdc?: number;
  eurc?: number;
  loading?: boolean;
  warning?: boolean;
  warningText?: string;
  configured?: boolean;
  copyId?: string;
}

const actorColors = {
  buyer: {
    dot: '#9fe870',
    dotWarn: '#ef4444',
    icon: '#9fe870',
    border: 'rgba(159,232,112,0.15)',
    bg: 'rgba(159,232,112,0.04)',
  },
  seller: {
    dot: '#f59e0b',
    dotWarn: '#ef4444',
    icon: '#f59e0b',
    border: 'rgba(245,158,11,0.15)',
    bg: 'rgba(245,158,11,0.04)',
  },
};

export default function WalletChip({
  label,
  actor,
  address,
  usdc,
  eurc,
  loading = false,
  warning = false,
  warningText,
  configured = true,
  copyId,
}: WalletChipProps) {
  const [copied, setCopied] = useState(false);
  const col = actorColors[actor];

  const copyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
    }
  }, [address]);

  if (!configured) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono select-none"
        style={{
          background: 'rgba(86,102,128,0.06)',
          border: '1px solid rgba(86,102,128,0.15)',
          color: '#566680',
        }}
      >
        <Wallet className="w-3 h-3" />
        <span>{label}</span>
        <span className="opacity-50">not configured</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono transition-all"
      style={{
        background: col.bg,
        border: `1px solid ${warning ? 'rgba(239,68,68,0.25)' : col.border}`,
      }}
      title={address || `${label} not available`}
    >
      {/* Status dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          backgroundColor: warning ? col.dotWarn : col.dot,
          boxShadow: warning ? '0 0 6px rgba(239,68,68,0.5)' : `0 0 6px ${col.dot}60`,
        }}
      />

      {warning && (
        <span title={warningText}>
          <AlertTriangle className="w-3 h-3 text-[var(--color-accent-red)] flex-shrink-0" />
        </span>
      )}

      {/* Wallet icon */}
      <Wallet className="w-3 h-3 flex-shrink-0" style={{ color: col.icon, opacity: 0.7 }} />

      {/* Label */}
      <span className="text-[var(--color-text-muted)]">{label}</span>

      <span className="text-[var(--color-border-default)]">·</span>

      {/* Address */}
      <span className="text-[var(--color-text-secondary)]">
        {address ? truncateHash(address, 4) : 'n/a'}
      </span>

      <span className="text-[var(--color-border-default)]">·</span>

      {/* USDC balance */}
      <span style={{ color: col.dot }}>
        {loading ? '…' : `${(usdc ?? 0).toFixed(2)} USDC`}
      </span>

      {typeof eurc === 'number' && eurc > 0 && (
        <>
          <span className="text-[var(--color-border-default)]">·</span>
          <span className="text-[var(--color-accent-blue)]">
            {eurc.toFixed(2)} EURC
          </span>
        </>
      )}

      {/* Copy button */}
      {address && (
        <button
          id={copyId}
          onClick={copyAddress}
          className="ml-0.5 p-0.5 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
          title={`Copy ${label} address`}
          aria-label={`Copy ${label} address`}
        >
          {copied ? (
            <Check className="w-3 h-3 text-[var(--color-accent-green)]" />
          ) : (
            <Copy className="w-3 h-3 text-[var(--color-text-muted)]" />
          )}
        </button>
      )}
    </div>
  );
}
