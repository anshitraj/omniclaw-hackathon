'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, ChevronDown, ChevronUp, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import type { IntegrationHealth } from '@/types';

interface IntegrationStatusPanelProps {
  health: IntegrationHealth;
}

function StatusIcon({ value }: { value: boolean }) {
  return value ? (
    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent-green)]" />
  ) : (
    <XCircle className="w-3.5 h-3.5 text-[var(--color-accent-red)]" />
  );
}

function StateIcon({ state }: { state: string }) {
  if (state === 'configured') {
    return <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent-green)]" />;
  }
  if (state === 'partially_configured') {
    return <MinusCircle className="w-3.5 h-3.5 text-[var(--color-accent-amber)]" />;
  }
  return <XCircle className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="font-mono text-[var(--color-text-secondary)]">{value}</span>
    </div>
  );
}

export default function IntegrationStatusPanel({ health }: IntegrationStatusPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const warnings = (health.warnings || []).filter(
    (warning) => warning !== 'OmniClaw API ledger and on-chain available balance differ.',
  );

  return (
    <div className="border-t border-[var(--color-border-subtle)]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 text-xs hover:bg-[var(--color-bg-hover)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-[var(--color-accent-teal)]" />
          <span className="font-medium text-[var(--color-text-secondary)]">Integration Status</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3 text-xs">
              <div className="h-px bg-[var(--color-border-subtle)]" />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-primary)] font-semibold">OmniClaw</span>
                  <StateIcon state={health.omniclaw.state} />
                </div>
                <Row label="Mode" value={health.omniclaw.serverMode ? 'server' : 'mock'} />
                <Row label="Auth" value={health.omniclaw.serverAuth} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">OmniClaw configured</span>
                  <StatusIcon value={!!health.omniclawConfigured} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)]">AI (Featherless)</span>
                  <StateIcon state={health.ai.state} />
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="px-2 py-2 rounded bg-[var(--color-accent-amber)]/10 border border-[var(--color-accent-amber)]/25">
                  {warnings.map((warning) => (
                    <p key={warning} className="text-[10px] text-[var(--color-accent-amber)]">
                      {warning}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
