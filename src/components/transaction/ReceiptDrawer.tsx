'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Hash,
  Network,
  Route,
  Clock,
  Shield,
  Store,
  Bot,
  Landmark,
} from 'lucide-react';
import type { TransactionReceipt } from '@/types';
import { formatUSDC, formatTimestamp, truncateHash } from '@/lib/utils';
import ProofButton from '@/components/shared/ProofButton';
import MetricRow, { MetricDivider } from '@/components/shared/MetricRow';
import StatusPill from '@/components/shared/StatusPill';

interface ReceiptDrawerProps {
  receipt: TransactionReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

function statusVariant(status: TransactionReceipt['status']): 'success' | 'warning' | 'danger' | 'muted' | 'violet' {
  switch (status) {
    case 'confirmed': return 'success';
    case 'simulated': return 'violet';
    case 'pending':   return 'warning';
    case 'failed':    return 'danger';
    default:          return 'muted';
  }
}

export default function ReceiptDrawer({ receipt, isOpen, onClose }: ReceiptDrawerProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && receipt && (
        <>
          {/* Backdrop */}
          <motion.div
            key="receipt-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(8,10,14,0.8)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.aside
            key="receipt-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
            style={{
              width: 'clamp(360px, 30vw, 480px)',
              background: 'var(--color-bg-secondary)',
              borderLeft: '1px solid var(--color-border-default)',
              boxShadow: '-8px 0 48px rgba(0,0,0,0.6)',
            }}
            role="dialog"
            aria-label="Settlement Receipt"
          >
            {/* ── Drawer header ─────────────────────────────────────────── */}
            <div
              className="flex-shrink-0 flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              {/* Status circle */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: receipt.status === 'confirmed'
                    ? 'rgba(159,232,112,0.08)'
                    : receipt.isDemoTx
                      ? 'rgba(124,92,252,0.08)'
                      : 'rgba(245,158,11,0.08)',
                }}
              >
                {receipt.status === 'confirmed' || receipt.status === 'simulated' ? (
                  <CheckCircle2
                    className="w-5 h-5"
                    style={{ color: receipt.status === 'confirmed' ? '#9fe870' : '#7c5cfc' }}
                  />
                ) : (
                  <AlertTriangle className="w-5 h-5" style={{ color: '#f59e0b' }} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2
                    className="text-sm font-bold text-[var(--color-text-primary)] leading-tight"
                    style={{ fontFeatureSettings: '"calt" 1' }}
                  >
                    Settlement Receipt
                  </h2>
                  <StatusPill variant={statusVariant(receipt.status)} dot>
                    {receipt.status}
                  </StatusPill>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  {formatTimestamp(receipt.timestamp)}
                </p>
              </div>

              <button
                id="receipt-close-btn"
                onClick={onClose}
                className="p-2 rounded-xl transition-all hover:scale-105"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Close receipt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Body (scrollable) ──────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

              {/* ── Amount hero ─────────────────────────────────────────── */}
              <div
                className="rounded-2xl px-5 py-5 text-center relative overflow-hidden"
                style={{
                  background: receipt.status === 'confirmed'
                    ? 'rgba(159,232,112,0.04)'
                    : receipt.isDemoTx
                      ? 'rgba(124,92,252,0.04)'
                      : 'var(--color-bg-elevated)',
                  border: receipt.status === 'confirmed'
                    ? '1px solid rgba(159,232,112,0.15)'
                    : receipt.isDemoTx
                      ? '1px solid rgba(124,92,252,0.15)'
                      : '1px solid var(--color-border-subtle)',
                }}
              >
                {/* Glow effect on confirmed */}
                {receipt.status === 'confirmed' && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 50% 0%, rgba(159,232,112,0.08) 0%, transparent 70%)',
                    }}
                  />
                )}

                <div
                  className="text-3xl font-black tracking-tight relative z-10"
                  style={{
                    color: receipt.status === 'confirmed' ? '#9fe870' : 'var(--color-text-primary)',
                    fontFeatureSettings: '"calt" 1',
                  }}
                >
                  {formatUSDC(receipt.amount)}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1 relative z-10">
                  {receipt.currency} on {receipt.network}
                </div>
                <div className="mt-2 relative z-10">
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: 'rgba(159,232,112,0.08)',
                      color: '#9fe870',
                      border: '1px solid rgba(159,232,112,0.15)',
                    }}
                  >
                    {receipt.serviceTitle}
                  </span>
                </div>
              </div>

              {/* ── Parties ─────────────────────────────────────────────── */}
              <div
                className="rounded-2xl p-4 space-y-2"
                style={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  Parties
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9fe870' }} />
                  <span className="text-xs text-[var(--color-text-muted)]">Sender</span>
                  <span className="ml-auto text-[11px] font-mono text-[var(--color-text-secondary)]">
                    {receipt.senderLabel || (receipt.fromAddress ? truncateHash(receipt.fromAddress, 6) : 'Buyer Agent')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                  <span className="text-xs text-[var(--color-text-muted)]">Recipient</span>
                  <span className="ml-auto text-[11px] font-mono text-[var(--color-text-secondary)]">
                    {receipt.recipientLabel || (receipt.toAddress ? truncateHash(receipt.toAddress, 6) : 'Seller Vendor')}
                  </span>
                </div>
              </div>

              {/* ── Transaction Details ─────────────────────────────────── */}
              <div
                className="rounded-2xl p-4 space-y-1"
                style={{
                  background: 'var(--color-bg-primary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  Transaction
                </div>

                <MetricRow
                  label="TX Hash"
                  value={receipt.txHash ? truncateHash(receipt.txHash, 8) : 'pending'}
                  mono
                />
                <MetricRow label="Route" value={receipt.route} mono color="#9fe870" />
                <MetricRow label="Block" value={receipt.blockNumber} mono />
                <MetricRow label="Gas Used" value={receipt.gasUsed} mono />
                <MetricDivider />
                <MetricRow
                  label="Policy Decision"
                  value={receipt.policyDecisionSummary}
                  color="#9fe870"
                />
                {receipt.liveArchitectureValid !== undefined && (
                  <MetricRow
                    label="Architecture"
                    value={receipt.liveArchitectureValid ? 'Valid' : 'Warning'}
                    color={receipt.liveArchitectureValid ? '#9fe870' : '#f59e0b'}
                  />
                )}
              </div>

              {/* ── Settlement Metadata ─────────────────────────────────── */}
              {receipt.settlementMetadata && Object.keys(receipt.settlementMetadata).length > 0 && (
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Landmark className="w-3.5 h-3.5" style={{ color: '#14b8a6' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                      Arc Settlement Metadata
                    </span>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(receipt.settlementMetadata).map(([k, v]) => (
                      <MetricRow key={k} label={k} value={v} mono />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Architecture warning ────────────────────────────────── */}
              {receipt.architectureWarning && (
                <div
                  className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs"
                  style={{
                    background: 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.18)',
                    color: '#f59e0b',
                  }}
                >
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{receipt.architectureWarning}</span>
                </div>
              )}
            </div>

            {/* ── Footer: Arc proof CTA ──────────────────────────────────── */}
            <div
              className="flex-shrink-0 px-5 py-4"
              style={{ borderTop: '1px solid var(--color-border-subtle)' }}
            >
              <ProofButton
                arcScanUrl={receipt.arcScanUrl}
                isDemoTx={receipt.isDemoTx}
              />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
