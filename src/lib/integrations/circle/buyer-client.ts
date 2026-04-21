import { getWalletSummaryForActor } from './wallet-utils';
import { getWalletHistoryForActor } from './history';

export async function getBuyerWalletSummary() {
  return getWalletSummaryForActor('buyer');
}

export async function getBuyerWalletHistory(limit = 20) {
  return getWalletHistoryForActor('buyer', limit);
}
