'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  BarChart2,
  ShieldAlert,
  FileCheck,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Loader2,
  ExternalLink,
  Wallet,
  RefreshCw,
  Activity,
} from 'lucide-react';
import type { SellerService, TransactionState, WalletHistoryItem, WalletSummary } from '@/types';
import { formatUSDC, formatTimestamp, truncateHash } from '@/lib/utils';
import StatusPill from '@/components/shared/StatusPill';
import MetricRow, { MetricDivider } from '@/components/shared/MetricRow';
import EmptyState from '@/components/shared/EmptyState';

interface SellerPanelProps {
  services: SellerService[];
  selectedService: SellerService | null;
  onSelectService: (s: SellerService) => void;
  transactionState: TransactionState;
  walletSummary: WalletSummary | null;
  history: WalletHistoryItem[];
  onRefreshWalletData: () => void;
  appMode?: 'live' | 'demo' | 'legacy';
}

function ServiceCategoryIcon({ category, accent }: { category: string; accent: string }) {
  switch (category) {
    case 'Market Data':
      return <BarChart2 className="w-4 h-4" style={{ color: accent }} />;
    case 'Risk Intelligence':
      return <ShieldAlert className="w-4 h-4" style={{ color: accent }} />;
    case 'Settlement':
      return <FileCheck className="w-4 h-4" style={{ color: accent }} />;
    default:
      return <Zap className="w-4 h-4" style={{ color: accent }} />;
  }
}

function serviceAccent(category: string) {
  switch (category) {
    case 'Market Data':       return '#3b82f6'; // blue  – data/charts
    case 'Risk Intelligence': return '#f43f5e'; // rose  – danger/risk
    case 'Settlement':        return '#10b981'; // emerald – confirmed/green
    default:                  return '#f59e0b';
  }
}

function SellerServiceCard({
  service,
  selected,
  onSelect,
  transactionState,
}: {
  service: SellerService;
  selected: boolean;
  onSelect: () => void;
  transactionState: TransactionState;
}) {
  const accent = serviceAccent(service.category);
  const isFulfilled = selected && transactionState === 'fulfilled';
  const isProcessing = selected && ['routing', 'settling', 'confirmed'].includes(transactionState);
  const isAvailable = service.availability === 'online' && service.fulfillmentState === 'available';

  return (
    <motion.button
      layout
      whileHover={isAvailable && !selected ? { x: -1, y: -1 } : {}}
      whileTap={isAvailable ? { x: 1, y: 1 } : {}}
      onClick={isAvailable ? onSelect : undefined}
      id={`seller-service-${service.id}`}
      className={`w-full text-left overflow-hidden transition-all ${
        isAvailable && !selected ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{
        background: selected ? `${accent}0D` : 'var(--nb-dark-3)',
        border: `2px solid ${selected ? accent : 'rgba(255,255,255,0.09)'}`,
        borderLeft: `4px solid ${selected ? accent : 'rgba(255,255,255,0.15)'}`,
        boxShadow: selected ? `4px 4px 0px ${accent}30` : '3px 3px 0px rgba(0,0,0,0.3)',
      }}
    >

      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-9 h-9  flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: `${accent}15`,
              border: `1px solid ${accent}25`,
            }}
          >
            <ServiceCategoryIcon category={service.category} accent={accent} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className="text-xs font-semibold leading-snug"
                style={{
                  color: selected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {service.title}
              </h3>
              {/* Price chip */}
              <span
                className="flex-shrink-0 text-[11px] font-bold font-mono px-2 py-0.5 "
                style={{
                  background: isFulfilled ? 'rgba(159,232,112,0.12)' : `${accent}12`,
                  color: isFulfilled ? '#9fe870' : accent,
                  border: `1px solid ${isFulfilled ? 'rgba(159,232,112,0.25)' : `${accent}22`}`,
                }}
              >
                {formatUSDC(service.price)}
              </span>
            </div>

            <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: 'var(--color-text-muted)' }}>
              {service.description}
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Payment rail badge */}
              <span
                className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border"
                style={{
                  borderColor: service.endpointType === 'x402_paid' ? 'rgba(67,45,215,0.4)' : 'rgba(255,255,255,0.1)',
                  color:       service.endpointType === 'x402_paid' ? '#7B6EF0' : 'rgba(255,255,255,0.4)',
                  background:  service.endpointType === 'x402_paid' ? 'rgba(67,45,215,0.08)' : 'transparent',
                  letterSpacing: '0.06em',
                }}
              >
                {service.endpointType === 'x402_paid' ? 'x402 Paywall' : service.endpointType === 'standard_api' ? 'API' : 'Webhook'}
              </span>

              {/* Availability */}
              <StatusPill
                variant={isAvailable ? 'teal' : service.availability === 'degraded' ? 'warning' : 'muted'}
                dot
              >
                {isAvailable ? 'online' : service.availability}
              </StatusPill>

              {/* Fulfillment state indicator */}
              {isFulfilled && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(159,232,112,0.1)', color: '#9fe870' }}>
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  fulfilled
                </span>
              )}
              {isProcessing && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  settling
                </span>
              )}
              {selected && transactionState === 'selected' && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                  <Clock className="w-2.5 h-2.5" />
                  selected
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default function SellerPanel({
  services,
  selectedService,
  onSelectService,
  transactionState,
  walletSummary,
  history,
  onRefreshWalletData,
  appMode = 'demo',
}: SellerPanelProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  const lastUpdated = walletSummary?.lastUpdated ? formatTimestamp(walletSummary.lastUpdated) : null;
  const isSelectable = !['routing', 'settling', 'confirmed', 'fulfilled'].includes(transactionState);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full"
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b-2 flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <span className="nb-section-label">Vendor Services</span>
        <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>Select a paid API</span>
        <span
          className="ml-auto text-[10px] font-mono font-bold uppercase px-2 py-1 border"
          style={{ borderColor: 'rgba(253,200,0,0.25)', color: '#FDC800', background: 'rgba(253,200,0,0.06)', letterSpacing: '0.06em' }}
        >
          {services.length} services
        </span>
      </div>

      {/* ── Service cards list ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {services.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No services available"
            description="The vendor has no active paid APIs."
          />
        ) : (
          <AnimatePresence initial={false}>
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SellerServiceCard
                  service={service}
                  selected={selectedService?.id === service.id}
                  onSelect={() => isSelectable && onSelectService(service)}
                  transactionState={transactionState}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Seller Gateway Wallet */}
        <div
          className="p-4 mt-2"
          style={{
            background: 'var(--nb-dark-3)',
            border: '2px solid rgba(255,255,255,0.08)',
            borderLeft: '4px solid rgba(253,200,0,0.35)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                Seller Gateway
              </span>
            </div>
            <button
              onClick={onRefreshWalletData}
              className="p-1  hover:scale-105 transition-all"
              style={{ color: 'var(--color-text-muted)' }}
              title="Refresh seller wallet"
              aria-label="Refresh seller wallet"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {walletSummary ? (
            <div className="space-y-1">
              <MetricRow
                label="Address"
                value={walletSummary.address ? truncateHash(walletSummary.address, 6) : null}
                mono
                placeholder="Not configured"
              />
              <MetricRow label="USDC" value={formatUSDC(walletSummary.usdcBalance)} color="#f59e0b" />
              <MetricRow label="EURC" value={`${(walletSummary.eurcBalance || 0).toFixed(2)} EURC`} color="#3b82f6" />
              <MetricDivider />
              <MetricRow
                label="Txs"
                value={`${walletSummary.recentTxCount} recent`}
                mono
              />
              {lastUpdated && <MetricRow label="Updated" value={lastUpdated} mono />}
            </div>
          ) : (
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {appMode === 'demo' ? 'Demo mode — wallet simulated' : 'Loading seller wallet…'}
            </p>
          )}
        </div>

        {/* Seller transaction history */}
        <div
          className="overflow-hidden"
          style={{ border: '2px solid rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium transition-colors hover:bg-[var(--color-bg-hover)]"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <span className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Seller Tx History ({history.length})
            </span>
            {historyOpen
              ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
              : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
            }
          </button>

          {historyOpen && (
            <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: 'var(--color-border-subtle)' }}>
              {history.length === 0 ? (
                <p className="text-[11px] pt-3" style={{ color: 'var(--color-text-muted)' }}>
                  No seller transactions yet.
                </p>
              ) : (
                history.slice(0, 6).map((item) => (
                  <div
                    key={`${item.id}_${item.timestamp}`}
                    className=" px-3 py-2 space-y-1 mt-2"
                    style={{ background: 'var(--color-bg-hover)' }}
                  >
                    <div className="flex justify-between text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                      <span>{item.token} {item.amount}</span>
                      <span style={{ color: item.direction === 'received' ? '#9fe870' : '#ef4444' }}>{item.direction}</span>
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
                        className="inline-flex items-center gap-1 text-[10px] hover:opacity-80 transition-opacity"
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
    </motion.div>
  );
}
