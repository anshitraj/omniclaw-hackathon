import type { AIProvider, AIReasoningResult } from '@/types';
import * as featherless from './featherless';

export function getActiveProvider(): AIProvider {
  if (featherless.isConfigured()) {
    return 'featherless';
  }
  return 'mock';
}

export function isAnyProviderConfigured(): boolean {
  return featherless.isConfigured();
}

export async function reason(prompt: string): Promise<AIReasoningResult> {
  if (featherless.isConfigured()) {
    return featherless.reason(prompt);
  }

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
