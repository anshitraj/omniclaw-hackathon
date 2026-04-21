// ============================================================
// AI Provider — Gemini Adapter
// ============================================================
// Uses Google's Gemini API for buyer agent reasoning.
// Requires GEMINI_API_KEY environment variable.
// ============================================================

import type { AIReasoningResult } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export function isConfigured(): boolean {
  return !!GEMINI_API_KEY;
}

export async function reason(prompt: string): Promise<AIReasoningResult> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) throw new Error(`Gemini API failed: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';

  return {
    provider: 'gemini',
    reasoning: text,
    confidence: 0.85,
    recommendation: text.slice(0, 200),
    timestamp: new Date().toISOString(),
  };
}
