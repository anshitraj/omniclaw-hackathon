import React from 'react';
import { motion } from 'framer-motion';
import { Server, ShieldAlert } from 'lucide-react';
import { SellerService } from '../types';
import { ServiceCard } from './ServiceCard';

interface SellerPanelProps {
  services: SellerService[];
}

export function SellerPanel({ services }: SellerPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col gap-6 p-6 rounded-2xl border border-card-border bg-card/80 backdrop-blur shadow-xl relative overflow-hidden"
    >
      <div className="absolute bottom-0 right-0 p-32 bg-teal-500/5 rounded-full blur-[80px] -z-10"></div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-lg border border-border">
            <Server className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Vendor Surface</h2>
            <div className="text-xs text-muted-foreground font-mono mt-0.5">
              arc:0x7a...9f2b
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/50 border border-border/50">
          <ShieldAlert className="w-3 h-3 text-teal-400" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Protected Endpoint</span>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold tracking-tight text-foreground/80">
          Available Services
        </h3>
        <div className="space-y-3">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
