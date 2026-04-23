'use client';

import { motion } from 'framer-motion';
import type { TransactionState } from '@/types';

interface PaymentRailProps {
  currentState: TransactionState;
  mode?: 'live' | 'demo' | 'legacy';
}

/* ── Step definitions ──────────────────────────────────────────────────────── */

const STEPS: {
  state: TransactionState;
  label: string;
  layer: string;
  layerColor: string;
}[] = [
  { state: 'idle',            label: 'IDLE',      layer: 'CONTROL',  layerColor: '#566680' },
  { state: 'selected',        label: 'SELECT',    layer: 'BUYER',    layerColor: '#432DD7' },
  { state: 'inspecting',      label: 'INSPECT',   layer: 'CONTROL',  layerColor: '#566680' },
  { state: 'policy_checking', label: 'POLICY',    layer: 'OMNICLAW', layerColor: '#FDC800' },
  { state: 'approved',        label: 'APPROVED',  layer: 'OMNICLAW', layerColor: '#FDC800' },
  { state: 'wallet_ready',    label: 'FUNDED',    layer: 'CIRCLE',   layerColor: '#432DD7' },
  { state: 'routing',         label: 'ROUTE',     layer: 'CIRCLE',   layerColor: '#432DD7' },
  { state: 'settling',        label: 'SETTLE',    layer: 'ARC',      layerColor: '#0D9488' },
  { state: 'confirmed',       label: 'PROOF',     layer: 'ARC',      layerColor: '#0D9488' },
  { state: 'fulfilled',       label: 'DONE',      layer: 'SELLER',   layerColor: '#16A34A' },
];

const ORDER = STEPS.map((s) => s.state);

function status(
  step: TransactionState,
  current: TransactionState
): 'done' | 'active' | 'pending' | 'error' {
  if (current === 'error') return 'error';
  const ci = ORDER.indexOf(current);
  const si = ORDER.indexOf(step);
  if (si < 0) return 'pending';
  if (si < ci) return 'done';
  if (si === ci) return 'active';
  return 'pending';
}

/* ─────────────────────────────────────────────────────────────────────────── */

export default function PaymentRail({ currentState, mode = 'demo' }: PaymentRailProps) {
  return (
    <div
      className="flex items-stretch w-full"
      style={{
        height: 54,
        background: 'var(--nb-dark-2)',
      }}
    >
      {/* Steps — flex-1 each so they tile evenly edge-to-edge */}
      {STEPS.map((step, i) => {
        const st = status(step.state, currentState);
        const isActive  = st === 'active';
        const isDone    = st === 'done';
        const isError   = st === 'error';

        const color = step.layerColor;
        const labelColor = isActive
          ? color
          : isDone
            ? 'rgba(255,255,255,0.55)'
            : isError
              ? '#EF4444'
              : 'rgba(255,255,255,0.22)';

        const numColor = isActive
          ? color
          : isDone
            ? 'rgba(255,255,255,0.3)'
            : 'rgba(255,255,255,0.13)';

        return (
          <div key={step.state} className="flex items-stretch flex-1 min-w-0">
            {/* Step cell fills its flex share */}
            <div
              className="flex-1 flex flex-col items-center justify-center select-none cursor-default px-1"
              style={{
                borderBottom: isActive
                  ? `3px solid ${color}`
                  : isDone
                    ? '3px solid rgba(255,255,255,0.12)'
                    : '3px solid transparent',
                background: isActive ? `${color}0D` : 'transparent',
                borderRight: i < STEPS.length - 1
                  ? '1px solid rgba(255,255,255,0.06)'
                  : 'none',
              }}
            >
              {/* Number */}
              <span
                className="text-[9px] font-mono font-bold tabular-nums leading-none mb-0.5"
                style={{ color: numColor }}
              >
                {isDone ? '✓' : isError ? '✗' : String(i + 1).padStart(2, '0')}
              </span>

              {/* Label */}
              <motion.span
                className="text-[11px] font-black uppercase leading-none"
                style={{
                  color: labelColor,
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-mono)',
                }}
                animate={isActive ? { opacity: [1, 0.6, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              >
                {step.label}
              </motion.span>

              {/* Layer */}
              <span
                className="text-[8px] font-mono font-semibold uppercase leading-none mt-0.5"
                style={{
                  color: isActive ? `${color}88` : 'rgba(255,255,255,0.12)',
                  letterSpacing: '0.04em',
                }}
              >
                {step.layer}
              </span>
            </div>
          </div>
        );
      })}

      {/* Mode pill — flush right, fixed width */}
      <div
        className="flex items-center px-4 border-l flex-shrink-0 self-stretch"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: mode === 'live' ? '#4ADE80' : '#FDC800',
              boxShadow: mode === 'live'
                ? '0 0 6px #4ADE8066'
                : '0 0 6px #FDC80066',
            }}
          />
          <span
            className="text-[10px] font-mono font-bold uppercase"
            style={{
              color: mode === 'live' ? '#4ADE80' : '#FDC800',
              letterSpacing: '0.1em',
            }}
          >
            {mode === 'live' ? 'Live' : 'Demo'}
          </span>
        </div>
      </div>
    </div>
  );
}
