'use client';

/**
 * SectionCard — panel wrapper following neobrutalism-SKILL.md:
 *  - cleaner card borders
 *  - stronger section hierarchy
 *  - deliberate shadow/ring treatment
 *  - more intentional spacing rhythm
 */

import { type ReactNode, type ElementType } from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  icon?: ElementType;
  iconColor?: string;
  iconBg?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** 'default' = bg-secondary, 'elevated' = bg-elevated, 'flat' = no bg */
  variant?: 'default' | 'elevated' | 'flat';
  noPadding?: boolean;
}

export default function SectionCard({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'var(--color-text-muted)',
  iconBg = 'var(--color-bg-hover)',
  children,
  actions,
  className = '',
  variant = 'default',
  noPadding = false,
}: SectionCardProps) {
  const bg =
    variant === 'elevated'
      ? 'var(--color-bg-elevated)'
      : variant === 'flat'
        ? 'transparent'
        : 'var(--color-bg-secondary)';

  const border =
    variant === 'elevated'
      ? '1px solid var(--color-border-default)'
      : variant === 'flat'
        ? 'none'
        : '1px solid var(--color-border-subtle)';

  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: bg, border }}
    >
      {(title || Icon) && (
        <div
          className="flex items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: iconBg }}
              >
                <Icon className="w-4 h-4" style={{ color: iconColor }} />
              </div>
            )}
            <div>
              {title && (
                <h2 className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
        </div>
      )}

      <div className={noPadding ? '' : 'px-5 py-4'}>{children}</div>
    </div>
  );
}
