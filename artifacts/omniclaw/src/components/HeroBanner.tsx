import React from 'react';
import { Shield, Play, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';

interface HeroBannerProps {
  onRunDemo: () => void;
  onInspectFlow: () => void;
  isRunning: boolean;
}

export function HeroBanner({ onRunDemo, onInspectFlow, isRunning }: HeroBannerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center py-16 md:py-24 space-y-8"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <span className="text-2xl font-bold tracking-tight">OmniClaw</span>
      </div>
      
      <div className="space-y-4 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-primary to-teal-400">
            Autonomous Commerce.
          </span>
          <br />
          <span className="text-foreground">Controlled.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Agents negotiate, authorize, and settle — governed by OmniClaw's policy engine.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <StatusBadge variant="secondary">Policy-Controlled</StatusBadge>
        <StatusBadge variant="secondary">Arc Testnet</StatusBadge>
        <StatusBadge variant="secondary">x402 Exact</StatusBadge>
        <StatusBadge variant="secondary">Agent-to-Agent</StatusBadge>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <Button 
          size="lg" 
          className="rounded-full px-8 font-semibold shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
          onClick={onRunDemo}
          disabled={isRunning}
          data-testid="button-run-demo"
        >
          {isRunning ? <Activity className="w-4 h-4 mr-2 animate-pulse" /> : <Play className="w-4 h-4 mr-2" />}
          {isRunning ? 'Demo Running...' : 'Run Demo'}
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="rounded-full px-8"
          onClick={onInspectFlow}
          data-testid="button-inspect-flow"
        >
          Inspect Flow
        </Button>
      </div>
    </motion.div>
  );
}
