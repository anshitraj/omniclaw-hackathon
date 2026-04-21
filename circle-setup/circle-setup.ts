/**
 * circle-setup.ts
 *
 * Registers your entity secret with Circle (one-time), creates a wallet set
 * and an ARC-TESTNET wallet, then updates .env.local in the parent project.
 *
 * Usage (from circle-setup/ folder):
 *   npm install
 *   node --env-file=../.env.local --import=tsx circle-setup.ts
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  registerEntitySecretCiphertext,
  initiateDeveloperControlledWalletsClient,
} from '@circle-fin/developer-controlled-wallets';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'output');
const ENV_FILE = path.join(__dirname, '..', '.env.local');

async function main() {
  const apiKey = process.env.CIRCLE_API_KEY;
  if (!apiKey) {
    throw new Error('CIRCLE_API_KEY not set. Load .env.local: node --env-file=../.env.local --import=tsx circle-setup.ts');
  }

  // Use existing entity secret from .env.local, or generate a new one
  const existingSecret = process.env.CIRCLE_ENTITY_SECRET;
  const entitySecret = existingSecret && existingSecret.length === 64
    ? existingSecret
    : crypto.randomBytes(32).toString('hex');

  if (!existingSecret || existingSecret.length !== 64) {
    console.log('\n⚠  No valid CIRCLE_ENTITY_SECRET found — generated a new one.');
    console.log('   Adding to .env.local…');
    // Append or update in .env.local
    let env = fs.readFileSync(ENV_FILE, 'utf-8');
    if (env.includes('CIRCLE_ENTITY_SECRET=')) {
      env = env.replace(/CIRCLE_ENTITY_SECRET=.*/, `CIRCLE_ENTITY_SECRET=${entitySecret}`);
    } else {
      env += `\nCIRCLE_ENTITY_SECRET=${entitySecret}\n`;
    }
    fs.writeFileSync(ENV_FILE, env, 'utf-8');
    console.log('   ✓ Saved to .env.local');
  } else {
    console.log(`\n✓ Using existing CIRCLE_ENTITY_SECRET: ${entitySecret.slice(0, 8)}…`);
  }

  // Step 1: Register entity secret ciphertext with Circle
  console.log('\n[1/3] Registering entity secret with Circle…');
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await registerEntitySecretCiphertext({
    apiKey,
    entitySecret,
    recoveryFileDownloadPath: OUTPUT_DIR,
  });

  console.log('✓ Entity secret registered! Recovery file saved to ./output/');

  // Step 2: Create wallet set
  console.log('\n[2/3] Creating wallet set…');
  const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });

  const walletSet = (await client.createWalletSet({ name: 'OmniClaw Agent Wallets' })).data?.walletSet;
  if (!walletSet?.id) throw new Error('Wallet set creation failed');
  console.log(`✓ Wallet Set ID: ${walletSet.id}`);

  // Step 3: Create wallet on ARC-TESTNET
  console.log('\n[3/3] Creating wallet on ARC-TESTNET…');
  const wallet = (
    await client.createWallets({
      walletSetId: walletSet.id,
      // SDK typings can lag new testnets; keep runtime value as ARC-TESTNET.
      blockchains: ['ARC-TESTNET' as unknown as Parameters<typeof client.createWallets>[0]['blockchains'][number]],
      count: 1,
      accountType: 'EOA',
    })
  ).data?.wallets?.[0];

  if (!wallet) throw new Error('Wallet creation failed');

  console.log(`✓ Wallet ID:   ${wallet.id}`);
  console.log(`✓ Address:     ${wallet.address}`);
  console.log(`✓ Blockchain:  ${wallet.blockchain}`);

  // Save wallet info to output/
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'wallet-info.json'),
    JSON.stringify(wallet, null, 2),
    'utf-8'
  );

  // Update .env.local with wallet details
  let env = fs.readFileSync(ENV_FILE, 'utf-8');
  const updates: Record<string, string> = {
    CIRCLE_WALLET_ID: wallet.id,
    CIRCLE_WALLET_ADDRESS: wallet.address ?? '',
    CIRCLE_WALLET_BLOCKCHAIN: wallet.blockchain,
    CIRCLE_WALLET_SET_ID: walletSet.id,
  };
  for (const [key, value] of Object.entries(updates)) {
    if (env.includes(`${key}=`)) {
      env = env.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
    } else {
      env += `\n${key}=${value}\n`;
    }
  }
  fs.writeFileSync(ENV_FILE, env, 'utf-8');

  console.log('\n✅  Setup complete!');
  console.log('   Wallet details saved to circle-setup/output/wallet-info.json');
  console.log('   .env.local updated with CIRCLE_WALLET_ID and address');
  console.log('\n💡 Next: fund your wallet at https://faucet.circle.com');
  console.log(`   Select "Arc Testnet" and paste: ${wallet.address}`);
  console.log('\n   Then restart the dev server (npm run dev) to see your wallet in the console.');
}

main().catch((err) => {
  console.error('\n❌ Setup failed:', err.message || err);
  process.exit(1);
});
