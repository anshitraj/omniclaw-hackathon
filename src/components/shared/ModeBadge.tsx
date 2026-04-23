'use client';

/**
 * ModeBadge — clearly communicates the active mode (LIVE / DEMO / LEGACY)
 * Requirements from task spec:
 *  - LIVE: all Circle credentials active, Gateway primary rail
 *  - DEMO: no live credentials, simulated flow
 *  - LEGACY: direct/fallback rail, not the primary path
 */

import type { CombinedWalletOverview, IntegrationHealth } from '@/types';

type AppMode = 'live' | 'demo' | 'legacy';

interface ModeBadgeProps {
  mode: AppMode;
  rail?: 'gateway' | 'direct' | 'demo';
  /** Additional CSS classes */
  className?: string;
  /** Show tooltip with explanation */
  showTooltip?: boolean;
}

const modeConfig: Record<
  AppMode,
  { label: string; color: string; bg: string; border: string; dot: string; tooltip: string }
> = {
  live: {
    label: 'LIVE',
    color: '#9fe870',
    bg: 'rgba(159,232,112,0.08)',
    border: 'rgba(159,232,112,0.2)',
    dot: '#9fe870',
    tooltip: 'Circle Gateway active. Real on-chain USDC transfers. Settlement proof on Arc Testnet.',
  },
  demo: {
    label: 'DEMO',
    color: '#7c5cfc',
    bg: 'rgba(124,92,252,0.08)',
    border: 'rgba(124,92,252,0.2)',
    dot: '#7c5cfc',
    tooltip: 'Simulated mode. No live credentials. All flows are mocked.',
  },
  legacy: {
    label: 'LEGACY',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    dot: '#f59e0b',
    tooltip: 'Legacy direct transfer path. Circle Nanopayments are the primary production rail.',
  },
};

export function ModeBadge({ mode, rail, className = '', showTooltip = false }: ModeBadgeProps) {
  const cfg = modeConfig[mode];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-widest uppercase select-none ${className}`}
      style={{
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
      title={showTooltip ? cfg.tooltip : undefined}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
        style={{ backgroundColor: cfg.dot }}
      />
      {cfg.label}
      {rail && mode === 'live' && (
        <span style={{ color: cfg.color, opacity: 0.7 }}>· {rail === 'gateway' ? 'Gateway' : rail}</span>
      )}
    </span>
  );
}

/** Derive the app mode from health + wallet overview data */
export function deriveAppMode(
  health: IntegrationHealth | null | undefined,
  overview: CombinedWalletOverview | null | undefined
): AppMode {
  if (!health && !overview) return 'demo';
  if (overview?.mode === 'live') return 'live';
  if (overview?.mode === 'legacy') return 'legacy';
  if (health?.activePaymentRail === 'gateway') return 'live';
  if (health?.activePaymentRail === 'direct') return 'legacy';
  return 'demo';
}
