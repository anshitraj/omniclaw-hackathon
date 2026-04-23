import crypto from 'crypto';
import type { WalletStatus } from '@/types';
import {
  CIRCLE_BASE_URL,
  authHeadersForActor,
  circlePost,
  evaluateLiveArchitecture,
  getCircleActorConfig,
  getWalletBalancesForActor,
  isCircleConfiguredForActor,
  isEntitySecretConfiguredForActor,
  listWalletsForActor,
  createTransferFromBuyerToSeller,
  encryptEntitySecretForActor,
  type CircleWalletInfo,
  type CircleBalanceInfo,
} from './base-client';
import { getWalletSummaryForActor } from './wallet-utils';
import { getBuyerWalletHistory } from './buyer-client';

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || process.env.CIRCLE_BUYER_API_KEY || process.env.CIRCLE_SELLER_API_KEY;
const CIRCLE_ENTITY_SECRET =
  process.env.CIRCLE_ENTITY_SECRET || process.env.CIRCLE_BUYER_ENTITY_SECRET || process.env.CIRCLE_SELLER_ENTITY_SECRET;

export { CIRCLE_BASE_URL };

export function isCircleConfigured(): boolean {
  return Boolean(CIRCLE_API_KEY && !CIRCLE_API_KEY.includes('your_'));
}

export function isEntitySecretConfigured(): boolean {
  return Boolean(CIRCLE_ENTITY_SECRET && CIRCLE_ENTITY_SECRET.length === 64);
}

export function authHeaders(): Record<string, string> {
  return authHeadersForActor('buyer');
}

export async function encryptEntitySecret(): Promise<string> {
  return encryptEntitySecretForActor('buyer');
}

export async function withEntityCiphertext(body: Record<string, unknown>): Promise<string> {
  const ciphertext = await encryptEntitySecret();
  return JSON.stringify({ ...body, entitySecretCiphertext: ciphertext });
}

export interface WalletSetInfo {
  id: string;
  custodyType: string;
  name?: string;
  updateDate: string;
  createDate: string;
}

export async function getEntityConfig(): Promise<Record<string, unknown>> {
  const res = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/config/entity`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Circle getEntityConfig failed (${res.status}): ${await res.text()}`);
  }
  const json = await res.json();
  return json.data || json;
}

export async function listWalletSets(): Promise<WalletSetInfo[]> {
  if (!isCircleConfigured()) return [];

  const res = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/developer/walletSets`, {
    headers: authHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Circle listWalletSets failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  return json.data?.walletSets || [];
}

export async function createWalletSet(name: string): Promise<WalletSetInfo> {
  const json = await circlePost('buyer', '/v1/w3s/developer/walletSets', {
    idempotencyKey: `oc_ws_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    name,
  });

  return json.data?.walletSet;
}

export type { CircleWalletInfo, CircleBalanceInfo };

export async function listWallets(opts?: {
  walletSetId?: string;
  blockchain?: string;
  pageSize?: number;
}): Promise<CircleWalletInfo[]> {
  if (!isCircleConfigured()) return [];

  const wallets = await listWalletsForActor('buyer');
  return wallets
    .filter((w) => (opts?.walletSetId ? w.walletSetId === opts.walletSetId : true))
    .filter((w) => (opts?.blockchain ? w.blockchain === opts.blockchain : true))
    .slice(0, opts?.pageSize || wallets.length);
}

export async function createWallet(
  walletSetId: string,
  blockchains: string[] = ['ARC-TESTNET'],
  count = 1
): Promise<CircleWalletInfo[]> {
  const json = await circlePost('buyer', '/v1/w3s/developer/wallets', {
    idempotencyKey: `oc_w_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    walletSetId,
    blockchains,
    count,
  });

  return json.data?.wallets || [];
}

export async function getWalletBalances(walletId: string): Promise<CircleBalanceInfo[]> {
  return getWalletBalancesForActor('buyer', walletId);
}

export async function getWalletStatus(walletId?: string): Promise<WalletStatus> {
  if (!isCircleConfigured()) {
    const { SEED_WALLET } = await import('@/lib/seed/data');
    return { ...SEED_WALLET, id: walletId || SEED_WALLET.id };
  }

  const summary = await getWalletSummaryForActor('buyer');

  return {
    id: walletId || summary.walletId || 'none',
    type: 'circle_programmable',
    address: summary.address || '0x...',
    network: summary.blockchain,
    balance: summary.usdcBalance,
    currency: 'USDC',
    state: summary.status === 'LIVE' ? 'ready' : summary.connected ? 'pending' : 'error',
    configured: summary.configured,
    noRawKeyExposure: true,
  };
}

export interface CircleConnectionSummary {
  connected: boolean;
  entitySecretConfigured: boolean;
  entityRegistered: boolean;
  walletSetsCount: number;
  walletsCount: number;
  firstWallet: CircleWalletInfo | null;
  setupRequired: boolean;
  setupStep?: string;
  error?: string;
}

export async function getCircleConnectionSummary(): Promise<CircleConnectionSummary> {
  const buyerConfigured = isCircleConfiguredForActor('buyer');
  if (!buyerConfigured) {
    return {
      connected: false,
      entitySecretConfigured: false,
      entityRegistered: false,
      walletSetsCount: 0,
      walletsCount: 0,
      firstWallet: null,
      setupRequired: true,
      setupStep: 'Set CIRCLE_BUYER_API_KEY (or legacy CIRCLE_API_KEY) in .env.local',
    };
  }

  const entitySecretConfigured = isEntitySecretConfiguredForActor('buyer');
  let entityRegistered = false;
  let walletSetsCount = 0;
  let walletsCount = 0;
  let firstWallet: CircleWalletInfo | null = null;
  const errors: string[] = [];

  try {
    await getEntityConfig();
    entityRegistered = true;
  } catch (error) {
    errors.push(String(error));
  }

  try {
    const sets = await listWalletSets();
    walletSetsCount = sets.length;
  } catch (error) {
    errors.push(String(error));
  }

  try {
    const wallets = await listWalletsForActor('buyer');
    walletsCount = wallets.length;
    firstWallet = wallets[0] || null;
  } catch (error) {
    errors.push(String(error));
  }

  return {
    connected: entityRegistered,
    entitySecretConfigured,
    entityRegistered,
    walletSetsCount,
    walletsCount,
    firstWallet,
    setupRequired: !entitySecretConfigured || !entityRegistered,
    setupStep: !entitySecretConfigured
      ? 'Generate and set CIRCLE_BUYER_ENTITY_SECRET (or CIRCLE_ENTITY_SECRET).'
      : !entityRegistered
        ? 'Register entity secret ciphertext in Circle Developer Console.'
        : undefined,
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}

export async function getBuyerHistory(limit = 20) {
  return getBuyerWalletHistory(limit);
}

export { evaluateLiveArchitecture, getCircleActorConfig, createTransferFromBuyerToSeller };
