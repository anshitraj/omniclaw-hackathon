// POST /api/integrations/circle/create-wallet
// Creates a Circle developer-controlled wallet (ARC-TESTNET by default).
// Requires CIRCLE_API_KEY + CIRCLE_ENTITY_SECRET and entity registered in console.

import { NextResponse } from 'next/server';
import {
  isCircleConfigured,
  isEntitySecretConfigured,
  listWalletSets,
  createWalletSet,
  createWallet,
} from '@/lib/integrations/circle/client';

export async function POST(req: Request) {
  if (!isCircleConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Circle not configured. Set CIRCLE_API_KEY in .env.local.',
      code: 'NOT_CONFIGURED',
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }

  if (!isEntitySecretConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'CIRCLE_ENTITY_SECRET is missing or invalid. Generate a 32-byte hex secret and add it to .env.local.',
      code: 'ENTITY_SECRET_MISSING',
      setupUrl: 'https://developers.circle.com/w3s/docs/developer-controlled-create-your-first-wallet',
      timestamp: new Date().toISOString(),
    }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const blockchain = body.blockchain || 'ARC-TESTNET';

    // Step 1: Find or create a wallet set
    let walletSetId: string;
    try {
      const sets = await listWalletSets();
      walletSetId = sets.length > 0 ? sets[0].id : (await createWalletSet('OmniClaw Agent Wallets')).id;
    } catch (err) {
      const msg = String(err);
      // 404 on wallet sets means entity hasn't been fully registered in Circle console
      if (msg.includes('404')) {
        return NextResponse.json({
          success: false,
          error: 'Entity not registered. Complete entity secret registration at developers.circle.com first.',
          code: 'ENTITY_NOT_REGISTERED',
          setupUrl: 'https://developers.circle.com/w3s/docs/developer-controlled-create-your-first-wallet#register-entity-secret-ciphertext',
          timestamp: new Date().toISOString(),
        }, { status: 422 });
      }
      throw err;
    }

    // Step 2: Create wallet
    const wallets = await createWallet(walletSetId, [blockchain], 1);

    if (!wallets.length) {
      return NextResponse.json({
        success: false,
        error: 'Wallet creation returned empty result.',
        code: 'EMPTY_RESULT',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    const wallet = wallets[0];
    return NextResponse.json({
      success: true,
      data: {
        id: wallet.id,
        address: wallet.address,
        blockchain: wallet.blockchain,
        state: wallet.state,
        walletSetId,
        custodyType: wallet.custodyType,
        createDate: wallet.createDate,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    const msg = String(error);
    // Friendly message for entity registration errors
    const isEntityError = msg.toLowerCase().includes('entity') || msg.includes('entitySecretCiphertext');
    return NextResponse.json({
      success: false,
      error: isEntityError
        ? 'Entity secret error. Register your entity at developers.circle.com → W3S → Configure.'
        : msg,
      code: isEntityError ? 'ENTITY_ERROR' : 'UNKNOWN',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
