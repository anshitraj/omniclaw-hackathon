import type { AIProvider, AIReasoningResult } from '@/types';
import * as featherless from './featherless';

export function getActiveProvider(): AIProvider {
  return 'featherless';
}

export function isAnyProviderConfigured(): boolean {
  return featherless.isConfigured();
}

export async function reason(prompt: string): Promise<AIReasoningResult> {
  return featherless.reason(prompt);
}
