/**
 * setup-circle-wallet.mjs
 * 
 * Complete Circle Wallet setup:
 * 1. Generate a new entity secret
 * 2. Encrypt it with entity public key 
 * 3. Register it with Circle
 * 4. Create a wallet set
 * 5. Create a wallet
 * 6. Print all env vars to add to .env.local
 *
 * Usage: node --env-file=.env.local scripts/setup-circle-wallet.mjs
 */
import crypto from 'node:crypto';

const API_KEY = process.env.CIRCLE_API_KEY;
const BASE_URL = process.env.CIRCLE_API_URL || 'https://api.circle.com';

if (!API_KEY) throw new Error('CIRCLE_API_KEY is required in .env.local');

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

// Helper: encrypt entity secret with RSA-OAEP SHA-256
async function encryptEntitySecret(entitySecretHex, publicKeyPem) {
  const entitySecretBuffer = Buffer.from(entitySecretHex, 'hex');
  if (entitySecretBuffer.length !== 32) {
    throw new Error(`Entity secret must be 32 bytes, got ${entitySecretBuffer.length}`);
  }

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    entitySecretBuffer
  );

  return encrypted.toString('base64');
}

async function main() {
  // Step 1: Generate entity secret
  console.log('=== Step 1: Generating entity secret ===');
  const entitySecret = crypto.randomBytes(32).toString('hex');
  console.log(`Entity Secret: ${entitySecret}`);

  // Step 2: Fetch entity public key
  console.log('\n=== Step 2: Fetching entity public key ===');
  const pkRes = await fetch(`${BASE_URL}/v1/w3s/config/entity/publicKey`, { headers });
  if (!pkRes.ok) {
    throw new Error(`Failed to fetch public key: ${pkRes.status} ${await pkRes.text()}`);
  }
  const pkJson = await pkRes.json();
  const publicKeyPem = pkJson.data?.publicKey;
  console.log(`Public key received (${publicKeyPem.length} chars)`);

  // Step 3: Encrypt entity secret
  console.log('\n=== Step 3: Encrypting entity secret ===');
  const ciphertext = await encryptEntitySecret(entitySecret, publicKeyPem);
  console.log(`Ciphertext: ${ciphertext.substring(0, 40)}...`);

  // Step 4: Register entity secret with Circle
  console.log('\n=== Step 4: Registering entity secret ===');
  
  // The SDK uses POST /v1/w3s/config/entity/entitySecret
  // But let's try different endpoints
  const endpoints = [
    { method: 'POST', url: `${BASE_URL}/v1/w3s/config/entity/entitySecret` },
    { method: 'PUT', url: `${BASE_URL}/v1/w3s/config/entity` },
    { method: 'POST', url: `${BASE_URL}/v1/w3s/config/entity` },
  ];
  
  let registered = false;
  for (const ep of endpoints) {
    console.log(`  Trying ${ep.method} ${ep.url}...`);
    const res = await fetch(ep.url, {
      method: ep.method,
      headers,
      body: JSON.stringify({ entitySecretCiphertext: ciphertext }),
    });
    const text = await res.text();
    console.log(`  Response: ${res.status} ${text}`);
    if (res.ok) {
      registered = true;
      console.log('  ✅ Registration successful!');
      break;
    }
  }

  if (!registered) {
    console.log('\n⚠️  Could not register via API. You may need to register via Circle Console:');
    console.log(`   https://console.circle.com/wallets/dev/configurator`);
    console.log(`   Entity Secret Ciphertext: ${ciphertext}`);
    console.log(`\n   Or use existing entity secret if wallet was already created.`);
    console.log(`\n   Checking if existing entity secret works by listing wallet sets...`);
    
    // Try using the EXISTING entity secret from env
    const existingSecret = process.env.CIRCLE_ENTITY_SECRET;
    if (existingSecret) {
      console.log(`\n   Found existing CIRCLE_ENTITY_SECRET: ${existingSecret.substring(0, 8)}...`);
      const existingCiphertext = await encryptEntitySecret(existingSecret, publicKeyPem);
      
      // Try listing wallet sets with existing secret
      const listRes = await fetch(`${BASE_URL}/v1/w3s/developer/walletSets`, { 
        headers 
      });
      console.log(`   GET /walletSets: ${listRes.status}`);
      if (listRes.ok) {
        const listJson = await listRes.json();
        console.log(`   Wallet sets: ${JSON.stringify(listJson.data?.walletSets?.length ?? 0)} found`);
      }

      // Try a transfer with the existing secret
      console.log('\n   Testing transfer with existing entity secret...');
      const walletAddr = process.env.CIRCLE_WALLET_ADDRESS;
      if (walletAddr) {
        const testTransferRes = await fetch(`${BASE_URL}/v1/w3s/developer/transactions/transfer`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            entitySecretCiphertext: existingCiphertext,
            walletAddress: walletAddr,
            blockchain: 'ARC-TESTNET',
            tokenAddress: '0x3600000000000000000000000000000000000000',
            destinationAddress: walletAddr,
            amounts: ['0.01'],
            feeLevel: 'MEDIUM',
          }),
        });
        const testText = await testTransferRes.text();
        console.log(`   Transfer test: ${testTransferRes.status} ${testText}`);
      }
    }
    return;
  }

  // Step 5: Create wallet set
  console.log('\n=== Step 5: Creating wallet set ===');
  const newCiphertext = await encryptEntitySecret(entitySecret, publicKeyPem);
  const wsRes = await fetch(`${BASE_URL}/v1/w3s/developer/walletSets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      name: 'OmniClaw Wallet Set',
      entitySecretCiphertext: newCiphertext,
    }),
  });
  const wsJson = await wsRes.json();
  console.log(`Wallet set response: ${wsRes.status}`, JSON.stringify(wsJson, null, 2));
  const walletSetId = wsJson.data?.walletSet?.id;
  if (!walletSetId) throw new Error('Wallet set creation failed');

  // Step 6: Create wallet (need fresh ciphertext)
  console.log('\n=== Step 6: Creating wallet ===');
  const walletCiphertext = await encryptEntitySecret(entitySecret, publicKeyPem);
  const wRes = await fetch(`${BASE_URL}/v1/w3s/developer/wallets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      walletSetId: walletSetId,
      blockchains: ['ARC-TESTNET'],
      count: 1,
      accountType: 'EOA',
      entitySecretCiphertext: walletCiphertext,
    }),
  });
  const wJson = await wRes.json();
  console.log(`Wallet response: ${wRes.status}`, JSON.stringify(wJson, null, 2));
  const wallet = wJson.data?.wallets?.[0];
  if (!wallet) throw new Error('Wallet creation failed');

  // Output
  console.log('\n\n========================================');
  console.log('✅ Setup complete! Add these to .env.local:');
  console.log('========================================');
  console.log(`CIRCLE_ENTITY_SECRET=${entitySecret}`);
  console.log(`CIRCLE_WALLET_ID=${wallet.id}`);
  console.log(`CIRCLE_WALLET_ADDRESS=${wallet.address}`);
  console.log(`CIRCLE_WALLET_BLOCKCHAIN=${wallet.blockchain}`);
  console.log(`CIRCLE_WALLET_SET_ID=${walletSetId}`);
  console.log('========================================');
  console.log('\n⚠️  Fund wallet at: https://faucet.circle.com');
  console.log(`   Network: Arc Testnet`);
  console.log(`   Address: ${wallet.address}`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
