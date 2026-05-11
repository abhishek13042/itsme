import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { awardXP } from '../lib/xpEngine';
import { rewards } from '../lib/rewards';
import { seedTradingSystem } from '../lib/tradingSeeder';

export const useTradingStore = create((set, get) => ({
  trades: [],
  phases: [],
  journalEntries: [],
  moneyEntries: [],
  withdrawals: [],
  loading: false,
  lastLoaded: null,

  loadTradingData: async () => {
    if (get().lastLoaded && Date.now() - get().lastLoaded < 120000) return;
    set({ loading: true });
    try {
      await seedTradingSystem();
      
      const [tradesRes, phasesRes, journalRes, moneyRes, withRes] = await Promise.all([
        supabase.from('trades').select('*').order('date', { ascending: false }),
        supabase.from('trading_phases').select('*').order('phase_number', { ascending: true }),
        supabase.from('trade_journal').select('*').order('entry_date', { ascending: false }),
        supabase.from('money_tracker').select('*').order('entry_date', { ascending: false }),
        supabase.from('withdrawals').select('*').order('withdrawal_date', { ascending: false })
      ]);

      set({ 
        trades: tradesRes.data || [], 
        phases: phasesRes.data || [], 
        journalEntries: journalRes.data || [],
        moneyEntries: moneyRes.data || [],
        withdrawals: withRes.data || [],
        loading: false,
        lastLoaded: Date.now()
      });
    } catch (err) {
      console.error('Failed to load trading data:', err);
      set({ loading: false });
    }
  },

  logTrade: async (tradeData) => {
    try {
      const { data, error } = await supabase.from('trades').insert([tradeData]).select().single();
      if (error) throw error;

      // Handle rewards/penalties based on new ICT rules
      if (tradeData.rules_followed === 'YES') {
        await awardXP(30, 'Trade logged — rules followed');
      } else if (tradeData.rules_followed === 'PARTIAL') {
        await awardXP(15, 'Trade logged — partial rules');
      } else if (tradeData.rules_followed === 'NO') {
        await rewards.applyPenalty(2000, 'Rules broken');
        await awardXP(-20, 'Penalty: Rules broken');
      }

      await get().loadTradingData();
      return data;
    } catch (err) {
      console.error('Failed to log trade:', err);
      throw err;
    }
  },

  addJournalEntry: async (entry) => {
    try {
      const { data, error } = await supabase.from('trade_journal').insert([entry]).select().single();
      if (error) throw error;
      await awardXP(10, 'Daily journal entry completed');
      await get().loadTradingData();
      return data;
    } catch (err) {
      console.error('Failed to add journal entry:', err);
      throw err;
    }
  },

  addMoneyEntry: async (entry) => {
    try {
      const { data, error } = await supabase.from('money_tracker').insert([entry]).select().single();
      if (error) throw error;
      await get().loadTradingData();
      return data;
    } catch (err) {
      console.error('Failed to add money entry:', err);
      throw err;
    }
  },

  logWithdrawal: async (entry) => {
    try {
      const { data, error } = await supabase.from('withdrawals').insert([entry]).select().single();
      if (error) throw error;
      
      // Check if first withdrawal for badge
      if (get().withdrawals.length === 0) {
        // First Blood badge logic could be triggered here or in XP engine
      }

      await get().loadTradingData();
      return data;
    } catch (err) {
      console.error('Failed to log withdrawal:', err);
      throw err;
    }
  },

  updatePhase: async (phaseId, completed) => {
    try {
      await supabase.from('trading_phases').update({ completed }).eq('id', phaseId);
      await get().loadTradingData();
    } catch (err) {
      console.error('Failed to update phase:', err);
    }
  }
}));
