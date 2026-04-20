import React from 'react';
import { motion } from 'framer-motion';
import { TimelineStep } from '../types';
import { cn } from '@/lib/utils';
import { Check, CircleDot, ChevronRight } from 'lucide-react';

export function ExecutionTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full py-6 px-4 bg-card/50 border border-border/50 rounded-2xl backdrop-blur overflow-x-auto custom-scrollbar"
    >
      <div className="flex items-center min-w-max justify-between px-2">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-3 relative z-10 w-24">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  step.status === 'complete' ? "bg-emerald-500 border-emerald-500 text-white" :
                  step.status === 'active' ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110" :
                  "bg-secondary border-border text-muted-foreground"
                )}>
                  {step.status === 'complete' ? <Check className="w-4 h-4" /> :
                   step.status === 'active' ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><CircleDot className="w-4 h-4" /></motion.div> :
                   <span className="text-xs font-bold">{index + 1}</span>}
                </div>
                <span className={cn(
                  "text-[10px] font-semibold tracking-wider uppercase text-center w-full transition-colors",
                  step.status === 'complete' ? "text-emerald-500" :
                  step.status === 'active' ? "text-primary" :
                  "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              
              {!isLast && (
                <div className="flex-1 h-[2px] mx-2 bg-secondary relative overflow-hidden flex items-center min-w-[40px]">
                  <div className={cn(
                    "absolute inset-y-0 left-0 transition-all duration-1000",
                    step.status === 'complete' ? "bg-emerald-500 w-full" : 
                    step.status === 'active' ? "bg-gradient-to-r from-primary/50 to-primary w-1/2" :
                    "w-0 bg-transparent"
                  )} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </motion.div>
  );
}
