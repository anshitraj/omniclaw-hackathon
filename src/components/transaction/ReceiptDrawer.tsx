'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Copy,
  Shield,
  Layers,
  Globe,
  Receipt,
} from 'lucide-react';
import type { TransactionReceipt } from '@/types';
import { formatUSDC } from '@/lib/utils';
import { useState } from 'react';

interface ReceiptDrawerProps {
  receipt: TransactionReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptDrawer({ receipt, isOpen, onClose }: ReceiptDrawerProps) {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    if (!receipt?.txHash) return;
    navigator.clipboard.writeText(receipt.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedApiResponse = (() => {
    const payload = receipt?.apiResponse ?? receipt?.payEnvelope ?? null;
    if (!payload) return null;
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  })();

  const explorerBase = 'https://testnet.arcscan.app';
  const txHash = typeof receipt?.txHash === 'string' ? receipt.txHash : '';
  const hasHashLikeTx = txHash.startsWith('0x') && txHash.length >= 12;
  const arcScanTxLink =
    receipt?.arcScanUrl || receipt?.proofLink || (hasHashLikeTx ? `${explorerBase}/tx/${txHash}` : null);

  const fallbackAddress = (() => {
    const envelope = receipt?.payEnvelope as Record<string, unknown> | undefined;
    const api = receipt?.apiResponse as Record<string, unknown> | undefined;
    const candidates = [
      envelope?.buyer_address,
      envelope?.payment_address,
      envelope?.payer,
      api?.buyer_address,
      api?.payment_address,
      receipt?.fromAddress,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && /^0x[a-fA-F0-9]{40}$/.test(c)) return c;
    }
    return null;
  })();
  const arcScanFallbackLink = fallbackAddress ? `${explorerBase}/address/${fallbackAddress}` : null;

  return (
    <AnimatePresence>
      {isOpen && receipt && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-[var(--color-bg-secondary)] border-l border-[var(--color-border-default)] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-accent-green)]/10 flex items-center justify-center">
                  <Receipt className="w-4.5 h-4.5 text-[var(--color-accent-green)]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Transaction Proof</h2>
                  <p className="text-xs text-[var(--color-text-muted)]">Settlement evidence and routing</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors">
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-accent-green)]/5 border border-[var(--color-accent-green)]/10">
                <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-green)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-accent-green)]">{receipt.status === 'confirmed' ? 'Settlement Confirmed' : 'Settlement Submitted'}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{new Date(receipt.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">Transaction Hash</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono text-[var(--color-text-secondary)] bg-[var(--color-bg-primary)] px-3 py-2 rounded-lg border border-[var(--color-border-subtle)] truncate">
                    {receipt.txHash}
                  </code>
                  <button
                    onClick={copyHash}
                    className="p-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors"
                  >
                    <Copy className={`w-3.5 h-3.5 ${copied ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-text-muted)]'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <DetailRow label="Service" value={receipt.serviceTitle} />
                <DetailRow label="Amount" value={formatUSDC(receipt.amount)} highlight />
                <DetailRow label="Token" value={receipt.currency} />
                <DetailRow label="Direction" value={receipt.direction || 'sent'} />
                <DetailRow label="Network" value={receipt.network} />
                <DetailRow label="Route" value={receipt.route} />
                <DetailRow label="Status" value={receipt.status} status />
                {receipt.blockNumber && <DetailRow label="Block Number" value={receipt.blockNumber} mono />}
                {receipt.gasUsed && <DetailRow label="Gas Used" value={receipt.gasUsed} mono />}
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">
                  API Response (JSON)
                </label>
                <pre className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] overflow-x-auto max-h-64">
                  {formattedApiResponse || '{\n  "message": "No response payload was captured."\n}'}
                </pre>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">
                  <Layers className="w-3 h-3 inline mr-1" />
                  Settlement Metadata
                </label>
                <div className="space-y-1.5">
                  {Object.entries(receipt.settlementMetadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)] text-xs">
                      <span className="text-[var(--color-text-muted)]">{key}</span>
                      <span className="text-[var(--color-text-secondary)] font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Policy Decision
                </label>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]">
                  {receipt.policyDecisionSummary}
                </p>
              </div>

              {(() => {
                const href = arcScanTxLink || arcScanFallbackLink || explorerBase;
                const label = arcScanTxLink
                  ? 'View on ArcScan'
                  : arcScanFallbackLink
                    ? 'View Buyer Activity on ArcScan'
                    : 'Open ArcScan';

                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[var(--color-accent-blue)]/10 border border-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)] text-sm font-semibold hover:bg-[var(--color-accent-blue)]/15 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    {label}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                );
              })()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DetailRow({
  label,
  value,
  mono,
  highlight,
  status,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  status?: boolean;
}) {
  return (
    <div className="flex justify-between items-center px-3 py-2 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]">
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
      <span
        className={`text-xs ${
          highlight
            ? 'text-[var(--color-accent-green)] font-semibold'
            : status
              ? 'text-[var(--color-accent-green)]'
              : 'text-[var(--color-text-secondary)]'
        } ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
