'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Shield,
  Wallet,
  Target,
  ShieldCheck,
  Activity,
  KeyRound,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import type { Agent, TransactionState, WalletHistoryItem, WalletSummary, PolicyCheckResult } from '@/types';
import { formatUSDC, formatTimestamp, truncateHash } from '@/lib/utils';
import { STATE_LABELS } from '@/types';
import StatusPill from '@/components/shared/StatusPill';
import MetricRow, { MetricDivider } from '@/components/shared/MetricRow';

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
  appMode?: 'live' | 'demo' | 'legacy';
  policyResult?: PolicyCheckResult | null;
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
  appMode = 'demo',
  policyResult,
}: BuyerPanelProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  // Auto-open policy accordion when result arrives
  useEffect(() => {
    if (policyResult) setPolicyOpen(true);
  }, [policyResult]);

  const trustColor =
    agent.trustLevel === 'high'
      ? '#9fe870'
      : agent.trustLevel === 'medium'
        ? '#f59e0b'
        : '#ef4444';

  const trustVariant =
    agent.trustLevel === 'high'
      ? 'green'
      : agent.trustLevel === 'medium'
        ? 'warning'
        : 'danger';

  const budgetPct = Math.min((agent.budgetUsed / agent.budgetCap) * 100, 100);
  const lastUpdated = walletSummary?.lastUpdated ? formatTimestamp(walletSummary.lastUpdated) : null;
  const isIdle = transactionState === 'idle';

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full"
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        <div
          className="w-8 h-8  flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(159,232,112,0.08)' }}
        >
          <Bot className="w-4 h-4" style={{ color: '#9fe870' }} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[var(--color-text-primary)] leading-tight" style={{ fontFeatureSettings: '"calt" 1' }}>
            Buyer Agent
          </h2>
          <p className="text-[11px] text-[var(--color-text-muted)] truncate">{agent.name}</p>
        </div>
        <div className="ml-auto flex-shrink-0">
          <StatusPill variant={trustVariant as 'green' | 'warning' | 'danger'} dot>
            {agent.trustLevel}
          </StatusPill>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* Architecture warning */}
        {architectureWarning && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 text-xs"
            style={{
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.18)',
              color: '#ef4444',
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{architectureWarning}</span>
          </div>
        )}

        {/* Objective */}
        <div>
          <label
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Target className="w-3 h-3" />
            Objective
          </label>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {agent.objective}
          </p>
        </div>

        {/* Current Step */}
        <div>
          <label
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Activity className="w-3 h-3" />
            Current Step
          </label>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5  text-xs font-mono font-semibold"
            style={{
              background: transactionState === 'fulfilled'
                ? 'rgba(159,232,112,0.08)'
                : transactionState === 'error'
                  ? 'rgba(239,68,68,0.08)'
                  : 'var(--color-bg-elevated)',
              color: transactionState === 'fulfilled'
                ? '#9fe870'
                : transactionState === 'error'
                  ? '#ef4444'
                  : 'var(--color-text-secondary)',
              border: transactionState === 'fulfilled'
                ? '1px solid rgba(159,232,112,0.2)'
                : transactionState === 'error'
                  ? '1px solid rgba(239,68,68,0.2)'
                  : '1px solid var(--color-border-subtle)',
            }}
          >
            {transactionState === 'fulfilled' && <span className="w-1.5 h-1.5 rounded-full bg-[#9fe870]" />}
            {STATE_LABELS[transactionState] || transactionState}
          </span>
        </div>

        {/* Spend Policy */}
        <div
          className="p-3 space-y-3"
          style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <label
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <ShieldCheck className="w-3 h-3" />
            Spend Policy
          </label>

          <MetricRow label="Budget Cap" value={formatUSDC(agent.budgetCap)} />
          <MetricRow
            label="Used"
            value={formatUSDC(agent.budgetUsed)}
            color={budgetPct > 80 ? '#f59e0b' : undefined}
          />
          <MetricRow
            label="Remaining"
            value={formatUSDC(agent.budgetCap - agent.budgetUsed)}
            color="#9fe870"
          />

          {/* Budget progress bar */}
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--color-bg-hover)' }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${budgetPct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: budgetPct > 80
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : 'linear-gradient(90deg, #9fe870, #22c55e)',
              }}
            />
          </div>

          <div className="pt-1">
            <MetricRow label="Policy" value={agent.policyStatus} color="#9fe870" />
            <MetricRow label="Network" value={agent.network} mono />
          </div>
        </div>

        {/* Buyer Gateway Balance */}
        <div
          className="p-3 space-y-2"
          style={{
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div className="flex items-center justify-between">
            <label
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <Wallet className="w-3 h-3" />
              Buyer Gateway
            </label>
            <button
              onClick={onRefreshWalletData}
              className="p-1  transition-all hover:scale-105"
              style={{ color: 'var(--color-text-muted)' }}
              title="Refresh wallet data"
              aria-label="Refresh buyer wallet"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Live wallet data or fallback */}
          {walletSummary ? (
            <>
              <MetricRow label="Address" value={walletSummary.address ? truncateHash(walletSummary.address, 6) : null} mono placeholder="Not configured" />
              <MetricRow label="USDC" value={formatUSDC(walletSummary.usdcBalance)} color="#9fe870" />
              <MetricRow label="EURC" value={`${(walletSummary.eurcBalance || 0).toFixed(2)} EURC`} color="#3b82f6" />
              <MetricDivider />
              <MetricRow
                label="Balance Source"
                value={walletSummary.gatewayBalanceSource || 'API'}
                mono
                badge={walletSummary.gatewayBalanceSource === 'On-chain Fallback' ? 'fallback' : undefined}
                badgeVariant="amber"
              />
              <MetricRow label="Sync Status" value={walletSummary.gatewayBalanceSyncStatus || 'n/a'} mono />
              {lastUpdated && <MetricRow label="Updated" value={lastUpdated} mono />}

              {walletSummary.legacyMode && (
                <div
                  className="flex items-center gap-1.5 mt-2 text-[10px] px-2 py-1.5 "
                  style={{ background: 'rgba(245,158,11,0.06)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)' }}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Legacy Direct Mode env detected
                </div>
              )}

              {walletSummary.gatewayBalanceSource === 'On-chain Fallback' && (
                <div
                  className="text-[10px] mt-1 px-2 py-1.5 "
                  style={{ background: 'rgba(59,130,246,0.06)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.15)' }}
                >
                  On-chain fallback active — API balance lagging
                </div>
              )}
            </>
          ) : (
            <div className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
              {appMode === 'demo'
                ? 'Demo mode — wallet data simulated'
                : 'Fetching wallet data…'}
            </div>
          )}
        </div>

        {/* Why this payment is allowed (policy clarity) */}
        {transactionState !== 'idle' && (
          <div
            className="flex items-start gap-2 px-3 py-2.5 text-[11px]"
            style={{
              background: 'rgba(159,232,112,0.04)',
              border: '1px solid rgba(159,232,112,0.12)',
            }}
          >
            <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: '#9fe870' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Payment flows through <span style={{ color: '#9fe870' }}>Circle Gateway</span> →
              Arc Testnet settlement → seller credited via Gateway balance
            </span>
          </div>
        )}

        {/* Policy Checks Accordion — auto-expands on approval */}
        {policyResult && (
          <div
            className="overflow-hidden"
            style={{ border: '1px solid rgba(159,232,112,0.2)' }}
          >
            <button
              onClick={() => setPolicyOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors"
              style={{
                background: 'rgba(159,232,112,0.06)',
                color: '#9fe870',
              }}
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                5-Point Policy Checks — All Passed
              </span>
              {policyOpen
                ? <ChevronUp className="w-3 h-3" />
                : <ChevronDown className="w-3 h-3" />
              }
            </button>

            <AnimatePresence>
              {policyOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3 pt-2 space-y-1.5" style={{ background: 'rgba(159,232,112,0.03)' }}>
                    {policyResult.checks.map((check) => (
                      <div key={check.name} className="flex items-start gap-2">
                        <CheckCircle2
                          className="w-3 h-3 flex-shrink-0 mt-0.5"
                          style={{ color: check.passed ? '#9fe870' : '#ef4444' }}
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                            {check.name}
                          </span>
                          <span className="text-[10px] ml-1.5 font-mono" style={{ color: 'var(--color-text-muted)' }}>
                            {check.constraint}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Security notice */}
        <div
          className="flex items-center gap-2 px-3 py-2 "
          style={{
            background: 'rgba(159,232,112,0.04)',
            border: '1px solid rgba(159,232,112,0.1)',
          }}
        >
          <KeyRound className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#9fe870' }} />
          <span className="text-[11px]" style={{ color: '#9fe870' }}>
            No raw private key exposure — Circle Programmable Wallet
          </span>
        </div>


        {/* Transaction History (collapsible) */}
        <div
          className="overflow-hidden"
          style={{ border: '1px solid var(--color-border-subtle)' }}
        >
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors hover:bg-[var(--color-bg-hover)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span>Buyer Tx History ({history.length})</span>
            {historyOpen
              ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
              : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            }
          </button>

          {historyOpen && (
            <div className="px-3 pb-3 space-y-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {history.length === 0 ? (
                <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
                  No buyer transactions yet.
                </p>
              ) : (
                history.slice(0, 6).map((item) => (
                  <div
                    key={`${item.id}_${item.timestamp}`}
                    className=" px-2 py-2 space-y-1 mt-2"
                    style={{ background: 'var(--color-bg-hover)' }}
                  >
                    <div className="flex justify-between text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>{item.token} {item.amount}</span>
                      <span style={{ color: item.direction === 'sent' ? '#ef4444' : '#9fe870' }}>{item.direction}</span>
                    </div>
                    <div className="flex justify-between text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="font-mono">{truncateHash(item.txHash, 5)}</span>
                      <span>{item.status}</span>
                    </div>
                    {item.explorerUrl && (
                      <a
                        href={item.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] transition-colors hover:opacity-80"
                        style={{ color: '#3b82f6' }}
                      >
                        ArcScan <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Action Buttons ─────────────────────────────────────────────── */}
      <div
        className="px-5 py-4 space-y-2 flex-shrink-0 border-t"
        style={{ borderColor: 'var(--color-border-subtle)' }}
      >
        {/* Idle hint: point to seller panel */}
        {isIdle && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 text-[11px] mb-1"
            style={{
              background: 'rgba(124,92,252,0.06)',
              border: '1px solid rgba(124,92,252,0.15)',
              color: '#7c5cfc',
            }}
          >
            <ArrowRight className="w-3 h-3 flex-shrink-0" />
            <span>Select a vendor service on the right to begin</span>
          </motion.div>
        )}

        {/* Primary Execute CTA */}
        <button
          id="buyer-execute-btn"
          onClick={onExecute}
          disabled={isRunning || isIdle}
          className="btn-primary w-full py-3 text-sm justify-center"
        >
          {isRunning ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#163300] border-t-transparent animate-spin" />
              Executing…
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              {isIdle ? 'Execute Payment' : 'Execute Payment'}
            </>
          )}
        </button>

        {/* Reset */}
        <button
          id="buyer-reset-btn"
          onClick={onReset}
          className="w-full py-2 text-xs font-medium transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Reset Demo
        </button>
      </div>
    </motion.div>
  );
}

