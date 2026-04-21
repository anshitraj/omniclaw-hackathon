/**
 * create-wallet-only.ts
 *
 * Entity secret is already registered (409 means registered = OK).
 * This script just creates the wallet set + wallet using the existing entity secret.
 *
 * Usage:
 *   node --env-file=../.env.local --import=tsx create-wallet-only.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'output');
const ENV_FILE = path.join(__dirname, '..', '.env.local');

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

  if (!apiKey) throw new Error('CIRCLE_API_KEY not set.');
  if (!entitySecret || entitySecret.length !== 64) throw new Error('CIRCLE_ENTITY_SECRET not set or invalid.');

  console.log(`\n✓ API Key: ${apiKey.slice(0, 20)}…`);
  console.log(`✓ Entity Secret: ${entitySecret.slice(0, 8)}… (already registered)`);

  const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });

  // Check for existing wallet sets first
  console.log('\n[1/2] Checking existing wallet sets…');
  let walletSetId: string;
  try {
    const existingSets = (await client.listWalletSets({})).data?.walletSets ?? [];
    if (existingSets.length > 0) {
      walletSetId = existingSets[0].id;
      console.log(`✓ Using existing wallet set: ${walletSetId}`);
    } else {
      console.log('   No wallet sets found — creating one…');
      const ws = (await client.createWalletSet({ name: 'OmniClaw Agent Wallets' })).data?.walletSet;
      if (!ws?.id) throw new Error('Wallet set creation failed');
      walletSetId = ws.id;
      console.log(`✓ Created wallet set: ${walletSetId}`);
    }
  } catch (err) {
    const msg = String(err);
    // 409 on createWalletSet just means it already exists — safe to ignore
    if (msg.includes('409')) {
      console.log('   Wallet set already exists (409). Fetching…');
      const existingSets = (await client.listWalletSets({})).data?.walletSets ?? [];
      if (!existingSets.length) throw new Error('Cannot fetch wallet sets after 409');
      walletSetId = existingSets[0].id;
      console.log(`✓ Using wallet set: ${walletSetId}`);
    } else {
      throw err;
    }
  }

  // Check for existing wallets in the set
  console.log('\n[2/2] Checking for existing wallets…');
  const existingWallets = (await client.listWallets({ walletSetId })).data?.wallets ?? [];
  let wallet: NonNullable<(typeof existingWallets)[0]>;

  if (existingWallets.length > 0) {
    wallet = existingWallets[0];
    console.log(`✓ Using existing wallet: ${wallet.id}`);
  } else {
    console.log('   No wallets found — creating one on ARC-TESTNET…');
    const created = (
      await client.createWallets({
        walletSetId,
        // SDK typings can lag new testnets; keep runtime value as ARC-TESTNET.
        blockchains: ['ARC-TESTNET' as unknown as Parameters<typeof client.createWallets>[0]['blockchains'][number]],
        count: 1,
        accountType: 'EOA',
      })
    ).data?.wallets?.[0];
    if (!created) throw new Error('Wallet creation failed: no wallet returned');
    wallet = created;
    console.log(`✓ Created wallet: ${wallet.id}`);
  }

  console.log(`\n✅ Wallet ready!`);
  console.log(`   ID:         ${wallet.id}`);
  console.log(`   Address:    ${wallet.address}`);
  console.log(`   Blockchain: ${wallet.blockchain}`);
  console.log(`   State:      ${wallet.state}`);

  // Save output
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'wallet-info.json'),
    JSON.stringify(wallet, null, 2),
    'utf-8'
  );

  // Update .env.local
  let env = fs.readFileSync(ENV_FILE, 'utf-8');
  const updates: Record<string, string> = {
    CIRCLE_WALLET_ID: wallet.id,
    CIRCLE_WALLET_ADDRESS: wallet.address ?? '',
    CIRCLE_WALLET_BLOCKCHAIN: wallet.blockchain,
    CIRCLE_WALLET_SET_ID: walletSetId,
  };
  for (const [key, value] of Object.entries(updates)) {
    if (env.includes(`${key}=`)) {
      env = env.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
    } else {
      env += `\n${key}=${value}\n`;
    }
  }
  fs.writeFileSync(ENV_FILE, env, 'utf-8');
  console.log('\n   .env.local updated with wallet credentials.');
  console.log('\n💡 Fund your wallet at https://faucet.circle.com');
  console.log(`   Select "Arc Testnet" → paste: ${wallet.address}`);
  console.log('\n   Restart dev server after funding to see live balances.');
}

main().catch((err) => {
  console.error('\n❌ Failed:', err.message || err);
  process.exit(1);
});
