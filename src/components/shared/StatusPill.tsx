'use client';

/**
 * StatusPill — semantic badge for states, rails, modes, confirmations
 * Variants: success, warning, danger, violet, blue, teal, muted
 */

import { type ReactNode } from 'react';

type PillVariant = 'success' | 'warning' | 'danger' | 'violet' | 'blue' | 'teal' | 'muted' | 'green';

interface StatusPillProps {
  variant: PillVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
  title?: string;
}

const variantMap: Record<PillVariant, string> = {
  green:   'pill-green',
  success: 'pill-green',
  warning: 'pill-amber',
  danger:  'pill-red',
  violet:  'pill-violet',
  blue:    'pill-blue',
  teal:    'pill-teal',
  muted:   'pill-muted',
};

const dotColors: Record<PillVariant, string> = {
  green:   '#9fe870',
  success: '#22c55e',
  warning: '#f59e0b',
  danger:  '#ef4444',
  violet:  '#7c5cfc',
  blue:    '#3b82f6',
  teal:    '#14b8a6',
  muted:   '#566680',
};

export default function StatusPill({ variant, children, dot = false, className = '', title }: StatusPillProps) {
  return (
    <span className={`pill ${variantMap[variant]} ${className}`} title={title}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: dotColors[variant] }}
        />
      )}
      {children}
    </span>
  );
}

/** Inline variant for simpler use */
export function RailBadge({ rail }: { rail: 'gateway' | 'direct' | 'demo' | string }) {
  if (rail === 'gateway') return <StatusPill variant="green" dot>Gateway Rail</StatusPill>;
  if (rail === 'direct')  return <StatusPill variant="warning" dot>Legacy Direct</StatusPill>;
  return <StatusPill variant="muted" dot>Demo Rail</StatusPill>;
}
