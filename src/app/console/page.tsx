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
import { demoReducer, createInitialState } from '@/lib/demo/store';
import { generateDemoEvents, DEMO_SERVICES } from '@/lib/demo/data';
import { truncateHash } from '@/lib/utils';
import type {
  SellerService,
  IntegrationHealth,
  TransactionReceipt,
  CombinedWalletOverview,
  WalletHistoryItem,
} from '@/types';

const STEP_DELAY = 1200;

async function runLiveSequence(
  service: SellerService,
  dispatch: (a: Parameters<typeof demoReducer>[1]) => void,
  refreshWalletData: () => Promise<void>
) {
  dispatch({ type: 'SET_RUNNING', running: true });

  const apiPromise = fetch('/api/demo/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId: service.id }),
  })
    .then((r) => r.json())
    .catch(() => null);

  const events = generateDemoEvents(service);
  for (let i = 0; i < events.length; i++) {
    await new Promise((r) => setTimeout(r, STEP_DELAY));
    const event = events[i];
    dispatch({ type: 'ADD_EVENT', event });
    dispatch({ type: 'SET_STATE', state: event.state });
    if (event.state === 'approved') {
      dispatch({
        type: 'SET_POLICY_RESULT',
        result: {
          approved: true,
          policyId: 'pol_fpe_001',
          policyName: 'Default Buyer Spend Policy',
          checks: [
            { name: 'Budget Cap Check', passed: true, reason: `${service.price} USDC within budget`, constraint: '<= 10.00 USDC' },
            { name: 'Recipient Allowlist', passed: true, reason: 'Approved vendor', constraint: 'Allowlisted only' },
            { name: 'Network Restriction', passed: true, reason: 'Arc Testnet approved', constraint: 'Arc Testnet only' },
            { name: 'Per-Transaction Limit', passed: true, reason: `${service.price} USDC below limit`, constraint: '<= 5.00 USDC' },
            { name: 'No Raw Key Exposure', passed: true, reason: 'Circle programmable wallet', constraint: 'Zero key exposure' },
          ],
          summary: 'All 5 policy checks passed. Transaction authorized.',
          timestamp: new Date().toISOString(),
          budgetRemaining: 10.0 - service.price,
        },
      });
    }
  }

  const apiResult = await apiPromise;
  if (apiResult?.success && apiResult?.data?.receipt) {
    const receipt = apiResult.data.receipt as TransactionReceipt;
    dispatch({ type: 'SET_RECEIPT', receipt });
    dispatch({
      type: 'ADD_EVENT',
      event: {
        id: `evt_settle_${Date.now()}`,
        timestamp: new Date().toISOString(),
        source: 'settlement',
        title: 'Gateway Settlement Routing Captured',
        description: 'Buyer-to-seller gateway settlement recorded with rail, token, and destination details.',
        state: 'fulfilled',
        metadata: {
          buyerGateway: receipt.fromAddress ? truncateHash(receipt.fromAddress, 6) : 'n/a',
          sellerGateway: receipt.toAddress ? truncateHash(receipt.toAddress, 6) : 'n/a',
          rail: String(receipt.settlementMetadata?.paymentRail || 'gateway'),
          token: receipt.currency,
          amount: String(receipt.amount),
          txHash: receipt.txHash ? truncateHash(receipt.txHash, 6) : 'n/a',
        },
      },
    });
    await refreshWalletData();
  }

  dispatch({ type: 'SET_RUNNING', running: false });
}

function WalletChip({
  label,
  address,
  usdc,
  eurc,
  loading,
  warning,
  copyId,
}: {
  label: string;
  address?: string | null;
  usdc?: number;
  eurc?: number;
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
      <div className={`w-1.5 h-1.5 rounded-full ${warning ? 'bg-[var(--color-accent-red)]' : 'bg-[var(--color-accent-green)]'}`} />
      <Wallet className="w-3 h-3 text-[var(--color-text-muted)]" />
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="text-[var(--color-border-subtle)]">|</span>
      <span className="text-[var(--color-text-secondary)]">{address ? truncateHash(address, 5) : 'n/a'}</span>
      <span className="text-[var(--color-border-subtle)]">|</span>
      <span className="text-[var(--color-accent-green)]">{loading ? '...' : (usdc || 0).toFixed(2)} USDC</span>
      <span className="text-[var(--color-accent-blue)]">{loading ? '...' : (eurc || 0).toFixed(2)} EURC</span>
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

  const [state, dispatch] = useReducer(demoReducer, undefined, createInitialState);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const [walletOverview, setWalletOverview] = useState<CombinedWalletOverview | null>(null);
  const [buyerHistory, setBuyerHistory] = useState<WalletHistoryItem[]>([]);
  const [sellerHistory, setSellerHistory] = useState<WalletHistoryItem[]>([]);
  const [walletLoading, setWalletLoading] = useState(true);

  const fetchWalletData = useCallback(async () => {
    try {
      setWalletLoading(true);
      const [overviewRes, buyerHistoryRes, sellerHistoryRes] = await Promise.all([
        fetch('/api/integrations/circle/wallet-overview', { cache: 'no-store' }),
        fetch('/api/integrations/circle/buyer-history?limit=20', { cache: 'no-store' }),
        fetch('/api/integrations/circle/seller-history?limit=20', { cache: 'no-store' }),
      ]);

      if (overviewRes.ok) {
        const json = await overviewRes.json();
        if (json.success) setWalletOverview(json.data as CombinedWalletOverview);
      }
      if (buyerHistoryRes.ok) {
        const json = await buyerHistoryRes.json();
        if (json.success) setBuyerHistory(json.data as WalletHistoryItem[]);
      }
      if (sellerHistoryRes.ok) {
        const json = await sellerHistoryRes.json();
        if (json.success) setSellerHistory(json.data as WalletHistoryItem[]);
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
        // keep demo state
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
      const firstService = DEMO_SERVICES[0];
      dispatch({ type: 'SELECT_SERVICE', service: firstService });
      setTimeout(async () => {
        await runLiveSequence(firstService, dispatch, fetchWalletData);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autorun]);

  useEffect(() => {
    if (state.receipt && state.transactionState === 'fulfilled') {
      setTimeout(() => setReceiptOpen(true), 600);
    }
  }, [state.receipt, state.transactionState]);

  const modeBadge = state.mode === 'integration' ? 'LIVE' : 'DEMO';
  const modeBadgeColor = state.mode === 'integration' ? 'var(--color-accent-green)' : 'var(--color-accent-violet)';

  const architectureWarning = walletOverview?.architecture.liveArchitectureValid
    ? undefined
    : walletOverview?.architecture.warnings.find((w) => w.includes('same wallet'));

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
          <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ backgroundColor: `${modeBadgeColor}15`, color: modeBadgeColor }}>
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
            address={walletOverview?.buyer.address}
            usdc={walletOverview?.buyer.usdcBalance}
            eurc={walletOverview?.buyer.eurcBalance}
            loading={walletLoading}
            warning={!walletOverview?.architecture.liveArchitectureValid}
            copyId="copy-buyer-wallet-chip"
          />
          <WalletChip
            label="Seller Gateway Balance"
            address={walletOverview?.seller.address}
            usdc={walletOverview?.seller.usdcBalance}
            eurc={walletOverview?.seller.eurcBalance}
            loading={walletLoading}
            warning={!walletOverview?.architecture.liveArchitectureValid}
            copyId="copy-seller-wallet-chip"
          />

          <button
            onClick={fetchWalletData}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
            title="Refresh wallet balances and history"
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
              walletSummary={walletOverview?.buyer || null}
              history={buyerHistory}
              onRefreshWalletData={fetchWalletData}
              architectureWarning={architectureWarning}
            />
          </div>
          <IntegrationStatusPanel health={state.integrationHealth} />
        </div>

        <div className="flex-1 min-w-0 bg-[var(--color-bg-primary)] overflow-hidden">
          <EventFeed events={state.events} />
        </div>

        <div className="w-96 flex-shrink-0 border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] overflow-hidden">
          <SellerPanel
            services={DEMO_SERVICES}
            selectedService={state.selectedService}
            onSelectService={handleSelectService}
            transactionState={state.transactionState}
            walletSummary={walletOverview?.seller || null}
            history={sellerHistory}
            onRefreshWalletData={fetchWalletData}
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

