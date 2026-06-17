import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatUSDC(amount: number): string {
  if (!Number.isFinite(amount)) {
    return '0.00 USDC';
  }
  const abs = Math.abs(amount);
  if (abs > 0 && abs < 0.01) {
    const precise = amount.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    return `${precise} USDC`;
  }
  return `${amount.toFixed(2)} USDC`;
}

export function truncateHash(hash: string, chars: number = 8): string {
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`;
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateIdempotencyKey(): string {
  return `oc_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
