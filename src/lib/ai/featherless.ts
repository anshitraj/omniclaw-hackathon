import type { AIReasoningResult } from '@/types';

const FEATHERLESS_API_KEY = process.env.FEATHERLESS_API_KEY;
const FEATHERLESS_API_URL =
  process.env.FEATHERLESS_API_URL || 'https://api.featherless.ai/v1/chat/completions';

export function isConfigured(): boolean {
  return !!FEATHERLESS_API_KEY;
}

export async function reason(prompt: string): Promise<AIReasoningResult> {
  if (!FEATHERLESS_API_KEY) {
    throw new Error('FEATHERLESS_API_KEY not configured');
  }

  const res = await fetch(FEATHERLESS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FEATHERLESS_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    throw new Error(`Featherless API failed: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || 'No response';

  return {
    provider: 'featherless',
    reasoning: text,
    confidence: 0.8,
    recommendation: text.slice(0, 200),
    timestamp: new Date().toISOString(),
  };
}
