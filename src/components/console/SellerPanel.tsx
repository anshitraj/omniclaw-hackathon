'use client';

import { motion } from 'framer-motion';
import {
  Layers,
  Zap,
  Globe,
  Lock,
  CheckCircle2,
  Loader2,
  Circle,
} from 'lucide-react';
import type { SellerService, TransactionState } from '@/types';
import { formatUSDC } from '@/lib/utils';

interface SellerPanelProps {
  services: SellerService[];
  selectedService: SellerService | null;
  onSelectService: (service: SellerService) => void;
  transactionState: TransactionState;
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

function getFulfillmentIcon(
  state: SellerService['fulfillmentState'],
  isSelected: boolean,
  txState: TransactionState
) {
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
}: SellerPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-amber)]/10 flex items-center justify-center">
          <Layers className="w-4 h-4 text-[var(--color-accent-amber)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Service Catalog</h2>
          <p className="text-xs text-[var(--color-text-muted)]">Paid API Endpoints</p>
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
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-0.5">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  {getFulfillmentIcon(service.fulfillmentState, isSelected, transactionState)}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
                  {formatUSDC(service.price)}
                </span>
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono"
                  style={{ backgroundColor: `${badge.color}15`, color: badge.color }}
                >
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
      </div>
    </motion.div>
  );
}
