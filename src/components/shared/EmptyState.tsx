'use client';

/**
 * EmptyState — elegant placeholder for when there's nothing to show
 * Robust fallback used throughout the console for:
 *  - no events yet (event feed)
 *  - no transaction history
 *  - wallet unavailable
 *  - loading / awaiting data
 */

import { type ReactNode, type ElementType } from 'react';
import { Radio } from 'lucide-react';

interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'muted' | 'warning' | 'loading';
  className?: string;
}

export default function EmptyState({
  icon: Icon = Radio,
  title,
  description,
  action,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const iconBg =
    variant === 'warning'
      ? 'rgba(245,158,11,0.08)'
      : variant === 'loading'
        ? 'rgba(124,92,252,0.08)'
        : 'var(--color-bg-elevated)';

  const iconColor =
    variant === 'warning'
      ? '#f59e0b'
      : variant === 'loading'
        ? '#7c5cfc'
        : 'var(--color-text-muted)';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-10 px-6 text-center ${className}`}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: iconBg }}
      >
        {variant === 'loading' ? (
          <span
            className="w-5 h-5 rounded-full border-2 border-[var(--color-accent-violet)] border-t-transparent animate-spin"
          />
        ) : (
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        )}
      </div>

      <div className="space-y-1">
        <p
          className="text-sm font-semibold"
          style={{ color: variant === 'warning' ? '#f59e0b' : 'var(--color-text-secondary)' }}
        >
          {title}
        </p>
        {description && (
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed max-w-[220px]">
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
