import React from 'react';
import { Bot, Shield, Wallet, Activity, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Agent, PolicyCheck } from '../types';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { PolicyCheckCard } from './PolicyCheckCard';

interface BuyerAgentPanelProps {
  agent: Agent;
  policyChecks: PolicyCheck[];
}

export function BuyerAgentPanel({ agent, policyChecks }: BuyerAgentPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 p-6 rounded-2xl border border-card-border bg-card/80 backdrop-blur shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-[80px] -z-10"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-lg border border-border">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{agent.name}</h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {agent.status !== 'idle' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${agent.status === 'idle' ? 'bg-muted-foreground' : 'bg-primary'}`}></span>
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                {agent.status}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge variant={agent.policyState === 'approved' ? 'success' : agent.policyState === 'checking' ? 'warning' : 'default'}>
          <Shield className="w-3 h-3 mr-1" />
          {agent.policyState}
        </StatusBadge>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Spend Cap</span>
            <div className="text-sm font-mono bg-secondary/50 p-2 rounded border border-border/50">
              ${agent.spendCap.toFixed(2)} USDC
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium">Wallet Balance</span>
            <div className="text-sm font-mono bg-secondary/50 p-2 rounded border border-border/50 flex items-center justify-between">
              ${agent.walletBalance.toFixed(2)}
              <Wallet className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Objective</span>
          <div className="text-sm text-foreground/90 bg-secondary/50 p-2 rounded border border-border/50">
            {agent.objective}
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground font-medium">Current Action</span>
          <div className="text-sm font-medium text-primary bg-primary/5 p-2 rounded border border-primary/20 flex items-center gap-2">
            {agent.status !== 'idle' && <Activity className="w-4 h-4 animate-pulse" />}
            {agent.currentAction}
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          Policy Constraints
        </h3>
        <div className="space-y-2">
          {policyChecks.map(check => (
            <PolicyCheckCard key={check.id} check={check} />
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 flex gap-3">
        <Button variant="outline" className="flex-1 text-xs" data-testid="button-inspect-route">
          <ExternalLink className="w-3 h-3 mr-2" />
          Inspect Route
        </Button>
        <Button disabled className="flex-1 text-xs" data-testid="button-simulate">
          Simulate
        </Button>
      </div>
    </motion.div>
  );
}
