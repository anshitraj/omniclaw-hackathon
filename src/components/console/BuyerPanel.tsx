'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Shield,
  Wallet,
  Target,
  ShieldCheck,
  Activity,
  KeyRound,
  Gauge,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import type { Agent, TransactionState, WalletHistoryItem, WalletSummary } from '@/types';
import { formatUSDC, formatTimestamp, truncateHash } from '@/lib/utils';
import { STATE_LABELS } from '@/types';

interface BuyerPanelProps {
  agent: Agent;
  transactionState: TransactionState;
  onInspect: () => void;
  onPolicyCheck: () => void;
  onExecute: () => void;
  onReset: () => void;
  isRunning: boolean;
  walletSummary: WalletSummary | null;
  history: WalletHistoryItem[];
  onRefreshWalletData: () => void;
  architectureWarning?: string;
}

export default function BuyerPanel({
  agent,
  transactionState,
  onInspect,
  onPolicyCheck,
  onExecute,
  onReset,
  isRunning,
  walletSummary,
  history,
  onRefreshWalletData,
  architectureWarning,
}: BuyerPanelProps) {
  const [historyOpen, setHistoryOpen] = useState(true);

  const trustColor =
    agent.trustLevel === 'high'
      ? 'var(--color-accent-green)'
      : agent.trustLevel === 'medium'
        ? 'var(--color-accent-amber)'
        : 'var(--color-accent-red)';

  const lastUpdated = useMemo(() => {
    if (!walletSummary?.lastUpdated) return 'n/a';
    return formatTimestamp(walletSummary.lastUpdated);
  }, [walletSummary?.lastUpdated]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-violet)]/10 flex items-center justify-center">
          <Bot className="w-4 h-4 text-[var(--color-accent-violet)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Buyer Agent</h2>
          <p className="text-xs text-[var(--color-text-muted)]">{agent.name}</p>
        </div>
        <div className="ml-auto">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono"
            style={{ backgroundColor: `${trustColor}15`, color: trustColor }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: trustColor }} />
            {agent.trustLevel}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">
            <Target className="w-3 h-3 inline mr-1" />
            Objective
          </label>
          <p className="text-sm text-[var(--color-text-secondary)]">{agent.objective}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1 block">
            <Activity className="w-3 h-3 inline mr-1" />
            Current Step
          </label>
          <span className="inline-flex px-2.5 py-1 rounded-md bg-[var(--color-bg-hover)] text-xs font-mono text-[var(--color-accent-violet)]">
            {STATE_LABELS[transactionState] || transactionState}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]">
          <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2 block">
            <ShieldCheck className="w-3 h-3 inline mr-1" />
            Spend Policy
          </label>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Budget Cap</span>
              <span className="font-mono">{formatUSDC(agent.budgetCap)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Used</span>
              <span className="font-mono">{formatUSDC(agent.budgetUsed)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-hover)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-accent-violet)] transition-all duration-500"
                style={{ width: `${(agent.budgetUsed / agent.budgetCap) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              <Wallet className="w-3 h-3 inline mr-1" />
              Buyer Gateway Balance
            </label>
            <button
              onClick={onRefreshWalletData}
              className="p-1 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
              title="Refresh buyer and seller gateway balances"
            >
              <RefreshCw className="w-3 h-3 text-[var(--color-text-muted)]" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <Row label="Address" value={walletSummary?.address ? truncateHash(walletSummary.address, 6) : 'Not configured'} mono />
            <Row label="Wallet ID" value={walletSummary?.walletId ? truncateHash(walletSummary.walletId, 6) : 'Not configured'} mono />
            <Row label="USDC" value={formatUSDC(walletSummary?.usdcBalance || 0)} color="var(--color-accent-green)" />
            <Row label="EURC" value={`${(walletSummary?.eurcBalance || 0).toFixed(2)} EURC`} color="var(--color-accent-blue)" />
            <Row label="Recent Tx" value={String(walletSummary?.recentTxCount || 0)} mono />
            <Row label="Last Updated" value={lastUpdated} mono />
            {walletSummary?.legacyMode && (
              <p className="text-[10px] text-[var(--color-accent-amber)] mt-1">
                Legacy single-wallet env mode detected.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] overflow-hidden">
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--color-text-secondary)]"
          >
            <span>Buyer Recent Transactions</span>
            {historyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {historyOpen && (
            <div className="px-3 pb-3 space-y-2">
              {history.length === 0 ? (
                <p className="text-[11px] text-[var(--color-text-muted)]">No buyer transactions yet.</p>
              ) : (
                history.slice(0, 6).map((item, idx) => (
                  <div key={`${item.id}_${item.timestamp}`} className="rounded-md bg-[var(--color-bg-hover)] px-2 py-1.5 text-[10px] space-y-0.5">
                    <div className="flex justify-between text-[var(--color-text-secondary)]">
                      <span>{item.token} {item.amount}</span>
                      <span>{item.direction}</span>
                    </div>
                    <div className="flex justify-between text-[var(--color-text-muted)]">
                      <span>{truncateHash(item.txHash, 5)}</span>
                      <span>{item.status}</span>
                    </div>
                    {item.explorerUrl && (
                      <a href={item.explorerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--color-accent-blue)]">
                        View on ArcScan <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {architectureWarning && (
          <div className="px-3 py-2 rounded-lg bg-[var(--color-accent-red)]/10 border border-[var(--color-accent-red)]/20">
            <p className="text-[11px] text-[var(--color-accent-red)]">{architectureWarning}</p>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-accent-green)]/5 border border-[var(--color-accent-green)]/10">
          <KeyRound className="w-3.5 h-3.5 text-[var(--color-accent-green)]" />
          <span className="text-xs text-[var(--color-accent-green)]">No raw private key exposure</span>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-[var(--color-border-subtle)] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onInspect}
            disabled={isRunning || transactionState === 'idle'}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Shield className="w-3 h-3 inline mr-1" />
            Inspect
          </button>
          <button
            onClick={onPolicyCheck}
            disabled={isRunning || transactionState === 'idle'}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Gauge className="w-3 h-3 inline mr-1" />
            Policy Check
          </button>
        </div>
        <button
          onClick={onExecute}
          disabled={isRunning || transactionState === 'idle'}
          className="w-full px-3 py-2.5 rounded-lg text-xs font-semibold bg-[var(--color-accent-violet)] text-white hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed glow-violet"
        >
          Execute Payment
        </button>
        <button
          onClick={onReset}
          className="w-full px-3 py-2 rounded-lg text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          Reset Demo
        </button>
      </div>
    </motion.div>
  );
}

function Row({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div className="flex justify-between text-[var(--color-text-secondary)]">
      <span>{label}</span>
      <span className={mono ? 'font-mono' : ''} style={{ color: color || undefined }}>
        {value}
      </span>
    </div>
  );
}


