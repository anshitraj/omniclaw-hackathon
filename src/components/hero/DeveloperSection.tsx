'use client';

import { motion } from 'framer-motion';
import {
  Code,
  Server,
  Wallet,
  Globe,
  Key,
  Terminal,
} from 'lucide-react';

const integrationPoints = [
  {
    icon: Server,
    title: 'OmniClaw Policy Layer',
    description: 'Buyer-side inspect and payment orchestration before any settlement rail receives a payload.',
    env: 'OMNICLAW_API_URL optional, CIRCLE_BUYER_API_KEY / CIRCLE_SELLER_API_KEY',
    path: 'lib/integrations/omniclaw/client.ts',
    color: 'var(--color-accent-violet)',
  },
  {
    icon: Wallet,
    title: 'Circle Nanopayments Rail',
    description: 'Hackathon-aligned sub-cent per-action payments for API calls, compute units, and agent commerce.',
    env: 'CIRCLE_GATEWAY_ENABLED=true (default), OMNICLAW_FORCE_DIRECT_RAIL=false',
    path: 'lib/payments/router.ts + lib/payments/gateway.ts',
    color: 'var(--color-accent-green)',
  },
  {
    icon: Globe,
    title: 'Seller Endpoint',
    description: 'Monetized API surface with paywall-gated routes and seller-side fulfillment unlock.',
    env: 'Seller services configured in lib/demo/data.ts',
    path: 'app/api/services/route.ts',
    color: 'var(--color-accent-amber)',
  },
  {
    icon: Terminal,
    title: 'OmniClaw CLI + Arc Proof',
    description: 'The CLI is the agent execution surface; ArcScan proves the USDC settlement path.',
    env: 'ARC_RPC_URL, ARC_EXPLORER_URL',
    path: 'lib/integrations/arc/explorer.ts',
    color: 'var(--color-accent-blue)',
  },
  {
    icon: Key,
    title: 'AI Providers',
    description: 'Agent reasoning via Gemini, Featherless, or AI/ML API.',
    env: 'GEMINI_API_KEY, FEATHERLESS_API_KEY, AIMLAPI_API_KEY',
    path: 'lib/ai/index.ts',
    color: 'var(--color-accent-teal)',
  },
];

export default function DeveloperSection() {
  return (
    <section className="py-24 px-6 border-t border-[var(--color-border-subtle)]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] mb-6">
            <Code className="w-3 h-3 text-[var(--color-accent-teal)]" />
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Developer Readiness</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">Integration Points</h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
            The app is organized to show the separation that matters: OmniClaw governs financial authority; Circle and Arc settle approved payments.
          </p>
        </motion.div>

        <div className="space-y-4">
          {integrationPoints.map((point, i) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${point.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: point.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">{point.title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">{point.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <code className="text-[10px] px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] text-[var(--color-accent-violet)] font-mono">
                        {point.env}
                      </code>
                      <code className="text-[10px] px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] font-mono">
                        {point.path}
                      </code>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
