import React from 'react';
import { useDemoFlow } from '@/hooks/useDemoFlow';
import { AppShell } from '@/components/AppShell';
import { HeroBanner } from '@/components/HeroBanner';
import { BuyerAgentPanel } from '@/components/BuyerAgentPanel';
import { EventFeed } from '@/components/EventFeed';
import { SellerPanel } from '@/components/SellerPanel';
import { ExecutionTimeline } from '@/components/ExecutionTimeline';
import { TransactionDrawer } from '@/components/TransactionDrawer';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const {
    state,
    buyerAgent,
    services,
    events,
    timeline,
    policyChecks,
    transaction,
    runDemo,
    resetDemo
  } = useDemoFlow();

  const isRunning = state !== 'idle' && state !== 'fulfilled';
  
  const handleInspectFlow = () => {
    document.getElementById('console-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AppShell>
      <HeroBanner 
        onRunDemo={runDemo} 
        onInspectFlow={handleInspectFlow} 
        isRunning={isRunning} 
      />
      
      <div id="console-section" className="space-y-8 pb-32">
        <ExecutionTimeline steps={timeline} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <BuyerAgentPanel agent={buyerAgent} policyChecks={policyChecks} />
          <EventFeed events={events} />
          <SellerPanel services={services} />
        </div>

        {state !== 'idle' && (
          <div className="flex justify-center pt-8">
            <Button variant="outline" onClick={resetDemo} className="gap-2 text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-4 h-4" />
              Reset Demo
            </Button>
          </div>
        )}
      </div>

      <TransactionDrawer transaction={transaction} />
    </AppShell>
  );
}
