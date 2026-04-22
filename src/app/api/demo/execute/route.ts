import { NextResponse } from 'next/server';
import { DEMO_SERVICES, generateDemoReceipt, generateDemoEvents } from '@/lib/demo/data';
import {
  evaluateLiveArchitecture,
  getCircleActorConfig,
  isCircleConfigured,
  isEntitySecretConfigured,
} from '@/lib/integrations/circle/client';
import { getWalletSummaryForActor } from '@/lib/integrations/circle/wallet-utils';
import { executePaymentByRail, resolvePaymentRuntimeContext, getActivePaymentRail } from '@/lib/payments/router';

export async function POST(req: Request) {
  const body = await req.json();
  const { serviceId } = body;

  const service = DEMO_SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json(
      { success: false, error: 'Service not found', timestamp: new Date().toISOString() },
      { status: 404 }
    );
  }

  const architecture = evaluateLiveArchitecture();
  const buyerCfg = getCircleActorConfig('buyer');
  const sellerCfg = getCircleActorConfig('seller');

  const events = generateDemoEvents(service);
  const liveMode =
    isCircleConfigured() &&
    isEntitySecretConfigured() &&
    architecture.buyerConfigured &&
    architecture.sellerConfigured;

  const runtime = resolvePaymentRuntimeContext({
    liveMode,
    architectureValid: architecture.liveArchitectureValid,
  });

  const activeRail = getActivePaymentRail(runtime);

  const architectureWarning = !architecture.liveArchitectureValid
    ? 'Buyer and seller currently resolve to the same wallet. Live architecture is invalid for real commerce.'
    : undefined;

  if (activeRail !== 'demo') {
    try {
      const settlement = await executePaymentByRail(
        {
          serviceId: service.id,
          serviceTitle: service.title,
          serviceEndpoint: service.endpoint,
          amount: service.price,
          currency: service.currency,
        },
        runtime
      );

      const explorerHash = settlement.isPending ? null : settlement.txHash;
      const buyerSummary = await getWalletSummaryForActor('buyer');
      const gatewayBalanceSource = buyerSummary.gatewayBalanceSource || settlement.gatewayBalanceSource;
      const isLegacyDirect = settlement.rail === 'direct';

      const receipt = {
        id: `rcpt_${Date.now()}`,
        txHash: settlement.txHash,
        serviceId: service.id,
        serviceTitle: service.title,
        recipientEndpoint: service.endpoint,
        amount: service.price,
        currency: service.currency,
        network: 'Arc Testnet',
        route: isLegacyDirect ? 'Legacy Direct Mode' : 'Circle Gateway Nanopayment Rail',
        status: settlement.isPending ? 'pending' : 'confirmed',
        proofLink: explorerHash ? `https://testnet.arcscan.app/tx/${explorerHash}` : null,
        arcScanUrl: explorerHash ? `https://testnet.arcscan.app/tx/${explorerHash}` : null,
        isDemoTx: false,
        timestamp: new Date().toISOString(),
        policyDecisionSummary: 'All policy checks passed. Buyer agent authorized under OmniClaw FPE v1.0.',
        settlementMetadata: {
          paymentRail: isLegacyDirect ? 'Legacy Direct Mode' : 'Circle Gateway',
          gatewayBalanceSource,
          buyerFundingSource: settlement.buyerFundingSource,
          sellerSettlementDestination: settlement.sellerSettlementDestination,
          settlementLayer: 'Arc',
          valueLayer: 'USDC',
          sellerSettlementMode: settlement.sellerSettlementMode,
          legacyDirectTransfer: String(settlement.legacyDirectTransfer),
          blockNumber: settlement.blockNumber,
          gasUsed: settlement.gasUsed,
          confirmations: settlement.isPending ? 'pending' : '1',
          buyerWalletAddress: buyerCfg.walletAddress || '',
          sellerWalletAddress: sellerCfg.walletAddress || '',
          token: service.currency,
          direction: 'buyer_to_seller',
        },
        blockNumber: settlement.blockNumber,
        gasUsed: settlement.gasUsed,
        fromAddress: buyerCfg.walletAddress,
        toAddress: sellerCfg.walletAddress,
        senderLabel: 'Buyer Gateway Balance',
        recipientLabel: 'Seller Gateway Balance',
        direction: 'sent',
        liveArchitectureValid: true,
      };

      return NextResponse.json({
        success: true,
        data: {
          receipt,
          events,
          finalState: 'fulfilled',
          mode: settlement.rail === 'gateway' ? 'gateway' : 'legacy_direct',
          activePaymentRail: settlement.rail,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[execute] Live settlement failed, falling back to demo:', err);
    }
  }

  const fallback = generateDemoReceipt(service);
  const receipt = {
    ...fallback,
    route: 'Circle Gateway Nanopayment Rail (Demo Fallback)',
    settlementMetadata: {
      ...fallback.settlementMetadata,
      paymentRail: 'Circle Gateway',
      gatewayBalanceSource: 'Demo',
      buyerFundingSource: 'Demo Gateway Nanopayment Balance',
      sellerSettlementDestination: 'Demo Seller Gateway Settlement Route',
      settlementLayer: 'Arc',
      valueLayer: 'USDC',
      sellerSettlementMode: 'Gateway Batch Settlement',
      legacyDirectTransfer: 'false',
    },
    fromAddress: buyerCfg.walletAddress || fallback.fromAddress,
    toAddress: sellerCfg.walletAddress || fallback.toAddress,
    senderLabel: 'Buyer Gateway Balance',
    recipientLabel: 'Seller Gateway Balance',
    direction: 'sent' as const,
    liveArchitectureValid: architecture.liveArchitectureValid,
    architectureWarning,
  };

  return NextResponse.json({
    success: true,
    data: {
      receipt,
      events,
      finalState: 'fulfilled',
      mode: activeRail === 'direct' ? 'legacy_direct_fallback' : 'demo',
      activePaymentRail: activeRail,
      warning: architectureWarning,
    },
    timestamp: new Date().toISOString(),
  });
}
