import { useEffect } from 'react';
import { useWalletStore } from '../store/walletStore';
import { checkAndResetMonth } from '../lib/monthlyReset';

export const useWallet = () => {
  const {
    balance,
    transactions,
    monthlyTargets,
    canWithdraw,
    withdrawReason,
    loading,
    loadWallet,
    earnReward,
    applyPenalty,
    checkWithdrawEligibility
  } = useWalletStore();

  useEffect(() => {
    const initialize = async () => {
      await checkAndResetMonth();
      loadWallet();
    };
    initialize();
  }, [loadWallet]);

  return {
    balance,
    transactions,
    monthlyTargets,
    canWithdraw,
    withdrawReason,
    loading,
    earnReward,
    applyPenalty,
    checkWithdrawEligibility,
    refreshWallet: loadWallet
  };
};
