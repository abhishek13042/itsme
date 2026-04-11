import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { rewards, penalties, withdraw } from '../lib/rewards';

export const useWalletStore = create((set, get) => ({
  balance: 0,
  transactions: [],
  monthlyTargets: [],
  canWithdraw: false,
  withdrawReason: '',
  loading: false,

  loadWallet: async () => {
    set({ loading: true });
    try {
      const { data: wallet } = await supabase.from('wallet').select('*').limit(1).single();
      
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: targets } = await supabase
        .from('monthly_targets')
        .select('*')
        .eq('month', currentMonth);

      const withdrawCheck = await withdraw.canWithdraw();

      if (wallet) {
        set({ 
          balance: wallet.balance_paise, 
          transactions: txs || [],
          monthlyTargets: targets || [],
          canWithdraw: withdrawCheck.allowed,
          withdrawReason: withdrawCheck.reason || '',
          loading: false 
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Failed to load wallet store:', err);
      set({ loading: false });
    }
  },

  earnReward: async (type, ...args) => {
    if (!rewards[type]) return;
    try {
      await rewards[type](...args);
      await get().loadWallet(); // refresh state
    } catch (err) {
      console.error('Failed to earn reward:', err);
    }
  },

  applyPenalty: async (type, ...args) => {
    if (!penalties[type]) return;
    try {
      await penalties[type](...args);
      await get().loadWallet(); // refresh state
    } catch (err) {
      console.error('Failed to apply penalty:', err);
    }
  },

  checkWithdrawEligibility: async () => {
    const withdrawCheck = await withdraw.canWithdraw();
    set({ canWithdraw: withdrawCheck.allowed, withdrawReason: withdrawCheck.reason || '' });
    return withdrawCheck;
  }
}));
