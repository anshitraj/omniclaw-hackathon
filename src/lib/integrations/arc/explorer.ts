// ============================================================
// Arc Explorer / ArcScan Integration
// ============================================================
// Utility for generating Arc Testnet explorer links
// and fetching transaction proofs.
// ============================================================

const ARC_EXPLORER_URL = process.env.ARC_EXPLORER_URL || 'https://arcscan.io';
const ARC_RPC_URL = process.env.ARC_RPC_URL;

export function isArcConfigured(): boolean {
  return !!ARC_RPC_URL;
}

export function getArcScanTxUrl(txHash: string): string {
  return `${ARC_EXPLORER_URL}/tx/${txHash}`;
}

export function getArcScanAddressUrl(address: string): string {
  return `${ARC_EXPLORER_URL}/address/${address}`;
}

export function getArcScanBlockUrl(block: string): string {
  return `${ARC_EXPLORER_URL}/block/${block}`;
}

/**
 * Fetch transaction proof from Arc Testnet.
 * In demo mode: returns mock proof data.
 * In live mode: queries Arc RPC for tx receipt.
 */
export async function getTransactionProof(txHash: string): Promise<{
  confirmed: boolean;
  blockNumber: string;
  gasUsed: string;
  status: string;
}> {
  if (!isArcConfigured()) {
    return {
      confirmed: true,
      blockNumber: '1284573',
      gasUsed: '21000',
      status: 'success',
    };
  }

  // --- INTEGRATION POINT: Arc RPC eth_getTransactionReceipt ---
  const res = await fetch(ARC_RPC_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      params: [txHash],
      id: 1,
    }),
  });

  if (!res.ok) throw new Error(`Arc RPC failed: ${res.status}`);
  const data = await res.json();
  const receipt = data.result;

  return {
    confirmed: !!receipt,
    blockNumber: receipt?.blockNumber || '0',
    gasUsed: receipt?.gasUsed || '0',
    status: receipt?.status === '0x1' ? 'success' : 'failed',
  };
}
