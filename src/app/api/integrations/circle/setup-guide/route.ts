// GET /api/integrations/circle/setup-guide
// Returns setup instructions and generates the entity secret ciphertext
// needed to register in the Circle Developer Console.

import { NextResponse } from 'next/server';
import {
  isCircleConfigured,
  isEntitySecretConfigured,
  getEntityConfig,
} from '@/lib/integrations/circle/client';
import crypto from 'crypto';

export async function GET() {
  if (!isCircleConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'CIRCLE_API_KEY not configured',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }

  try {
    // Fetch entity config to get the public key
    const entityConfig = (await getEntityConfig()) as { publicKey?: string; appId?: string };
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

    if (!isEntitySecretConfigured() || !entitySecret) {
      return NextResponse.json({
        success: false,
        error: 'CIRCLE_ENTITY_SECRET not set in .env.local',
        setupSteps: [
          'Run: node -e "const c=require(\'crypto\');console.log(c.randomBytes(32).toString(\'hex\'))"',
          'Add the output to .env.local as CIRCLE_ENTITY_SECRET=<your_secret>',
          'Restart your dev server',
          'Call this endpoint again to get the ciphertext for Circle Console registration',
        ],
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Generate the entity secret ciphertext
    const publicKey = entityConfig.publicKey;
    if (!publicKey) {
      throw new Error('Circle entity config did not include publicKey.');
    }

    let pem = publicKey.trim();
    if (!pem.includes('BEGIN')) {
      pem = `-----BEGIN PUBLIC KEY-----\n${pem.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
    }

    const entitySecretBuffer = Buffer.from(entitySecret, 'hex');
    const encrypted = crypto.publicEncrypt(
      {
        key: pem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      entitySecretBuffer
    );

    const ciphertext = encrypted.toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        appId: entityConfig.appId,
        entitySecretCiphertext: ciphertext,
        setupInstructions: [
          '1. Go to https://developers.circle.com',
          '2. Navigate to: W3S → Developer Controlled → Configure',
          '3. Paste the entitySecretCiphertext below into the "Entity Secret Ciphertext" field',
          '4. Click Register — you only need to do this ONCE',
          '5. After registration, click "Create Wallet" in the OmniClaw Console',
        ],
        note: 'The entitySecretCiphertext is unique per request. Use a fresh one each time you register.',
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
