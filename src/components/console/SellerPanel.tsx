'use client';

import { motion } from 'framer-motion';
import {
  Store,
  Zap,
  Globe,
  Lock,
  CheckCircle2,
  Loader2,
  Circle,
  Wallet,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type { SellerService, TransactionState, WalletHistoryItem, WalletSummary } from '@/types';
import { formatUSDC, formatTimestamp, truncateHash } from '@/lib/utils';

interface SellerPanelProps {
  services: SellerService[];
  selectedService: SellerService | null;
  onSelectService: (service: SellerService) => void;
  transactionState: TransactionState;
  walletSummary: WalletSummary | null;
  history: WalletHistoryItem[];
  onRefreshWalletData: () => void;
}

function getEndpointBadge(type: SellerService['endpointType']) {
  switch (type) {
    case 'x402_paid':
      return { label: 'x402', color: 'var(--color-accent-amber)', icon: Zap };
    case 'standard_api':
      return { label: 'API', color: 'var(--color-accent-blue)', icon: Globe };
    case 'webhook':
      return { label: 'Webhook', color: 'var(--color-accent-teal)', icon: Globe };
  }
}

function getFulfillmentIcon(state: SellerService['fulfillmentState'], isSelected: boolean, txState: TransactionState) {
  if (isSelected && txState === 'fulfilled') {
    return <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-green)]" />;
  }
  if (isSelected && txState !== 'idle' && txState !== 'fulfilled' && txState !== 'error') {
    return <Loader2 className="w-4 h-4 text-[var(--color-accent-violet)] animate-spin" />;
  }
  if (state === 'available') {
    return <Circle className="w-4 h-4 text-[var(--color-accent-green)]" />;
  }
  return <Circle className="w-4 h-4 text-[var(--color-text-muted)]" />;
}

export default function SellerPanel({
  services,
  selectedService,
  onSelectService,
  transactionState,
  walletSummary,
  history,
  onRefreshWalletData,
}: SellerPanelProps) {
  const lastUpdated = walletSummary?.lastUpdated ? formatTimestamp(walletSummary.lastUpdated) : 'n/a';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-amber)]/10 flex items-center justify-center">
          <Store className="w-4 h-4 text-[var(--color-accent-amber)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Vendor Surface</h2>
          <p className="text-xs text-[var(--color-text-muted)]">Monetized API Endpoints</p>
        </div>
      </div>

      <div className="px-5 pt-4 space-y-2 border-b border-[var(--color-border-subtle)] pb-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
            <Wallet className="w-3 h-3 inline mr-1" /> Seller Gateway Balance
          </div>
          <button onClick={onRefreshWalletData} className="p-1 rounded hover:bg-[var(--color-bg-hover)]">
            <RefreshCw className="w-3 h-3 text-[var(--color-text-muted)]" />
          </button>
        </div>
        <div className="text-xs space-y-1 text-[var(--color-text-secondary)]">
          <div className="flex justify-between"><span>Address</span><span className="font-mono">{walletSummary?.address ? truncateHash(walletSummary.address, 6) : 'Not configured'}</span></div>
          <div className="flex justify-between"><span>USDC</span><span className="font-mono text-[var(--color-accent-green)]">{formatUSDC(walletSummary?.usdcBalance || 0)}</span></div>
          <div className="flex justify-between"><span>EURC</span><span className="font-mono text-[var(--color-accent-blue)]">{(walletSummary?.eurcBalance || 0).toFixed(2)} EURC</span></div>
          <div className="flex justify-between"><span>Recent Tx</span><span className="font-mono">{walletSummary?.recentTxCount || 0}</span></div>
          <div className="flex justify-between"><span>Updated</span><span className="font-mono">{lastUpdated}</span></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {services.map((service, i) => {
          const isSelected = selectedService?.id === service.id;
          const badge = getEndpointBadge(service.endpointType);
          const BadgeIcon = badge.icon;

          return (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              onClick={() => onSelectService(service)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? 'border-[var(--color-accent-violet)]/50 bg-[var(--color-accent-violet)]/5 glow-violet'
                  : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] hover:border-[var(--color-border-default)] hover:bg-[var(--color-bg-hover)]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-0.5">{service.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{service.description}</p>
                </div>
                <div className="flex-shrink-0 ml-3">{getFulfillmentIcon(service.fulfillmentState, isSelected, transactionState)}</div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm font-bold font-mono text-[var(--color-text-primary)]">{formatUSDC(service.price)}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono" style={{ backgroundColor: `${badge.color}15`, color: badge.color }}>
                  <BadgeIcon className="w-2.5 h-2.5" />
                  {badge.label}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)]">
                  <Globe className="w-2.5 h-2.5" />
                  {service.availability}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)]">
                  <Lock className="w-2.5 h-2.5" />
                  paywall
                </span>
              </div>
            </motion.button>
          );
        })}

        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-3 space-y-2">
          <p className="text-xs text-[var(--color-text-secondary)]">Seller Recent Transactions</p>
          {history.length === 0 ? (
            <p className="text-[11px] text-[var(--color-text-muted)]">No seller transactions yet.</p>
          ) : (
            history.slice(0, 5).map((item, idx) => (
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
      </div>

      <div className="px-5 py-3 border-t border-[var(--color-border-subtle)]">
        <p className="text-[10px] text-[var(--color-text-muted)] text-center">
          Seller receives programmable per-action credit through Gateway rail with Arc settlement proof.
        </p>
      </div>
    </motion.div>
  );
}


