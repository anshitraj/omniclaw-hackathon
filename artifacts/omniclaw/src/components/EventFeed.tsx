import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bot, Shield, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { DemoEvent } from '../types';
import { ScrollArea } from '@/components/ui/scroll-area';

export function EventFeed({ events }: { events: DemoEvent[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col gap-4 p-6 rounded-2xl border border-card-border bg-card/80 backdrop-blur shadow-xl h-[600px] md:h-auto"
    >
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Live Event Stream
        </h2>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2" ref={scrollRef}>
        <div className="space-y-3 pb-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground opacity-50">
              <Activity className="w-8 h-8 mb-2 animate-pulse" />
              <p className="text-sm">Awaiting demo start...</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {events.map((event) => {
                const colors = {
                  buyer: 'border-l-blue-500 bg-blue-500/5',
                  seller: 'border-l-teal-500 bg-teal-500/5',
                  system: 'border-l-slate-500 bg-slate-500/5',
                  policy: 'border-l-violet-500 bg-violet-500/5',
                  settlement: 'border-l-amber-500 bg-amber-500/5',
                  success: 'border-l-emerald-500 bg-emerald-500/5',
                };
                
                const icons = {
                  buyer: <Bot className="w-3 h-3 text-blue-500" />,
                  seller: <Zap className="w-3 h-3 text-teal-500" />,
                  system: <Activity className="w-3 h-3 text-slate-500" />,
                  policy: <Shield className="w-3 h-3 text-violet-500" />,
                  settlement: <AlertCircle className="w-3 h-3 text-amber-500" />,
                  success: <CheckCircle className="w-3 h-3 text-emerald-500" />,
                };

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    className={`p-3 rounded-r-lg border border-l-4 border-y-border/50 border-r-border/50 ${colors[event.type]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{icons[event.type]}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground/80 tracking-tight uppercase">
                            {event.actor}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {event.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90">{event.message}</p>
                        {event.detail && (
                          <p className="text-xs text-muted-foreground font-mono mt-1 bg-background/50 p-1 rounded">
                            {event.detail}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
