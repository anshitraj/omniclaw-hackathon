'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from 'lucide-react';
import type { IntegrationHealth } from '@/types';
import { truncateHash } from '@/lib/utils';

interface IntegrationStatusPanelProps {
  health: IntegrationHealth;
}

function StatusIcon({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent-green)]" />
  ) : (
    <XCircle className="w-3.5 h-3.5 text-[var(--color-accent-red)]" />
  );
}

function LegacyIcon({ state }: { state: string }) {
  if (state === 'configured') return <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent-green)]" />;
  if (state === 'partially_configured') return <MinusCircle className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />;
  return <XCircle className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="font-mono text-[var(--color-text-secondary)]">{value}</span>
    </div>
  );
}

export default function IntegrationStatusPanel({ health }: IntegrationStatusPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-[var(--color-border-subtle)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 text-xs hover:bg-[var(--color-bg-hover)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-[var(--color-accent-teal)]" />
          <span className="font-medium text-[var(--color-text-secondary)]">Integration Status</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3 text-xs">
              <div className="h-px bg-[var(--color-border-subtle)]" />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-primary)] font-semibold">Buyer Circle config</span>
                  <StatusIcon value={!!health.buyerConfigured} />
                </div>
                <Row label="Buyer Wallet" value={health.buyerWalletAddress ? truncateHash(health.buyerWalletAddress, 6) : 'not set'} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-primary)] font-semibold">Seller Circle config</span>
                  <StatusIcon value={!!health.sellerConfigured} />
                </div>
                <Row label="Seller Wallet" value={health.sellerWalletAddress ? truncateHash(health.sellerWalletAddress, 6) : 'not set'} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Distinct wallets</span>
                  <StatusIcon value={!!health.buyerSellerDistinct} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Live architecture valid</span>
                  <StatusIcon value={!!health.liveArchitectureValid} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Buyer balances available</span>
                  <StatusIcon value={!!health.buyerBalancesAvailable} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Seller balances available</span>
                  <StatusIcon value={!!health.sellerBalancesAvailable} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Buyer history available</span>
                  <StatusIcon value={!!health.buyerHistoryAvailable} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Seller history available</span>
                  <StatusIcon value={!!health.sellerHistoryAvailable} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">EURC visible</span>
                  <StatusIcon value={!!health.eurcSupported} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Gateway configured</span>
                  <StatusIcon value={!!health.gatewayConfigured} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Legacy direct mode configured</span>
                  <StatusIcon value={!!health.directTransferConfigured} />
                </div>
                <Row
                  label="Active Payment Rail"
                  value={
                    health.activePaymentRail === 'gateway'
                      ? 'Circle Gateway'
                      : health.activePaymentRail === 'direct'
                        ? 'Legacy Direct Mode'
                        : 'demo'
                  }
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">OmniClaw</span>
                  <LegacyIcon state={health.omniclaw.state} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">Arc</span>
                  <LegacyIcon state={health.arc.state} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">AI</span>
                  <LegacyIcon state={health.ai.state} />
                </div>
              </div>

              {health.warnings && health.warnings.length > 0 && (
                <div className="px-2 py-2 rounded bg-[var(--color-accent-amber)]/10 border border-[var(--color-accent-amber)]/25">
                  {health.warnings.map((warning) => (
                    <p key={warning} className="text-[10px] text-[var(--color-accent-amber)]">
                      {warning}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
