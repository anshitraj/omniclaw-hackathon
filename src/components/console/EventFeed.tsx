'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Store,
  Shield,
  Radio,
  Layers,
  Wallet,
  Activity,
} from 'lucide-react';
import type { TimelineEvent } from '@/types';
import { formatTimestamp } from '@/lib/utils';

interface EventFeedProps {
  events: TimelineEvent[];
}

const sourceConfig: Record<string, { icon: typeof Bot; color: string; label: string }> = {
  buyer: { icon: Bot, color: 'var(--color-accent-violet)', label: 'Buyer' },
  seller: { icon: Store, color: 'var(--color-accent-amber)', label: 'Service' },
  policy: { icon: Shield, color: 'var(--color-accent-teal)', label: 'Policy' },
  settlement: { icon: Layers, color: 'var(--color-accent-blue)', label: 'Settlement' },
  wallet: { icon: Wallet, color: 'var(--color-accent-green)', label: 'Wallet' },
  system: { icon: Radio, color: 'var(--color-text-muted)', label: 'System' },
};

export default function EventFeed({ events }: EventFeedProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border-subtle)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-hover)] flex items-center justify-center">
          <Activity className="w-4 h-4 text-[var(--color-text-secondary)]" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Event Feed</h2>
          <p className="text-xs text-[var(--color-text-muted)]">Live negotiation & execution</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs font-mono text-[var(--color-text-muted)]">
            {events.length} events
          </span>
        </div>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-bg-hover)] flex items-center justify-center mb-4">
              <Radio className="w-5 h-5 text-[var(--color-text-muted)]" />
            </div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Awaiting activity</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Select a service from the API catalog panel to begin
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {events.map((event) => {
            const config = sourceConfig[event.source] || sourceConfig.system;
            const Icon = config.icon;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex gap-3 mb-4 last:mb-0"
              >
                {/* Timeline dot */}
                <div className="flex flex-col items-center pt-0.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}15` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                  </div>
                  <div className="w-px flex-1 mt-1 bg-[var(--color-border-subtle)]" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: `${config.color}15`,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-[var(--color-text-primary)] mb-0.5">
                    {event.title}
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {event.description}
                  </p>

                  {/* Metadata */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] font-mono"
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </div>
  );
}
