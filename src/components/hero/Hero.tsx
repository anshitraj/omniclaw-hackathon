'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Globe,
  Wallet,
  ArrowRight,
  Layers,
  Eye,
  Play,
} from 'lucide-react';
import Link from 'next/link';

const badges = [
  { label: 'Arc Testnet', icon: Globe, color: 'text-[var(--color-accent-teal)]' },
  { label: 'USDC', icon: Layers, color: 'text-[var(--color-accent-blue)]' },
  { label: 'Policy-Controlled', icon: Shield, color: 'text-[var(--color-accent-violet)]' },
  { label: 'Circle Wallets', icon: Wallet, color: 'text-[var(--color-accent-green)]' },
  { label: 'Gateway Rail', icon: Zap, color: 'text-[var(--color-accent-amber)]' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 grid-overlay" />
      <div className="absolute inset-0 noise-overlay" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[var(--color-accent-violet)] opacity-[0.04] blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[var(--color-accent-teal)] opacity-[0.03] blur-[100px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent-violet)] animate-pulse-slow" />
            <span className="text-sm font-medium text-[var(--color-text-secondary)] tracking-wide">
              OmniClaw Console
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] font-mono">
              v1.0
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mb-6"
        >
          <span className="text-gradient-hero">Autonomous Commerce.</span>
          <br />
          <span className="text-[var(--color-text-primary)]">Controlled.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Where agents negotiate, authorize, and settle. The buyer agent operates through
          OmniClaw&apos;s policy engine â€” never with raw wallet authority. Settlement flows
          through Arc Testnet. Powered by Circle Gateway / Nanopayments with Arc settlement proof.
        </motion.p>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-default"
            >
              <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {badge.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/console"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--color-accent-violet)] text-white font-semibold text-base hover:brightness-110 transition-all glow-violet"
          >
            <Play className="w-4 h-4" />
            Launch Console
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="#architecture"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] font-semibold text-base hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all"
          >
            <Eye className="w-4 h-4" />
            View Architecture
          </Link>

          <Link
            href="/console?autorun=true"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] font-semibold text-base hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all"
          >
            <Zap className="w-4 h-4" />
            Run Demo
          </Link>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--color-bg-primary)] to-transparent" />
    </section>
  );
}

