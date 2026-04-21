'use client';

import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import type { TransactionState } from '@/types';
import { TRANSACTION_STATES, STATE_LABELS } from '@/types';

interface PaymentRailProps {
  currentState: TransactionState;
}

export default function PaymentRail({ currentState }: PaymentRailProps) {
  // Exclude idle and error from the rail
  const steps = TRANSACTION_STATES.filter((s) => s !== 'idle');
  const currentIndex = steps.indexOf(currentState as typeof steps[number]);

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-px bg-[var(--color-border-subtle)]" />

        {/* Progress line */}
        <motion.div
          className="absolute top-4 left-0 h-px bg-[var(--color-accent-violet)]"
          initial={{ width: '0%' }}
          animate={{
            width: currentIndex >= 0 ? `${(currentIndex / (steps.length - 1)) * 100}%` : '0%',
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            boxShadow: '0 0 8px var(--color-accent-violet)',
          }}
        />

        {steps.map((step, i) => {
          const isCompleted = currentIndex >= 0 && i < currentIndex;
          const isActive = i === currentIndex;
          const isPending = i > currentIndex || currentIndex < 0;

          return (
            <div key={step} className="relative flex flex-col items-center z-10" style={{ flex: 1 }}>
              {/* Circle */}
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isCompleted
                    ? 'bg-[var(--color-accent-violet)] border-[var(--color-accent-violet)]'
                    : isActive
                      ? 'bg-[var(--color-bg-elevated)] border-[var(--color-accent-violet)] glow-violet'
                      : 'bg-[var(--color-bg-secondary)] border-[var(--color-border-subtle)]'
                }`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : isActive ? (
                  <Loader2 className="w-3.5 h-3.5 text-[var(--color-accent-violet)] animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[var(--color-border-default)]" />
                )}
              </motion.div>

              {/* Label */}
              <span
                className={`mt-2 text-[10px] font-medium text-center leading-tight max-w-[70px] ${
                  isCompleted
                    ? 'text-[var(--color-accent-violet)]'
                    : isActive
                      ? 'text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-muted)]'
                }`}
              >
                {STATE_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
