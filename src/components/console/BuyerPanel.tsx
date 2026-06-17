'use client';

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
} from 'lucide-react';
import type { Agent, TransactionState, WalletSummary } from '@/types';
import { formatUSDC, truncateHash } from '@/lib/utils';
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
  onRefreshWalletData: () => void;
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
  onRefreshWalletData,
}: BuyerPanelProps) {
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
              <span className="font-mono">{agent.budgetCap === null ? 'N/A' : formatUSDC(agent.budgetCap)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-secondary)]">
              <span>Used</span>
              <span className="font-mono">{formatUSDC(agent.budgetUsed)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-hover)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-accent-violet)] transition-all duration-500"
                style={{ width: `${agent.budgetCap ? (agent.budgetUsed / agent.budgetCap) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              <Wallet className="w-3 h-3 inline mr-1" />
              Buyer OmniClaw Balance
            </label>
            <button
              onClick={onRefreshWalletData}
              className="p-1 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
              title="Refresh buyer OmniClaw balances"
            >
              <RefreshCw className="w-3 h-3 text-[var(--color-text-muted)]" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <Row label="Address" value={walletSummary?.address ? truncateHash(walletSummary.address, 6) : 'Not configured'} mono />
            <Row label="Wallet ID" value={walletSummary?.walletId ? truncateHash(walletSummary.walletId, 6) : 'Not configured'} mono />
            <Row
              label="OmniClaw (API ledger)"
              value={formatUSDC(walletSummary?.gatewayBalance ?? walletSummary?.usdcBalance ?? 0)}
              color="var(--color-accent-green)"
            />
            <Row
              label="OmniClaw (On-chain)"
              value={formatUSDC(walletSummary?.gatewayOnchainBalance ?? 0)}
              color="var(--color-accent-blue)"
            />
            {walletSummary?.gatewayBalance !== undefined &&
              walletSummary?.gatewayOnchainBalance !== undefined &&
              Math.abs(walletSummary.gatewayBalance - walletSummary.gatewayOnchainBalance) > 0.000001 && (
                <p className="text-[10px] text-[var(--color-accent-amber)] mt-1">
                  OmniClaw API ledger and on-chain balances currently differ.
                </p>
              )}
          </div>
        </div>

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
          Reset
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


