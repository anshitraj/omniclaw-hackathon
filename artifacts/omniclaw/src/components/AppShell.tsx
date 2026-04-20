import React from 'react';
import { BackgroundGlow } from './BackgroundGlow';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col relative overflow-x-hidden">
      <BackgroundGlow />
      <main className="flex-1 relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {children}
      </main>
      <footer className="border-t border-border/50 py-6 relative z-10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm font-medium">
            OmniClaw lets agents pay through policy, not raw wallet authority.
          </p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground/60">
            <span>Arc Testnet</span>
            <span>&bull;</span>
            <span>x402 Protocol</span>
            <span>&bull;</span>
            <span>Agent Commerce Layer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
