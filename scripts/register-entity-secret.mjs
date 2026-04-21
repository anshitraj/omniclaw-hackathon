/**
 * register-entity-secret.mjs
 * 
 * Registers the entity secret with Circle's API.
 * This must be done ONCE before the entity secret can be used for transactions.
 * 
 * Usage: node --env-file=.env.local scripts/register-entity-secret.mjs
 */
import crypto from 'node:crypto';

const API_KEY = process.env.CIRCLE_API_KEY;
const ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET;
const BASE_URL = process.env.CIRCLE_API_URL || 'https://api.circle.com';

if (!API_KEY) throw new Error('CIRCLE_API_KEY is required');
if (!ENTITY_SECRET) throw new Error('CIRCLE_ENTITY_SECRET is required');

console.log('Entity Secret length:', ENTITY_SECRET.length, 'chars');
console.log('Entity Secret (first 8):', ENTITY_SECRET.substring(0, 8) + '...');

// Step 1: Fetch the entity public key
console.log('\n1. Fetching entity public key...');
const pkRes = await fetch(`${BASE_URL}/v1/w3s/config/entity/publicKey`, {
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

if (!pkRes.ok) {
  const text = await pkRes.text();
  throw new Error(`Failed to fetch public key: ${pkRes.status} ${text}`);
}

const pkJson = await pkRes.json();
const publicKeyPem = pkJson.data?.publicKey;
console.log('Public key received:', publicKeyPem.substring(0, 50) + '...');

// Step 2: Encrypt the entity secret with the public key
console.log('\n2. Encrypting entity secret...');
const entitySecretBuffer = Buffer.from(ENTITY_SECRET, 'hex');
console.log('Entity secret buffer length:', entitySecretBuffer.length, 'bytes');

const encrypted = crypto.publicEncrypt(
  {
    key: publicKeyPem,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256',
  },
  entitySecretBuffer
);

const ciphertext = encrypted.toString('base64');
console.log('Ciphertext length:', ciphertext.length);
console.log('Ciphertext (first 40):', ciphertext.substring(0, 40) + '...');

// Step 3: Register the entity secret ciphertext
console.log('\n3. Registering entity secret ciphertext...');
const registerRes = await fetch(`${BASE_URL}/v1/w3s/config/entity`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    entitySecretCiphertext: ciphertext,
  }),
});

const registerText = await registerRes.text();
console.log('Registration response:', registerRes.status, registerText);

if (registerRes.ok) {
  console.log('\n✅ Entity secret registered successfully!');
  
  // Step 4: Verify by making a test call
  console.log('\n4. Verifying with entity config...');
  const configRes = await fetch(`${BASE_URL}/v1/w3s/config/entity`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  const configJson = await configRes.json();
  console.log('Entity config:', JSON.stringify(configJson, null, 2));
} else {
  console.error('\n❌ Registration failed');
  process.exit(1);
}
