import React from 'react';
import { motion } from 'framer-motion';
import { SellerService } from '../types';
import { StatusBadge } from './StatusBadge';
import { Database, Lock, Unlock, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ServiceCard({ service }: { service: SellerService }) {
  return (
    <motion.div
      className={cn(
        "p-4 rounded-xl border transition-all duration-300 relative overflow-hidden",
        service.status === 'selected' ? "border-primary bg-primary/5 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]" :
        service.status === 'processing' ? "border-amber-500/50 bg-amber-500/5" :
        service.status === 'unlocked' ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]" :
        "border-border/50 bg-secondary/20 hover:border-border"
      )}
    >
      {service.status === 'unlocked' && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full animate-[shimmer_2s_infinite]"></div>
      )}
      
      <div className="flex justify-between items-start mb-2">
        <div className="font-semibold text-foreground/90 flex items-center gap-2">
          <Database className="w-4 h-4 text-muted-foreground" />
          {service.name}
        </div>
        <div className="text-sm font-mono font-medium text-foreground">
          ${service.price.toFixed(2)}
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        {service.description}
      </p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="text-[10px] font-mono text-muted-foreground/60 bg-background/50 px-2 py-1 rounded flex items-center gap-1">
          <ArrowRight className="w-3 h-3" />
          {service.endpoint}
        </div>
        
        <StatusBadge 
          variant={
            service.status === 'unlocked' ? 'success' : 
            service.status === 'processing' ? 'warning' : 
            service.status === 'selected' ? 'info' : 'outline'
          }
        >
          {service.status === 'locked' || service.status === 'available' ? <Lock className="w-3 h-3 mr-1" /> :
           service.status === 'processing' ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> :
           service.status === 'unlocked' ? <Unlock className="w-3 h-3 mr-1" /> : null}
          {service.status === 'unlocked' ? 'Access Granted' : service.status}
        </StatusBadge>
      </div>
    </motion.div>
  );
}
