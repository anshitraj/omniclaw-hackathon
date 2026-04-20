import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionState } from '../types';
import { FileText, ChevronUp, ChevronDown, Copy, CheckCircle2, ShieldCheck, Link as LinkIcon } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function TransactionDrawer({ transaction }: { transaction: TransactionState }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none px-4 pb-4 md:px-8 md:pb-8 flex justify-center"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="w-full max-w-3xl bg-card border border-border/50 rounded-t-xl rounded-b-xl shadow-2xl pointer-events-auto backdrop-blur-md overflow-hidden">
        
        {/* Header - Always visible */}
        <div 
          className="px-6 py-4 flex items-center justify-between cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              transaction.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500" :
              transaction.status === 'submitted' ? "bg-amber-500/10 text-amber-500" :
              "bg-muted text-muted-foreground"
            )}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Transaction Proof</h3>
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                <span>{transaction.amount} {transaction.currency || 'USDC'}</span>
                <span>&bull;</span>
                <span className="font-mono">{transaction.hash ? `${transaction.hash.slice(0, 10)}...` : 'Awaiting settlement'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <StatusBadge variant={
              transaction.status === 'confirmed' ? 'success' : 
              transaction.status === 'submitted' ? 'warning' : 'pending'
            }>
              {transaction.status}
            </StatusBadge>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border/50"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-background/50">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block mb-1">Recipient Endpoint</span>
                    <div className="text-sm font-mono bg-secondary/50 p-2 rounded border border-border/50">
                      {transaction.recipient}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium block mb-1">Amount</span>
                      <div className="text-sm font-bold">
                        {transaction.amount} USDC
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-medium block mb-1">Network & Rail</span>
                      <div className="flex items-center gap-2">
                        <StatusBadge variant="outline">{transaction.network}</StatusBadge>
                        <StatusBadge variant="outline">{transaction.rail}</StatusBadge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block mb-1 flex justify-between">
                      Transaction Hash
                      {transaction.hash && <Copy className="w-3 h-3 cursor-pointer hover:text-primary" />}
                    </span>
                    <div className={cn(
                      "text-sm font-mono p-2 rounded border border-border/50 flex items-center justify-between",
                      transaction.hash ? "bg-secondary/50 text-primary" : "bg-muted/20 text-muted-foreground italic"
                    )}>
                      {transaction.hash || "Not yet minted"}
                      {transaction.hash && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground font-medium block mb-1">Policy Outcome</span>
                    <div className="text-sm flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4" />
                      {transaction.policyOutcome}
                    </div>
                  </div>
                  
                  {transaction.status === 'confirmed' && (
                    <Button variant="link" className="w-full text-xs text-primary h-auto p-0 justify-start" asChild>
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        <LinkIcon className="w-3 h-3 mr-2" />
                        View on ArcScan Explorer
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
