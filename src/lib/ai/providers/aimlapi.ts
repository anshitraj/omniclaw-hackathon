// ============================================================
// AI Provider — AI/ML API Adapter
// ============================================================
// Uses AI/ML API for buyer agent reasoning.
// Requires AIMLAPI_API_KEY environment variable.
// ============================================================

import type { AIReasoningResult } from '@/types';

const AIMLAPI_API_KEY = process.env.AIMLAPI_API_KEY;
const AIMLAPI_URL = process.env.AIMLAPI_URL || 'https://api.aimlapi.com/v1/chat/completions';

export function isConfigured(): boolean {
  return !!AIMLAPI_API_KEY;
}

export async function reason(prompt: string): Promise<AIReasoningResult> {
  if (!AIMLAPI_API_KEY) {
    throw new Error('AIMLAPI_API_KEY not configured');
  }

  const res = await fetch(AIMLAPI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AIMLAPI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
    }),
  });

  if (!res.ok) throw new Error(`AIMLAPI failed: ${res.status}`);
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || 'No response';

  return {
    provider: 'aimlapi',
    reasoning: text,
    confidence: 0.82,
    recommendation: text.slice(0, 200),
    timestamp: new Date().toISOString(),
  };
}
