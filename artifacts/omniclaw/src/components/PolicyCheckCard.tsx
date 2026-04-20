import React from 'react';
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react';
import { PolicyCheck } from '../types';
import { StatusBadge } from './StatusBadge';
import { motion } from 'framer-motion';

export function PolicyCheckCard({ check }: { check: PolicyCheck }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/30"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {check.status === 'pending' && <Clock className="w-4 h-4 text-muted-foreground" />}
          {check.status === 'checking' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
          {check.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {check.status === 'failed' && <XCircle className="w-4 h-4 text-destructive" />}
        </div>
        <span className="text-sm font-medium text-foreground/90">{check.label}</span>
      </div>
      <StatusBadge 
        variant={
          check.status === 'passed' ? 'success' : 
          check.status === 'checking' ? 'active' : 
          check.status === 'failed' ? 'error' : 'pending'
        }
      >
        {check.status === 'checking' ? 'Evaluating...' : check.status}
      </StatusBadge>
    </motion.div>
  );
}
