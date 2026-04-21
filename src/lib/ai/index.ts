// ============================================================
// AI Provider — Unified Interface
// ============================================================
// Auto-selects the first configured AI provider.
// Falls back to mock reasoning if none configured.
// ============================================================

import type { AIProvider, AIReasoningResult } from '@/types';
import * as gemini from './providers/gemini';
import * as featherless from './providers/featherless';
import * as aimlapi from './providers/aimlapi';

const providers = [
  { name: 'gemini' as AIProvider, module: gemini },
  { name: 'featherless' as AIProvider, module: featherless },
  { name: 'aimlapi' as AIProvider, module: aimlapi },
];

export function getActiveProvider(): AIProvider {
  for (const p of providers) {
    if (p.module.isConfigured()) return p.name;
  }
  return 'mock';
}

export function isAnyProviderConfigured(): boolean {
  return providers.some((p) => p.module.isConfigured());
}

export async function reason(prompt: string): Promise<AIReasoningResult> {
  for (const p of providers) {
    if (p.module.isConfigured()) {
      return p.module.reason(prompt);
    }
  }

  // Mock fallback
  return {
    provider: 'mock',
    reasoning:
      'Agent analysis: Service endpoint verified, pricing within acceptable range, ' +
      'settlement path validated on Arc Testnet. Recommend proceeding with policy-controlled execution.',
    confidence: 0.92,
    recommendation: 'Proceed with acquisition under current spend policy constraints.',
    timestamp: new Date().toISOString(),
  };
}
