import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_FILE = path.resolve(__dirname, '..', '.env.local');

function parseEnv(text: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i <= 0) continue;
    map.set(line.slice(0, i).trim(), line.slice(i + 1).trim());
  }
  return map;
}

function upsertEnv(text: string, key: string, value: string): string {
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(text)) return text.replace(re, `${key}=${value}`);
  return `${text.trimEnd()}\n${key}=${value}\n`;
}

async function main() {
  if (!fs.existsSync(ENV_FILE)) throw new Error('.env.local not found');
  let envText = fs.readFileSync(ENV_FILE, 'utf-8');
  const env = parseEnv(envText);

  const apiKey = process.env.CIRCLE_API_KEY || env.get('CIRCLE_API_KEY');
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET || env.get('CIRCLE_ENTITY_SECRET');
  if (!apiKey) throw new Error('Missing CIRCLE_API_KEY');
  if (!entitySecret || entitySecret.length !== 64) throw new Error('Missing/invalid CIRCLE_ENTITY_SECRET');

  const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });

  const sets = (await client.listWalletSets({})).data?.walletSets ?? [];
  let walletSetId = env.get('CIRCLE_WALLET_SET_ID') || env.get('CIRCLE_BUYER_WALLET_SET_ID') || sets[0]?.id;
  if (!walletSetId) {
    const ws = (await client.createWalletSet({ name: 'OmniClaw Agent Wallets' })).data?.walletSet;
    if (!ws?.id) throw new Error('Failed to create wallet set');
    walletSetId = ws.id;
  }

  let wallets = (await client.listWallets({ walletSetId })).data?.wallets ?? [];
  const arcWallets = wallets.filter((w) => String(w.blockchain).toUpperCase() === 'ARC-TESTNET');

  if (arcWallets.length < 2) {
    const needed = 2 - arcWallets.length;
    const created = (await client.createWallets({
      walletSetId,
      blockchains: Array.from({ length: needed }, () => 'ARC-TESTNET' as unknown as Parameters<typeof client.createWallets>[0]['blockchains'][number]),
      count: needed,
      accountType: 'EOA',
    })).data?.wallets ?? [];
    wallets = wallets.concat(created);
  }

  const allArc = wallets.filter((w) => String(w.blockchain).toUpperCase() === 'ARC-TESTNET');
  if (allArc.length < 2) throw new Error('Unable to ensure two ARC-TESTNET wallets');

  const legacyWalletId = env.get('CIRCLE_WALLET_ID');
  const legacyAddress = (env.get('CIRCLE_WALLET_ADDRESS') || '').toLowerCase();

  const buyer = allArc.find((w) => w.id === legacyWalletId || (w.address || '').toLowerCase() === legacyAddress) || allArc[0];
  const seller = allArc.find((w) => w.id !== buyer.id && (w.address || '').toLowerCase() !== (buyer.address || '').toLowerCase()) || allArc[1];

  if (!seller || seller.id === buyer.id || (seller.address || '').toLowerCase() === (buyer.address || '').toLowerCase()) {
    throw new Error('Failed to select distinct buyer/seller wallets');
  }

  const updates: Record<string, string> = {
    CIRCLE_BUYER_API_KEY: apiKey,
    CIRCLE_BUYER_ENTITY_SECRET: entitySecret,
    CIRCLE_BUYER_WALLET_SET_ID: walletSetId,
    CIRCLE_BUYER_WALLET_ID: buyer.id,
    CIRCLE_BUYER_WALLET_ADDRESS: buyer.address ?? '',
    CIRCLE_BUYER_WALLET_BLOCKCHAIN: String(buyer.blockchain),

    CIRCLE_SELLER_API_KEY: apiKey,
    CIRCLE_SELLER_ENTITY_SECRET: entitySecret,
    CIRCLE_SELLER_WALLET_SET_ID: walletSetId,
    CIRCLE_SELLER_WALLET_ID: seller.id,
    CIRCLE_SELLER_WALLET_ADDRESS: seller.address ?? '',
    CIRCLE_SELLER_WALLET_BLOCKCHAIN: String(seller.blockchain),
  };

  for (const [k, v] of Object.entries(updates)) {
    envText = upsertEnv(envText, k, v);
  }

  fs.writeFileSync(ENV_FILE, envText, 'utf-8');

  console.log(`Buyer wallet: ${buyer.id} ${buyer.address}`);
  console.log(`Seller wallet: ${seller.id} ${seller.address}`);
  console.log('Updated .env.local with split buyer/seller wallet configuration.');
}

main().catch((err) => {
  console.error('Split setup failed:', err?.message || err);
  process.exit(1);
});
