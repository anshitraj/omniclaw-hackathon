import { useState, useCallback, useRef, useEffect } from 'react';
import { Agent, DemoEvent, DemoState, PolicyCheck, SellerService, TimelineStep, TransactionState } from '../types';
import { initialBuyerAgent, initialEvents, initialPolicyChecks, initialSellerServices, initialTimelineSteps, initialTransactionState } from '../data/mockData';

export function useDemoFlow() {
  const [state, setState] = useState<DemoState>('idle');
  const [buyerAgent, setBuyerAgent] = useState<Agent>(initialBuyerAgent);
  const [services, setServices] = useState<SellerService[]>(initialSellerServices);
  const [events, setEvents] = useState<DemoEvent[]>(initialEvents);
  const [timeline, setTimeline] = useState<TimelineStep[]>(initialTimelineSteps);
  const [policyChecks, setPolicyChecks] = useState<PolicyCheck[]>(initialPolicyChecks);
  const [transaction, setTransaction] = useState<TransactionState>(initialTransactionState);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getTimestamp = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  const addEvent = useCallback((type: DemoEvent['type'], actor: string, message: string, detail?: string) => {
    setEvents(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: getTimestamp(),
      type,
      actor,
      message,
      detail
    }]);
  }, []);

  const resetDemo = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setState('idle');
    setBuyerAgent(initialBuyerAgent);
    setServices(initialSellerServices);
    setEvents(initialEvents);
    setTimeline(initialTimelineSteps);
    setPolicyChecks(initialPolicyChecks);
    setTransaction(initialTransactionState);
  }, []);

  const runDemo = useCallback(() => {
    resetDemo();
    setState('selected_service');
  }, [resetDemo]);

  // Demo state machine
  useEffect(() => {
    if (state === 'idle') return;

    let delay = 1000;

    if (state === 'selected_service') {
      setServices(prev => prev.map(s => s.id === 'svc-prime-scan' ? { ...s, status: 'selected' } : s));
      setBuyerAgent(prev => ({ ...prev, status: 'active', currentAction: 'Requesting service: Prime Market Scan' }));
      setTimeline(prev => prev.map((step, i) => i === 0 ? { ...step, status: 'active' } : step));
      
      addEvent('buyer', 'Nexus-7', 'Agent requesting service: Prime Market Scan');
      
      timerRef.current = setTimeout(() => {
        addEvent('seller', 'Prime Market Scan', 'Endpoint advertising: 0.25 USDC required');
        setState('inspecting');
      }, delay);
    } 
    else if (state === 'inspecting') {
      setBuyerAgent(prev => ({ ...prev, currentAction: 'Engaging OmniClaw Policy Engine' }));
      setTimeline(prev => prev.map((step, i) => i === 0 ? { ...step, status: 'complete' } : i === 1 ? { ...step, status: 'active' } : step));
      
      addEvent('system', 'OmniClaw', 'Policy engine engaged');
      
      timerRef.current = setTimeout(() => setState('policy_check'), delay);
    }
    else if (state === 'policy_check') {
      setBuyerAgent(prev => ({ ...prev, policyState: 'checking', currentAction: 'Evaluating Constraints' }));
      
      // Step through policies
      const runChecks = async () => {
        setPolicyChecks(prev => prev.map((c, i) => i === 0 ? { ...c, status: 'checking' } : c));
        await new Promise(r => setTimeout(r, 600));
        addEvent('policy', 'OmniClaw', 'Checking spend cap: $0.25 of $2.50 limit');
        setPolicyChecks(prev => prev.map((c, i) => i === 0 ? { ...c, status: 'passed' } : i === 1 ? { ...c, status: 'checking' } : c));
        
        await new Promise(r => setTimeout(r, 600));
        addEvent('policy', 'OmniClaw', 'Verifying recipient whitelist: endpoint registered');
        setPolicyChecks(prev => prev.map((c, i) => i === 1 ? { ...c, status: 'passed' } : i === 2 ? { ...c, status: 'checking' } : c));
        
        await new Promise(r => setTimeout(r, 600));
        addEvent('policy', 'OmniClaw', 'Confirming network constraint: Arc Testnet only');
        setPolicyChecks(prev => prev.map((c, i) => i === 2 ? { ...c, status: 'passed' } : i === 3 ? { ...c, status: 'checking' } : c));
        
        await new Promise(r => setTimeout(r, 600));
        setPolicyChecks(prev => prev.map((c, i) => i === 3 ? { ...c, status: 'passed' } : c));
        
        setState('approved');
      };
      runChecks();
    }
    else if (state === 'approved') {
      setBuyerAgent(prev => ({ ...prev, policyState: 'approved', currentAction: 'Payment Authorized' }));
      setTimeline(prev => prev.map((step, i) => i === 1 || i === 2 ? { ...step, status: 'complete' } : i === 3 ? { ...step, status: 'active' } : step));
      setTransaction(prev => ({ ...prev, policyOutcome: 'All constraints passed' }));
      
      addEvent('system', 'OmniClaw', 'All policy constraints passed — payment authorized');
      
      timerRef.current = setTimeout(() => {
        addEvent('system', 'OmniClaw', 'x402 exact payment path selected');
        setState('settling');
      }, delay);
    }
    else if (state === 'settling') {
      setBuyerAgent(prev => ({ ...prev, status: 'executing', currentAction: 'Settling Transaction' }));
      setTimeline(prev => prev.map((step, i) => i === 3 ? { ...step, status: 'complete' } : i === 4 ? { ...step, status: 'active' } : step));
      setTransaction(prev => ({ ...prev, status: 'submitted' }));
      setServices(prev => prev.map(s => s.id === 'svc-prime-scan' ? { ...s, status: 'processing' } : s));
      
      addEvent('settlement', 'Arc Testnet', 'Submitting 0.25 USDC to Arc Testnet...');
      
      timerRef.current = setTimeout(() => setState('confirmed'), delay * 1.5);
    }
    else if (state === 'confirmed') {
      const txHash = '0xarc4f29b' + Math.random().toString(16).substring(2, 10);
      setBuyerAgent(prev => ({ ...prev, walletBalance: prev.walletBalance - 0.25, currentAction: 'Transaction Confirmed' }));
      setTimeline(prev => prev.map((step, i) => i === 4 || i === 5 ? { ...step, status: 'complete' } : i === 6 ? { ...step, status: 'active' } : step));
      setTransaction(prev => ({ ...prev, status: 'confirmed', hash: txHash }));
      
      addEvent('success', 'Arc Testnet', `Transaction confirmed — TxHash: ${txHash}`);
      
      timerRef.current = setTimeout(() => setState('fulfilled'), delay);
    }
    else if (state === 'fulfilled') {
      setBuyerAgent(prev => ({ ...prev, status: 'idle', currentAction: 'Access Granted' }));
      setTimeline(prev => prev.map(step => ({ ...step, status: 'complete' })));
      setServices(prev => prev.map(s => s.id === 'svc-prime-scan' ? { ...s, status: 'unlocked' } : s));
      
      addEvent('seller', 'Prime Market Scan', 'Access granted — endpoint unlocked');
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, addEvent]);

  return {
    state,
    buyerAgent,
    services,
    events,
    timeline,
    policyChecks,
    transaction,
    runDemo,
    resetDemo
  };
}
