/**
 * test-entity-secret.mjs — Verify that the entity secret in .env.local is valid.
 * Usage: node --env-file=.env.local scripts/test-entity-secret.mjs
 */
import crypto from 'node:crypto';

const API_KEY = process.env.CIRCLE_API_KEY;
const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET;
const BASE_URL = process.env.CIRCLE_API_URL || 'https://api.circle.com';
const WALLET_ADDR = process.env.CIRCLE_WALLET_ADDRESS;

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

console.log('Entity secret:', ENTITY_SECRET.substring(0, 12) + '...');
console.log('Entity secret length:', ENTITY_SECRET.length, 'chars =', ENTITY_SECRET.length / 2, 'bytes');

// 1. Fetch public key
console.log('\n1. Fetching entity public key...');
const pkRes = await fetch(`${BASE_URL}/v1/w3s/config/entity/publicKey`, { headers });
const pkJson = await pkRes.json();
const publicKeyPem = pkJson.data?.publicKey;
if (!publicKeyPem) throw new Error('No public key returned');
console.log('   ✅ Public key received');

// 2. Encrypt entity secret
console.log('\n2. Encrypting entity secret...');
const buf = Buffer.from(ENTITY_SECRET, 'hex');
console.log('   Buffer length:', buf.length, 'bytes');
const encrypted = crypto.publicEncrypt(
  { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
  buf
);
const ciphertext = encrypted.toString('base64');
console.log('   ✅ Ciphertext generated (' + ciphertext.length + ' chars)');

// 3. Test: self-transfer of 0.01 USDC
console.log('\n3. Testing transfer (self-send 0.01 USDC)...');
const body = {
  idempotencyKey: crypto.randomUUID(),
  entitySecretCiphertext: ciphertext,
  walletAddress: WALLET_ADDR,
  blockchain: 'ARC-TESTNET',
  tokenAddress: '0x3600000000000000000000000000000000000000',
  destinationAddress: WALLET_ADDR,
  amounts: ['0.01'],
  feeLevel: 'MEDIUM',
};
console.log('   Request body:', JSON.stringify({ ...body, entitySecretCiphertext: '[REDACTED]' }, null, 2));

const txRes = await fetch(`${BASE_URL}/v1/w3s/developer/transactions/transfer`, {
  method: 'POST',
  headers,
  body: JSON.stringify(body),
});
const txText = await txRes.text();
console.log(`   Response: ${txRes.status}`);
console.log('   Body:', txText);

if (txRes.status === 201) {
  console.log('\n✅ Entity secret is VALID! Transfer initiated successfully.');
  const txData = JSON.parse(txText);
  const txId = txData.data?.id;
  if (txId) {
    console.log('   Transaction ID:', txId);
    // Poll for completion
    console.log('\n4. Polling for transaction completion...');
    const terminalStates = new Set(['COMPLETE', 'CONFIRMED', 'FAILED', 'CANCELLED', 'DENIED']);
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const pollRes = await fetch(`${BASE_URL}/v1/w3s/transactions/${txId}`, { headers });
      const pollJson = await pollRes.json();
      const state = pollJson.data?.transaction?.state;
      const txHash = pollJson.data?.transaction?.txHash;
      console.log(`   [${i + 1}] State: ${state}${txHash ? ` | txHash: ${txHash}` : ''}`);
      if (terminalStates.has(state)) {
        if (txHash) {
          console.log(`\n🎉 SUCCESS! View on ArcScan: https://testnet.arcscan.app/tx/${txHash}`);
        }
        break;
      }
    }
  }
} else if (txRes.status === 400) {
  const errData = JSON.parse(txText);
  if (errData.code === 156013) {
    console.log('\n❌ Entity secret is INVALID (code 156013).');
    console.log('   The secret does not match what was registered with Circle.');
  } else {
    console.log('\n❌ API error:', errData.message);
  }
} else {
  console.log('\n❌ Unexpected response');
}
