import crypto from 'crypto';
import type { LiveArchitectureHealth, WalletActor } from '@/types';

export const CIRCLE_BASE_URL = 'https://api.circle.com';
const DEFAULT_BLOCKCHAIN = 'ARC-TESTNET';

export interface CircleActorConfig {
  actor: WalletActor;
  apiKey?: string;
  entitySecret?: string;
  walletSetId?: string;
  walletId?: string;
  walletAddress?: string;
  blockchain: string;
  legacyMode: boolean;
}

export interface CircleWalletInfo {
  id: string;
  state: string;
  walletSetId: string;
  custodyType: string;
  address: string;
  blockchain: string;
  accountType: string;
  updateDate: string;
  createDate: string;
  name?: string;
}

export interface CircleBalanceInfo {
  token: {
    id: string;
    name: string;
    symbol: string;
    blockchain: string;
    decimals: number;
    tokenAddress?: string;
  };
  amount: string;
  updateDate: string;
}

export function getCircleActorConfig(actor: WalletActor): CircleActorConfig {
  const upper = actor.toUpperCase();
  const apiKey = process.env[`CIRCLE_${upper}_API_KEY`] || process.env.CIRCLE_API_KEY;
  const entitySecret = process.env[`CIRCLE_${upper}_ENTITY_SECRET`] || process.env.CIRCLE_ENTITY_SECRET;

  const walletSetId = process.env[`CIRCLE_${upper}_WALLET_SET_ID`] || process.env.CIRCLE_WALLET_SET_ID;
  const walletId = process.env[`CIRCLE_${upper}_WALLET_ID`] || process.env.CIRCLE_WALLET_ID;
  const walletAddress = process.env[`CIRCLE_${upper}_WALLET_ADDRESS`] || process.env.CIRCLE_WALLET_ADDRESS;

  const blockchain =
    process.env[`CIRCLE_${upper}_WALLET_BLOCKCHAIN`] ||
    process.env.CIRCLE_WALLET_BLOCKCHAIN ||
    DEFAULT_BLOCKCHAIN;

  const hasActorSpecific = Boolean(
    process.env[`CIRCLE_${upper}_API_KEY`] ||
      process.env[`CIRCLE_${upper}_WALLET_ID`] ||
      process.env[`CIRCLE_${upper}_WALLET_ADDRESS`]
  );

  return {
    actor,
    apiKey,
    entitySecret,
    walletSetId,
    walletId,
    walletAddress,
    blockchain,
    legacyMode: !hasActorSpecific,
  };
}

export function isCircleConfiguredForActor(actor: WalletActor): boolean {
  const cfg = getCircleActorConfig(actor);
  return Boolean(cfg.apiKey && !cfg.apiKey.includes('your_'));
}

export function isEntitySecretConfiguredForActor(actor: WalletActor): boolean {
  const cfg = getCircleActorConfig(actor);
  return Boolean(cfg.entitySecret && cfg.entitySecret.length === 64);
}

export function authHeadersForActor(actor: WalletActor): Record<string, string> {
  const cfg = getCircleActorConfig(actor);
  return {
    Authorization: `Bearer ${cfg.apiKey || ''}`,
    'Content-Type': 'application/json',
  };
}

let cachedEntityPublicKeys: Partial<Record<WalletActor, string>> = {};

async function fetchEntityPublicKey(actor: WalletActor): Promise<string> {
  const res = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/config/entity/publicKey`, {
    headers: authHeadersForActor(actor),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Circle fetchEntityPublicKey failed (${res.status}): ${await res.text()}`);
  }

  const json = await res.json();
  const key = json.data?.publicKey;
  if (!key) {
    throw new Error('Circle public key response missing data.publicKey');
  }
  return key;
}

export async function encryptEntitySecretForActor(actor: WalletActor): Promise<string> {
  const cfg = getCircleActorConfig(actor);
  if (!cfg.entitySecret) {
    throw new Error(`CIRCLE_${actor.toUpperCase()}_ENTITY_SECRET is missing`);
  }

  if (!cachedEntityPublicKeys[actor]) {
    cachedEntityPublicKeys[actor] = await fetchEntityPublicKey(actor);
  }

  let pem = (cachedEntityPublicKeys[actor] || '').trim();
  if (!pem.includes('BEGIN')) {
    pem = `-----BEGIN PUBLIC KEY-----\n${pem.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
  }

  const encrypted = crypto.publicEncrypt(
    {
      key: pem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(cfg.entitySecret, 'hex')
  );

  return encrypted.toString('base64');
}

export async function circleGet(actor: WalletActor, path: string): Promise<any> {
  const res = await fetch(`${CIRCLE_BASE_URL}${path}`, {
    headers: authHeadersForActor(actor),
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Circle GET ${path} failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export async function circlePost(actor: WalletActor, path: string, body: Record<string, unknown>): Promise<any> {
  const entitySecretCiphertext = await encryptEntitySecretForActor(actor);
  const payload = JSON.stringify({ ...body, entitySecretCiphertext });

  const res = await fetch(`${CIRCLE_BASE_URL}${path}`, {
    method: 'POST',
    headers: authHeadersForActor(actor),
    body: payload,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Circle POST ${path} failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export async function listWalletsForActor(actor: WalletActor): Promise<CircleWalletInfo[]> {
  if (!isCircleConfiguredForActor(actor)) return [];

  const cfg = getCircleActorConfig(actor);
  const params = new URLSearchParams();
  if (cfg.walletSetId) params.set('walletSetId', cfg.walletSetId);
  if (cfg.blockchain) params.set('blockchain', cfg.blockchain);
  params.set('pageSize', '50');

  const query = params.toString() ? `?${params.toString()}` : '';
  const json = await circleGet(actor, `/v1/w3s/wallets${query}`);
  return json.data?.wallets || [];
}

export async function getWalletByIdForActor(actor: WalletActor): Promise<CircleWalletInfo | null> {
  const cfg = getCircleActorConfig(actor);
  const wallets = await listWalletsForActor(actor);
  if (cfg.walletId) {
    const byId = wallets.find((w) => w.id === cfg.walletId);
    if (byId) return byId;
  }
  if (cfg.walletAddress) {
    const byAddress = wallets.find((w) => w.address.toLowerCase() === cfg.walletAddress?.toLowerCase());
    if (byAddress) return byAddress;
  }
  return wallets[0] || null;
}

export async function getWalletBalancesForActor(actor: WalletActor, walletId?: string): Promise<CircleBalanceInfo[]> {
  if (!isCircleConfiguredForActor(actor)) return [];

  const targetId = walletId || getCircleActorConfig(actor).walletId || (await getWalletByIdForActor(actor))?.id;
  if (!targetId) return [];

  const json = await circleGet(actor, `/v1/w3s/wallets/${targetId}/balances`);
  return json.data?.tokenBalances || [];
}

export function evaluateLiveArchitecture(): LiveArchitectureHealth {
  const buyer = getCircleActorConfig('buyer');
  const seller = getCircleActorConfig('seller');

  const buyerConfigured = Boolean(buyer.apiKey && buyer.walletId && buyer.walletAddress);
  const sellerConfigured = Boolean(seller.apiKey && seller.walletId && seller.walletAddress);

  const sameWalletId = Boolean(
    buyer.walletId && seller.walletId && buyer.walletId.toLowerCase() === seller.walletId.toLowerCase()
  );
  const sameAddress = Boolean(
    buyer.walletAddress &&
      seller.walletAddress &&
      buyer.walletAddress.toLowerCase() === seller.walletAddress.toLowerCase()
  );

  const buyerSellerDistinct = !sameWalletId && !sameAddress;

  const warnings: string[] = [];
  if (!buyerConfigured) warnings.push('Buyer wallet is not fully configured.');
  if (!sellerConfigured) warnings.push('Seller wallet is not fully configured.');
  if (!buyerSellerDistinct && buyerConfigured && sellerConfigured) {
    warnings.push('Buyer and seller currently resolve to the same wallet. Live architecture is invalid for real commerce.');
  }

  return {
    buyerConfigured,
    sellerConfigured,
    buyerWalletAddress: buyer.walletAddress || null,
    sellerWalletAddress: seller.walletAddress || null,
    buyerWalletId: buyer.walletId || null,
    sellerWalletId: seller.walletId || null,
    buyerSellerDistinct,
    liveArchitectureValid: buyerConfigured && sellerConfigured && buyerSellerDistinct,
    warnings,
  };
}

export async function createTransferFromBuyerToSeller(params: {
  amount: number;
  tokenAddress: string;
  blockchain?: string;
  idempotencyKey: string;
}): Promise<any> {
  const buyer = getCircleActorConfig('buyer');
  const seller = getCircleActorConfig('seller');

  if (!buyer.walletAddress || !seller.walletAddress) {
    throw new Error('Buyer and seller wallet addresses are required for live transfer.');
  }

  const transferBody = {
    idempotencyKey: params.idempotencyKey,
    walletAddress: buyer.walletAddress,
    blockchain: params.blockchain || buyer.blockchain,
    destinationAddress: seller.walletAddress,
    amounts: [params.amount.toString()],
    tokenAddress: params.tokenAddress,
    feeLevel: 'MEDIUM',
  };

  return circlePost('buyer', '/v1/w3s/developer/transactions/transfer', transferBody);
}

