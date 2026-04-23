'use client';

import { motion } from 'framer-motion';
import {
  Bot,
  Shield,
  Radio,
  Store,
  Layers,
  ArrowDown,
} from 'lucide-react';

const layers = [
  {
    icon: Bot,
    title: 'Buyer Agent',
    desc: 'Autonomous buyer agent selects paid actions and requests execution under policy constraints.',
    color: 'var(--color-accent-violet)',
  },
  {
    icon: Shield,
    title: 'OmniClaw Financial Control Layer',
    desc: 'The agent does not hold wallet authority. OmniClaw validates budget, recipient, network, and per-action limits before spend.',
    color: 'var(--color-accent-teal)',
  },
  {
    icon: Radio,
    title: 'Circle Nanopayments',
    desc: 'Sub-cent USDC payment execution for API calls, compute units, and machine-to-machine commerce.',
    color: 'var(--color-accent-green)',
  },
  {
    icon: Store,
    title: 'Seller Vendor Surface',
    desc: 'Vendor endpoint receives Gateway-side credit and unlocks fulfillment only after confirmed settlement.',
    color: 'var(--color-accent-amber)',
  },
  {
    icon: Layers,
    title: 'Arc Settlement / Proof',
    desc: 'Arc Testnet provides settlement confirmation and proof links for each completed payment action.',
    color: 'var(--color-accent-blue)',
  },
];

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            Financial Control Before Settlement
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
            The rail proves value can move cheaply. OmniClaw proves agents can move value safely.
          </p>
        </motion.div>

        <div className="space-y-1">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="flex items-start gap-4 p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors group">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${layer.color}15` }}
                >
                  <layer.icon className="w-5 h-5" style={{ color: layer.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">{layer.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{layer.desc}</p>
                </div>
                <div className="flex-shrink-0 text-xs font-mono text-[var(--color-text-muted)] mt-1">L{i + 1}</div>
              </div>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-4 h-4 text-[var(--color-border-default)]" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
