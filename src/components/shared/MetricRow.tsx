'use client';

/**
 * MetricRow — compact label / value pair for data panels
 * Used in wallet summaries, settlement metadata, policy check tables
 */

interface MetricRowProps {
  label: string;
  value: string | number | null | undefined;
  /** render value in monospace */
  mono?: boolean;
  /** apply a highlight color */
  color?: string;
  /** show a small badge after the value */
  badge?: string;
  badgeVariant?: 'green' | 'amber' | 'red' | 'blue' | 'muted';
  /** show placeholder when value is missing */
  placeholder?: string;
}

const badgeColors: Record<string, { bg: string; color: string }> = {
  green: { bg: 'rgba(159,232,112,0.1)', color: '#9fe870' },
  amber: { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b' },
  red:   { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444' },
  blue:  { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6' },
  muted: { bg: 'rgba(86,102,128,0.1)',  color: '#566680' },
};

export default function MetricRow({
  label,
  value,
  mono = false,
  color,
  badge,
  badgeVariant = 'muted',
  placeholder = 'n/a',
}: MetricRowProps) {
  const display = value != null && value !== '' ? String(value) : placeholder;
  const isPlaceholder = display === placeholder;

  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-[11px] text-[var(--color-text-muted)] flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`text-[11px] truncate ${mono ? 'font-mono' : ''}`}
          style={{ color: isPlaceholder ? 'var(--color-text-muted)' : color || 'var(--color-text-secondary)' }}
        >
          {display}
        </span>
        {badge && (
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold flex-shrink-0"
            style={badgeColors[badgeVariant]}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

/** Divider between metric groups */
export function MetricDivider() {
  return <div className="h-px bg-[var(--color-border-subtle)] my-2" />;
}
