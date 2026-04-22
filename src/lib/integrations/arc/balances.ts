const ARC_RPC_URL = process.env.ARC_RPC_URL;
const ARC_USDC_TOKEN_ADDRESS =
  process.env.ARC_USDC_TOKEN_ADDRESS || '0x3600000000000000000000000000000000000000';
const USDC_DECIMALS = 6;
const BALANCE_OF_SELECTOR = '70a08231';

function padAddress(address: string): string {
  return address.toLowerCase().replace(/^0x/, '').padStart(64, '0');
}

function hexToBigInt(value: string): bigint {
  if (!value || value === '0x') return BigInt(0);
  return BigInt(value);
}

export async function getOnChainGatewayUsdcBalance(address: string): Promise<number | null> {
  if (!ARC_RPC_URL || !address) return null;

  const callData = `0x${BALANCE_OF_SELECTOR}${padAddress(address)}`;

  const res = await fetch(ARC_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{ to: ARC_USDC_TOKEN_ADDRESS, data: callData }, 'latest'],
      id: 1,
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Arc RPC eth_call failed (${res.status})`);
  }

  const json = await res.json();
  if (json.error) {
    throw new Error(`Arc RPC eth_call error: ${json.error?.message || 'unknown'}`);
  }

  const raw = hexToBigInt(json.result);
  return Number(raw) / 10 ** USDC_DECIMALS;
}
