'use client';

import { useReducer, useCallback, useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Receipt, Info, Wallet, RefreshCw, Copy, Check } from 'lucide-react';
import Link from 'next/link';

import BuyerPanel from '@/components/console/BuyerPanel';
import SellerPanel from '@/components/console/SellerPanel';
import EventFeed from '@/components/console/EventFeed';
import PaymentRail from '@/components/console/PaymentRail';
import ReceiptDrawer from '@/components/transaction/ReceiptDrawer';
import IntegrationStatusPanel from '@/components/console/IntegrationStatusPanel';
import { appReducer, createInitialState } from '@/lib/seed/store';
import { SERVICE_CATALOG } from '@/lib/seed/data';
import { truncateHash } from '@/lib/utils';
import type {
  SellerService,
  IntegrationHealth,
  TransactionReceipt,
  WalletHistoryItem,
  WalletSummary,
  TimelineEvent,
} from '@/types';

const STEP_DELAY = 450;

async function runLiveSequence(
  service: SellerService,
  dispatch: (a: Parameters<typeof appReducer>[1]) => void,
  refreshWalletData: () => Promise<void>
) {
  dispatch({ type: 'SET_RUNNING', running: true });

  try {
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: service.id }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error(result?.error || `Execute failed (${response.status})`);
    }

    const events: TimelineEvent[] = Array.isArray(result?.data?.events) ? result.data.events : [];
    for (const event of events) {
      await new Promise((r) => setTimeout(r, STEP_DELAY));
      dispatch({ type: 'ADD_EVENT', event });
      dispatch({ type: 'SET_STATE', state: event.state });
      if (event.state === 'policy_checking' && result?.data?.policyResult) {
        dispatch({ type: 'SET_POLICY_RESULT', result: result.data.policyResult });
      }
    }

    if (result?.data?.policyResult) {
      dispatch({ type: 'SET_POLICY_RESULT', result: result.data.policyResult });
    }

    if (result?.data?.receipt) {
      dispatch({ type: 'SET_RECEIPT', receipt: result.data.receipt as TransactionReceipt });
    }

    await refreshWalletData();
  } catch (error) {
    dispatch({ type: 'SET_ERROR', error: String(error) });
  } finally {
    dispatch({ type: 'SET_RUNNING', running: false });
  }
}

function WalletChip({
  label,
  address,
  usdc,
  loading,
  warning,
  copyId,
}: {
  label: string;
  address?: string | null;
  usdc?: number;
  loading: boolean;
  warning?: boolean;
  copyId: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // no-op
    }
  }, [address]);

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]"
      title={address || `${label} not configured`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          warning ? 'bg-[var(--color-accent-red)]' : 'bg-[var(--color-accent-green)]'
        }`}
      />
      <Wallet className="w-3 h-3 text-[var(--color-text-muted)]" />
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-[var(--color-border-subtle)]">|</span>
      <span className="text-[var(--color-text-secondary)]">{address ? truncateHash(address, 5) : 'n/a'}</span>
      <span className="text-[var(--color-border-subtle)]">|</span>
      <span className="text-[var(--color-accent-green)]">{loading ? '...' : (usdc || 0).toFixed(2)} USDC</span>
      <button
        id={copyId}
        onClick={copyAddress}
        disabled={!address}
        className="ml-1 p-0.5 rounded hover:bg-[var(--color-bg-hover)] disabled:opacity-40"
        title={address ? `Copy full ${label} address` : `${label} address not available`}
        aria-label={`Copy ${label} address`}
      >
        {copied ? (
          <Check className="w-3 h-3 text-[var(--color-accent-green)]" />
        ) : (
          <Copy className="w-3 h-3 text-[var(--color-text-muted)]" />
        )}
      </button>
    </div>
  );
}

function ConsoleContent() {
  const searchParams = useSearchParams();
  const autorun = searchParams.get('autorun') === 'true';

  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const [buyerWalletSummary, setBuyerWalletSummary] = useState<WalletSummary | null>(null);
  const [buyerHistory, setBuyerHistory] = useState<WalletHistoryItem[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);

  const fetchWalletData = useCallback(async () => {
    try {
      setWalletLoading(true);
      const [buyerWalletRes, buyerHistoryRes] = await Promise.all([
        fetch('/api/integrations/circle/buyer-wallet', { cache: 'no-store' }),
        fetch('/api/integrations/circle/buyer-history?limit=20', { cache: 'no-store' }),
      ]);

      if (buyerWalletRes.ok) {
        const json = await buyerWalletRes.json();
        if (json.success) {
          setBuyerWalletSummary(json.data as WalletSummary);
          dispatch({ type: 'SET_AGENT_BUDGET_CAP', budgetCap: json.data?.budgetCap ?? null });
        }
      }
      if (buyerHistoryRes.ok) {
        const json = await buyerHistoryRes.json();
        if (json.success) setBuyerHistory(json.data as WalletHistoryItem[]);
      }
    } finally {
      setWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
    const interval = setInterval(fetchWalletData, 20_000);
    return () => clearInterval(interval);
  }, [fetchWalletData]);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch('/api/integrations/health', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            dispatch({ type: 'UPDATE_HEALTH', health: json.data as IntegrationHealth });
          }
        }
      } catch {
        // keep current state
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectService = useCallback(
    (service: SellerService) => {
      if (state.isRunning) return;
      dispatch({ type: 'RESET' });
      dispatch({ type: 'SELECT_SERVICE', service });
    },
    [state.isRunning]
  );

  const handleRun = useCallback(async () => {
    if (!state.selectedService || state.isRunning) return;
    await runLiveSequence(state.selectedService, dispatch, fetchWalletData);
  }, [state.selectedService, state.isRunning, fetchWalletData]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setReceiptOpen(false);
  }, []);

  useEffect(() => {
    if (autorun && !state.isRunning && state.transactionState === 'idle') {
      const firstService = SERVICE_CATALOG[0];
      dispatch({ type: 'SELECT_SERVICE', service: firstService });
      setTimeout(async () => {
        await runLiveSequence(firstService, dispatch, fetchWalletData);
      }, 500);
    }
  }, [autorun, state.isRunning, state.transactionState, fetchWalletData]);

  useEffect(() => {
    if (state.receipt && state.transactionState === 'fulfilled') {
      setTimeout(() => setReceiptOpen(true), 600);
    }
  }, [state.receipt, state.transactionState]);

  const modeBadge = 'LIVE';
  const modeBadgeColor = 'var(--color-accent-green)';

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors">
            <ArrowLeft className="w-4 h-4 text-[var(--color-text-muted)]" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse-slow" style={{ backgroundColor: modeBadgeColor }} />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">OmniClaw Console</span>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ backgroundColor: `${modeBadgeColor}15`, color: modeBadgeColor }}
          >
            {modeBadge}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {state.receipt && (
            <button
              onClick={() => setReceiptOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)] border border-[var(--color-accent-green)]/20 hover:bg-[var(--color-accent-green)]/15 transition-colors"
            >
              <Receipt className="w-3 h-3" />
              View Receipt
            </button>
          )}

          <WalletChip
            label="Buyer Gateway Balance"
            address={buyerWalletSummary?.address}
            usdc={buyerWalletSummary?.usdcBalance}
            loading={walletLoading}
            warning={!buyerWalletSummary?.connected}
            copyId="copy-buyer-wallet-chip"
          />

          <button
            onClick={fetchWalletData}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
            title="Refresh buyer wallet balances and history"
          >
            <RefreshCw className="w-4 h-4 text-[var(--color-text-muted)]" />
          </button>
        </div>
      </header>

      <div className="flex-shrink-0 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
        <PaymentRail currentState={state.transactionState} />
      </div>

      <div className="flex-1 flex min-h-0">
        <div className="w-80 flex-shrink-0 border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            <BuyerPanel
              agent={state.agent}
              transactionState={state.transactionState}
              onInspect={handleRun}
              onPolicyCheck={handleRun}
              onExecute={handleRun}
              onReset={handleReset}
              isRunning={state.isRunning}
              walletSummary={buyerWalletSummary}
              history={buyerHistory}
              onRefreshWalletData={fetchWalletData}
            />
          </div>
          <IntegrationStatusPanel health={state.integrationHealth} />
        </div>

        <div className="flex-1 min-w-0 bg-[var(--color-bg-primary)] overflow-hidden">
          <EventFeed events={state.events} />
        </div>

        <div className="w-96 flex-shrink-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] overflow-hidden">
          <SellerPanel
            services={SERVICE_CATALOG}
            selectedService={state.selectedService}
            onSelectService={handleSelectService}
            transactionState={state.transactionState}
          />
        </div>
      </div>

      {state.error && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-[var(--color-accent-red)]/10 border-t border-[var(--color-accent-red)]/20"
        >
          <Info className="w-4 h-4 text-[var(--color-accent-red)]" />
          <span className="text-xs text-[var(--color-accent-red)]">{state.error}</span>
        </motion.div>
      )}

      <ReceiptDrawer receipt={state.receipt} isOpen={receiptOpen} onClose={() => setReceiptOpen(false)} />
    </div>
  );
}

export default function ConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[var(--color-accent-violet)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--color-text-muted)]">Loading console...</span>
          </div>
        </div>
      }
    >
      <ConsoleContent />
    </Suspense>
  );
}
