'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  Globe,
  Wallet,
  ArrowRight,
  Layers,
  Play,
} from 'lucide-react';
import Link from 'next/link';

const techStack = [
  { label: 'Arc Testnet', icon: Globe, color: '#0D9488' },
  { label: 'Circle Gateway', icon: Wallet, color: '#432DD7' },
  { label: 'OmniClaw Policy', icon: Shield, color: '#FDC800' },
  { label: 'USDC Settlement', icon: Layers, color: '#7B6EF0' },
  { label: 'Nanopayments', icon: Zap, color: '#16A34A' },
];

const steps = [
  { n: '01', title: 'Agent selects', body: 'Buyer agent picks a paid vendor API endpoint' },
  { n: '02', title: 'OmniClaw checks', body: '5-point policy engine — budget · allowlist · network' },
  { n: '03', title: 'Circle settles', body: 'Gateway nanopayment → Arc proof → seller credited' },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden dot-grid">

      {/* Structural lines */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FDC800]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 w-full">

        {/* Hackathon chip row */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-wrap items-center gap-3 mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 text-[11px] font-mono font-bold uppercase tracking-widest border-2"
            style={{ borderColor: '#FDC800', color: '#FDC800', background: 'rgba(253,200,0,0.07)' }}
          >
            Arc + Circle Agentic Commerce Hackathon
          </div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest border-2"
            style={{ borderColor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.5)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse-slow" />
            Demo live
          </div>
        </motion.div>

        {/* Headline — NEOBRUTALIST WORDART */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="mb-6"
        >
          {/* Big chunky headline: flat yellow + white, no gradient */}
          <h1
            className="font-black leading-[0.88] tracking-tighter"
            style={{ fontSize: 'clamp(64px, 10vw, 128px)', fontFamily: 'var(--font-sans)' }}
          >
            <span
              className="block"
              style={{ color: '#FDC800', letterSpacing: '-0.045em' }}
            >
              Autonomous
            </span>
            <span
              className="block"
              style={{ color: '#F5F5F0', letterSpacing: '-0.04em' }}
            >
              Commerce.
            </span>
            <span
              className="block text-right"
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px rgba(255,255,255,0.25)',
                letterSpacing: '-0.04em',
              }}
            >
              Controlled.
            </span>
          </h1>
        </motion.div>

        {/* Subheading — confident, not flowery */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.45 }}
          className="text-base sm:text-lg max-w-xl mb-10 leading-relaxed font-medium"
          style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em' }}
        >
          The buyer agent never touches a private key. OmniClaw&apos;s policy engine
          authorizes every micro-payment &mdash; Circle Gateway executes,
          Arc Testnet settles with a verifiable proof.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.4 }}
          className="flex flex-wrap gap-3 mb-14"
        >
          {/* Primary: yellow, neobrutalist */}
          <Link
            href="/console"
            className="group inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-black uppercase tracking-widest border-2 transition-all"
            style={{
              background: '#FDC800',
              borderColor: '#FDC800',
              color: '#1C293C',
              boxShadow: '4px 4px 0px rgba(253,200,0,0.35)',
              letterSpacing: '0.08em',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0px rgba(253,200,0,0.35)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0px rgba(253,200,0,0.35)'; }}
          >
            <Play className="w-3.5 h-3.5" />
            Launch Console
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Secondary: outlined */}
          <Link
            href="#architecture"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-bold uppercase tracking-widest border-2 transition-all"
            style={{
              borderColor: 'rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.06em',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            View Architecture
          </Link>

          {/* Demo: indigo */}
          <Link
            href="/console?autorun=true"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-[13px] font-bold uppercase tracking-widest border-2 transition-all"
            style={{
              background: 'rgba(67,45,215,0.15)',
              borderColor: '#432DD7',
              color: '#7B6EF0',
              letterSpacing: '0.06em',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(67,45,215,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(67,45,215,0.15)'; }}
          >
            <Zap className="w-3.5 h-3.5" />
            Run Demo
          </Link>
        </motion.div>

        {/* How it works — neobrutalist 3-col cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.45 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-0 max-w-2xl border-2"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="flex flex-col gap-1 p-5"
              style={{
                background: 'var(--nb-dark-2)',
                borderRight: i < steps.length - 1 ? '2px solid rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <span
                className="text-[11px] font-mono font-black"
                style={{ color: '#FDC800' }}
              >
                {s.n}
              </span>
              <span
                className="text-sm font-black"
                style={{ color: '#F5F5F0', letterSpacing: '-0.01em' }}
              >
                {s.title}
              </span>
              <span
                className="text-[11px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {s.body}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Tech stack chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex flex-wrap gap-2 mt-8"
        >
          {techStack.map((t) => (
            <div
              key={t.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 text-[11px] font-mono font-semibold"
              style={{ borderColor: `${t.color}40`, color: t.color, background: `${t.color}08` }}
            >
              <t.icon className="w-3 h-3" />
              {t.label}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom yellow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: 'rgba(253,200,0,0.15)' }} />
    </section>
  );
}
