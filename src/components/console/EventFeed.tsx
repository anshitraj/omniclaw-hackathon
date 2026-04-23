'use client';

import { useEffect, useRef } from 'react';
import type { ComponentType, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Shield,
  Wallet,
  Zap,
  Radio,
  Activity,
} from 'lucide-react';
import type { DemoEvent, TransactionState } from '@/types';
import { formatTimestamp } from '@/lib/utils';

interface EventFeedProps {
  events: DemoEvent[];
  appMode?: 'live' | 'demo' | 'legacy';
}

/* ── Source → visual config ─────────────────────────────────────────────── */

type EventSource = DemoEvent['source'];

const SOURCE_CONFIG: Record<
  EventSource,
  { icon: ComponentType<{ className?: string; style?: CSSProperties }>; label: string; accent: string; badgeClass: string }
> = {
  buyer: {
    icon: Bot,
    label: 'BUYER',
    accent: '#432DD7',
    badgeClass: 'nb-badge nb-badge-indigo',
  },
  policy: {
    icon: Shield,
    label: 'POLICY',
    accent: '#FDC800',
    badgeClass: 'nb-badge nb-badge-yellow',
  },
  wallet: {
    icon: Wallet,
    label: 'WALLET',
    accent: '#0D9488',
    badgeClass: 'nb-badge nb-badge-teal',
  },
  seller: {
    icon: Radio,
    label: 'SELLER',
    accent: '#16A34A',
    badgeClass: 'nb-badge nb-badge-teal',
  },
  settlement: {
    icon: Radio,
    label: 'SETTLE',
    accent: '#7B6EF0',
    badgeClass: 'nb-badge nb-badge-indigo',
  },
  system: {
    icon: Activity,
    label: 'SYSTEM',
    accent: '#566680',
    badgeClass: 'nb-badge nb-badge-muted',
  },
};

/* ── State → status badge ───────────────────────────────────────────────── */

const STATE_BADGE: Record<
  TransactionState,
  { label: string; cls: string }
> = {
  idle:             { label: 'idle',             cls: 'nb-badge nb-badge-muted' },
  selected:         { label: 'selected',         cls: 'nb-badge nb-badge-indigo' },
  inspecting:       { label: 'inspecting',       cls: 'nb-badge nb-badge-yellow' },
  policy_checking:  { label: 'policy_check',     cls: 'nb-badge nb-badge-yellow' },
  approved:         { label: 'approved',         cls: 'nb-badge nb-badge-teal' },
  wallet_ready:     { label: 'wallet_ready',     cls: 'nb-badge nb-badge-teal' },
  routing:          { label: 'routing',          cls: 'nb-badge nb-badge-indigo' },
  settling:         { label: 'arc_settling',     cls: 'nb-badge nb-badge-indigo' },
  confirmed:        { label: 'confirmed',        cls: 'nb-badge nb-badge-teal' },
  fulfilled:        { label: 'fulfilled',        cls: 'nb-badge nb-badge-teal' },
  error:            { label: 'error',            cls: 'nb-badge nb-badge-red' },
};

/* ─────────────────────────────────────────────────────────────────────────── */

export default function EventFeed({ events, appMode = 'demo' }: EventFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  return (
    <div className="h-full flex flex-col">
      {/* ── Panel Header ───────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b-2"
        style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--nb-dark-2)' }}
      >
        <div className="flex items-center gap-3">
          {/* Yellow left-bar section label */}
          <span className="nb-section-label">Agent Event Stream</span>
          <span className="text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
            Real-time policy + settlement log
          </span>
        </div>

        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <span className="nb-badge nb-badge-muted">
              {events.length} events
            </span>
          )}
          <span
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase"
            style={{ color: appMode === 'live' ? '#4ADE80' : '#FDC800' }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
              style={{ background: appMode === 'live' ? '#4ADE80' : '#FDC800' }}
            />
            {appMode === 'live' ? 'live' : 'demo'}
          </span>
        </div>
      </div>

      {/* ── Event List ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
            <div
              className="w-12 h-12 flex items-center justify-center border-2"
              style={{ borderColor: 'rgba(253,200,0,0.2)', background: 'rgba(253,200,0,0.04)' }}
            >
              <Activity className="w-5 h-5" style={{ color: 'rgba(253,200,0,0.4)' }} />
            </div>
            <div className="text-center">
              <p
                className="text-[11px] font-mono font-bold uppercase tracking-widest mb-1"
                style={{ color: '#FDC800', opacity: 0.5 }}
              >
                Awaiting Execution
              </p>
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Select a vendor service and click Execute Payment
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {events.map((event, i) => (
              <EventCard key={`${event.id}-${event.timestamp}-${i}`} event={event} index={i} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Bottom status bar ──────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-t-2"
        style={{ borderColor: 'rgba(253,200,0,0.15)', background: 'var(--nb-dark-2)' }}
      >
        <Zap className="w-3 h-3" style={{ color: '#FDC800' }} />
        <span className="text-[10px] font-mono" style={{ color: '#FDC800' }}>
          {appMode === 'live'
            ? 'Live Arc Testnet — real Circle Gateway settlement flow'
            : 'Demo mode — simulated Gateway + Arc settlement flow'}
        </span>
      </div>
    </div>
  );
}

/* ── Individual event card ─────────────────────────────────────────────── */

function EventCard({ event, index }: { event: DemoEvent; index: number }) {
  const cfg = SOURCE_CONFIG[event.source] ?? SOURCE_CONFIG.system;
  const Icon = cfg.icon;
  const stateBadge = STATE_BADGE[event.state] ?? { label: event.state, cls: 'nb-badge nb-badge-muted' };

  const metaEntries = event.metadata ? Object.entries(event.metadata) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Neobrutalist card: flat border, left accent bar, hard shadow */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'var(--nb-dark-3)',
          border: '2px solid rgba(255,255,255,0.1)',
          borderLeft: `4px solid ${cfg.accent}`,
          boxShadow: `3px 3px 0px ${cfg.accent}22`,
        }}
      >
        {/* Card header row */}
        <div className="flex items-start justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2.5">
            {/* Source icon */}
            <div
              className="w-6 h-6 flex items-center justify-center flex-shrink-0"
              style={{ background: `${cfg.accent}18`, border: `1.5px solid ${cfg.accent}40` }}
            >
              <Icon className="w-3 h-3" style={{ color: cfg.accent }} />
            </div>

            {/* Source badge + state badge */}
            <span className={cfg.badgeClass}>{cfg.label}</span>
            <span className={stateBadge.cls}>{stateBadge.label}</span>
          </div>

          {/* Timestamp */}
          <span
            className="text-[10px] font-mono flex-shrink-0 ml-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {formatTimestamp(event.timestamp)}
          </span>
        </div>

        {/* Title */}
        <div className="px-4 pb-1">
          <h3
            className="text-sm font-bold leading-snug"
            style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}
          >
            {event.title}
          </h3>
        </div>

        {/* Description */}
        <div className="px-4 pb-3">
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {event.description}
          </p>
        </div>

        {/* Metadata rows — neobrutalist: flat 2-col grid, monospace labels */}
        {metaEntries.length > 0 && (
          <div
            className="mx-4 mb-3 grid gap-px"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.08)',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            }}
          >
            {metaEntries.map(([key, val]) => (
              <div
                key={key}
                className="px-2.5 py-1.5"
                style={{ background: 'var(--nb-dark-2)' }}
              >
                <div
                  className="text-[9px] font-mono font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
                >
                  {key}
                </div>
                <div
                  className="text-[11px] font-mono font-semibold truncate"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {String(val)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
