'use client';

import { useReducer, useCallback, useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Receipt,
  Info,
  RefreshCw,
  Network,
} from 'lucide-react';
import Link from 'next/link';

import BuyerPanel from '@/components/console/BuyerPanel';
import SellerPanel from '@/components/console/SellerPanel';
import EventFeed from '@/components/console/EventFeed';
import PaymentRail from '@/components/console/PaymentRail';
import ReceiptDrawer from '@/components/transaction/ReceiptDrawer';
import IntegrationStatusPanel from '@/components/console/IntegrationStatusPanel';
import WalletChip from '@/components/shared/WalletChip';
import { ModeBadge, deriveAppMode } from '@/components/shared/ModeBadge';
import { RailBadge } from '@/components/shared/StatusPill';

import { demoReducer, createInitialState } from '@/lib/demo/store';
import { generateDemoEvents, generateDemoPolicyResult, DEMO_SERVICES, HACKATHON_PROOF } from '@/lib/demo/data';
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
  const policyResult = generateDemoPolicyResult(service);
  for (let i = 0; i < events.length; i++) {
    await new Promise((r) => setTimeout(r, STEP_DELAY));
    const event = events[i];
    dispatch({ type: 'ADD_EVENT', event });
    dispatch({ type: 'SET_STATE', state: event.state });
    if (event.state === 'approved') {
      dispatch({ type: 'SET_POLICY_RESULT', result: policyResult });
    }
    if (event.state === 'error') {
      dispatch({ type: 'SET_POLICY_RESULT', result: policyResult });
    }
  }

  if (!policyResult.approved) {
    dispatch({
      type: 'SET_ERROR',
      error: 'OmniClaw blocked this payment: seller is not configured in the agent policy.',
    });
    dispatch({ type: 'SET_RUNNING', running: false });
    return;
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
        title: 'Seller Settlement Accepted',
        description: 'Settlement accepted with Arc proof, buyer/seller metadata, and OmniClaw policy evidence.',
        state: 'fulfilled',
        metadata: {
          buyerGateway: receipt.fromAddress ? truncateHash(receipt.fromAddress, 6) : 'n/a',
          sellerGateway: receipt.toAddress ? truncateHash(receipt.toAddress, 6) : 'n/a',
          rail: String(receipt.settlementMetadata?.paymentRail || 'Circle Gateway'),
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

function ConsoleContent() {
  const searchParams = useSearchParams();
  const autorun = searchParams.get('autorun') === 'true';

  const [state, dispatch] = useReducer(demoReducer, undefined, createInitialState);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const autorunStartedRef = useRef(false);

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
        /* keep demo state */
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
    if (autorun && !autorunStartedRef.current && !state.isRunning && state.transactionState === 'idle') {
      autorunStartedRef.current = true;
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

  const appMode = deriveAppMode(state.integrationHealth, walletOverview);
  const activeRail = state.integrationHealth.activePaymentRail || 'demo';

  const architectureWarning = walletOverview?.architecture.liveArchitectureValid
    ? undefined
    : walletOverview?.architecture.warnings.find((w) => w.includes('same wallet'));

  const buyerConfigured = Boolean(walletOverview?.buyer?.configured ?? walletOverview?.buyer?.address);
  const sellerConfigured = Boolean(walletOverview?.seller?.configured ?? walletOverview?.seller?.address);

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--nb-dark)' }}>

      {/* ── Neobrutalist Navbar ─────────────────────────────────────────── */}
      <header className="nb-navbar flex-shrink-0">
        {/* Left: Back + Brand */}
        <div className="flex items-stretch gap-0">
          <Link
            href="/"
            id="nav-back-btn"
            className="flex items-center justify-center w-9 h-9 border-r-2 hover:bg-[rgba(255,255,255,0.04)] transition-colors"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}
            aria-label="Back to landing page"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Brand block with yellow left-bar */}
          <div
            className="flex items-center gap-3 pl-4 pr-6 h-full border-r-2"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex flex-col">
              <span
                className="text-[13px] font-black uppercase tracking-widest leading-none"
                style={{ color: '#FDC800', letterSpacing: '0.12em' }}
              >
                OmniClaw
              </span>
              <span
                className="text-[9px] font-mono font-semibold uppercase tracking-widest"
                style={{ color: 'var(--color-text-muted)', letterSpacing: '0.14em' }}
              >
                Console v1.0
              </span>
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2 pl-4">
            <ModeBadge mode={appMode} rail={activeRail as 'gateway' | 'direct' | 'demo'} showTooltip />
            <div className="hidden sm:flex">
              <RailBadge rail={activeRail} />
            </div>
            <span
              className="hidden md:inline-flex items-center gap-1.5 nb-badge nb-badge-indigo"
            >
              <Network className="w-2.5 h-2.5" />
              Arc Testnet
            </span>
          </div>
        </div>

        {/* Right: Wallets + Receipt + Refresh — fills remaining space, refresh flush right */}
        <div className="flex-1 flex items-center justify-end">
          {state.receipt && (
            <button
              id="nav-view-receipt-btn"
              onClick={() => setReceiptOpen(true)}
              className="btn-secondary flex items-center gap-1.5 text-[10px] py-1.5 px-3 mr-3"
            >
              <Receipt className="w-3 h-3" />
              Settlement Proof
            </button>
          )}

          <div className="flex items-stretch h-full divide-x-2 divide-white/10">
            <div className="flex items-center px-3">
              <WalletChip
                label="Buyer"
                actor="buyer"
                address={walletOverview?.buyer?.address}
                usdc={walletOverview?.buyer?.usdcBalance}
                eurc={walletOverview?.buyer?.eurcBalance}
                loading={walletLoading}
                warning={!walletOverview?.architecture?.liveArchitectureValid && Boolean(walletOverview)}
                warningText={architectureWarning}
                configured={buyerConfigured}
                copyId="copy-buyer-wallet-chip"
              />
            </div>

            <div className="flex items-center px-3">
              <WalletChip
                label="Seller"
                actor="seller"
                address={walletOverview?.seller?.address}
                usdc={walletOverview?.seller?.usdcBalance}
                eurc={walletOverview?.seller?.eurcBalance}
                loading={walletLoading}
                warning={!walletOverview?.architecture?.liveArchitectureValid && Boolean(walletOverview)}
                warningText={architectureWarning}
                configured={sellerConfigured}
                copyId="copy-seller-wallet-chip"
              />
            </div>

            {/* Refresh — flush to right edge, full height */}
            <button
              id="nav-refresh-btn"
              onClick={fetchWalletData}
              className="flex items-center justify-center w-11 hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              title="Refresh wallet balances"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${walletLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Payment Rail ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-[rgba(255,255,255,0.07)]">
        <PaymentRail currentState={state.transactionState} mode={appMode} />
      </div>

      {/* ── Hackathon Proof Strip ─────────────────────────────────────── */}
      <div
        className="flex-shrink-0 grid grid-cols-4 border-b-2"
        style={{ background: 'var(--nb-dark-3)', borderColor: 'rgba(253,200,0,0.16)' }}
      >
        {[
          ['Per-action price', `$${HACKATHON_PROOF.sampleActionCost.toFixed(3)}`],
          ['Transaction proof', `${HACKATHON_PROOF.completedTransactions}+`],
          ['Required minimum', `${HACKATHON_PROOF.minTransactions}+`],
          ['Normal gas estimate', `$${HACKATHON_PROOF.traditionalGasEstimate.toFixed(2)}`],
        ].map(([label, value]) => (
          <div key={label} className="px-4 py-2 border-r" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="text-[9px] font-mono uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
              {label}
            </div>
            <div className="text-sm font-black" style={{ color: '#FDC800' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main 3-column layout ───────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0">

        {/* Left: Buyer Agent Panel */}
        <div
          className="w-80 flex-shrink-0 border-r-2 flex flex-col overflow-hidden"
          style={{ background: 'var(--nb-dark-2)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
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
              appMode={appMode}
              policyResult={state.policyResult}
            />
          </div>
          <IntegrationStatusPanel health={state.integrationHealth} />
        </div>

        {/* Center: Event Feed */}
        <div
          className="flex-1 min-w-0 overflow-hidden"
          style={{ background: 'var(--nb-dark)' }}
        >
          <EventFeed events={state.events} appMode={appMode} />
        </div>

        {/* Right: Vendor / Seller Panel */}
        <div
          className="w-96 flex-shrink-0 border-l-2 overflow-hidden"
          style={{ background: 'var(--nb-dark-2)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <SellerPanel
            services={DEMO_SERVICES}
            selectedService={state.selectedService}
            onSelectService={handleSelectService}
            transactionState={state.transactionState}
            walletSummary={walletOverview?.seller || null}
            history={sellerHistory}
            onRefreshWalletData={fetchWalletData}
            appMode={appMode}
          />
        </div>
      </div>

      {/* ── Error Bar ─────────────────────────────────────────────────── */}
      {state.error && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex-shrink-0 flex items-center gap-2 px-6 py-3 border-t"
          style={{
            background: 'rgba(239,68,68,0.06)',
            borderColor: 'rgba(239,68,68,0.2)',
          }}
        >
          <Info className="w-4 h-4 text-[var(--color-accent-red)]" />
          <span className="text-xs text-[var(--color-accent-red)]">{state.error}</span>
        </motion.div>
      )}

      {/* ── Receipt Drawer ────────────────────────────────────────────── */}
      <ReceiptDrawer receipt={state.receipt} isOpen={receiptOpen} onClose={() => setReceiptOpen(false)} />
    </div>
  );
}

export default function ConsolePage() {
  return (
    <Suspense
      fallback={
        <div
          className="h-screen flex items-center justify-center"
          style={{ background: 'var(--color-bg-primary)' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-9 h-9 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: '#9fe870', borderTopColor: 'transparent' }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Loading OmniClaw Console…
            </span>
          </div>
        </div>
      }
    >
      <ConsoleContent />
    </Suspense>
  );
}
