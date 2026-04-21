import { getWalletSummaryForActor } from './wallet-utils';
import { getWalletHistoryForActor } from './history';

export async function getSellerWalletSummary() {
  return getWalletSummaryForActor('seller');
}

export async function getSellerWalletHistory(limit = 20) {
  return getWalletHistoryForActor('seller', limit);
}
