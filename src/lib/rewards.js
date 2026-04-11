import { supabase } from './supabase';

// EARN RATES (in paise — multiply rupees by 100):
export const calculateEarnRates = {
  completeDailyQuest: (xpReward) => Math.floor(xpReward * 25),
  completeAllDailies: () => 1500,
  completeMainQuest: (xpReward) => Math.floor(xpReward * 60),
  defeatBoss: () => 20000,
  maintainStreak: (days) => (days % 7 === 0 ? 10000 : 0),
  perfectWeek: () => 20000,
  completePhaseMilestone: () => 50000,
};

// PENALTY RATES:
export const calculatePenaltyRates = {
  breakStreak: () => 5000,
  missMainQuest: () => 3000,
  skipDailyThreeTimes: () => 10000,
};

const processTransaction = async (type, amountPaise, reason, source) => {
  try {
    if (amountPaise === 0) return null;

    // 1. Insert transaction
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .insert([{ type, amount_paise: amountPaise, reason, source }])
      .select()
      .single();

    if (txError) throw txError;

    // 2. Get current wallet
    const { data: walletData, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .single();

    if (walletError && walletError.code !== 'PGRST116') throw walletError;

    let wallet = walletData;

    // If wallet doesn't exist, create it
    if (!wallet) {
      const { data: newWallet, error: newWalletError } = await supabase
        .from('wallet')
        .insert([{ balance_paise: 0, total_earned_paise: 0, total_withdrawn_paise: 0, total_penalties_paise: 0, month_start_balance: 0 }])
        .select()
        .single();
      if (newWalletError) throw newWalletError;
      wallet = newWallet;
    }

    // 3. Update wallet balance
    const updates = {
      balance_paise: wallet.balance_paise,
      updated_at: new Date().toISOString()
    };

    if (type === 'earn' || type === 'bonus') {
      updates.balance_paise += amountPaise;
      updates.total_earned_paise = wallet.total_earned_paise + amountPaise;
    } else if (type === 'penalty') {
      updates.balance_paise -= amountPaise;
      updates.total_penalties_paise = wallet.total_penalties_paise + amountPaise;
    } else if (type === 'withdraw') {
      updates.balance_paise -= amountPaise;
      updates.total_withdrawn_paise = wallet.total_withdrawn_paise + amountPaise;
    }

    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallet')
      .update(updates)
      .eq('id', wallet.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return { balance: updatedWallet.balance_paise, transaction: tx };
  } catch (err) {
    console.error('Transaction Error:', err);
    throw err;
  }
};

// API Functions
export const rewards = {
  completeDailyQuest: (xpReward) => processTransaction('earn', calculateEarnRates.completeDailyQuest(xpReward), 'Daily Quest Completed', 'daily_quest'),
  completeAllDailies: () => processTransaction('bonus', calculateEarnRates.completeAllDailies(), 'Perfect Day Bonus', 'daily_bonus'),
  completeMainQuest: (xpReward) => processTransaction('earn', calculateEarnRates.completeMainQuest(xpReward), 'Main Quest Completed', 'main_quest'),
  defeatBoss: () => processTransaction('earn', calculateEarnRates.defeatBoss(), 'World Boss Defeated', 'boss'),
  maintainStreak: (days) => processTransaction('bonus', calculateEarnRates.maintainStreak(days), `Maintained Streak: ${days} days`, 'streak'),
  perfectWeek: () => processTransaction('bonus', calculateEarnRates.perfectWeek(), 'Perfect Week Bonus', 'perfect_week'),
  completePhaseMilestone: () => processTransaction('earn', calculateEarnRates.completePhaseMilestone(), 'Phase Milestone Completed', 'phase_milestone'),
  earnReward: (amountPaise, reason, source) => processTransaction('earn', amountPaise, reason, source),
};

export const penalties = {
  breakStreak: () => processTransaction('penalty', calculatePenaltyRates.breakStreak(), 'Streak Broken', 'streak_penalty'),
  missMainQuest: () => processTransaction('penalty', calculatePenaltyRates.missMainQuest(), 'Main Quest Missed', 'quest_penalty'),
  skipDailyThreeTimes: () => processTransaction('penalty', calculatePenaltyRates.skipDailyThreeTimes(), 'Missed Dailies Warning', 'daily_penalty'),
  generalPenalty: (amountPaise, reason, source) => processTransaction('penalty', amountPaise, reason, source),
};

export const withdraw = {
  canWithdraw: async () => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      const { data: summary, error } = await supabase
        .from('monthly_summaries')
        .select('completion_percent, withdraw_eligible')
        .eq('month', currentMonth)
        .maybeSingle();
        
      if (error && error.code !== 'PGRST116') throw error;
      
      // Calculate from targets manually as fallback/active status
      const { data: targets } = await supabase
        .from('monthly_targets')
        .select('completed')
        .eq('month', currentMonth);
        
      let completionPercent = 0;
      if (targets && targets.length > 0) {
        const completed = targets.filter(t => t.completed).length;
        completionPercent = (completed / targets.length) * 100;
      }
      
      const isCompletionHighEnough = (summary ? summary.completion_percent : completionPercent) >= 70;

      // check if date is last 3 days of month
      const today = new Date();
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const daysUntilEnd = lastDayOfMonth.getDate() - today.getDate();
      const isEndWindow = daysUntilEnd <= 2; // last 3 days

      if (isCompletionHighEnough && isEndWindow) {
        return { allowed: true };
      } else {
        const reasons = [];
        if (!isCompletionHighEnough) reasons.push(`Completion percent is ${Math.floor(completionPercent)}%, need 70%`);
        if (!isEndWindow) reasons.push('Withdrawals only allowed in the last 3 days of the month');
        return { allowed: false, reason: reasons.join(' AND ') };
      }
    } catch (err) {
      console.error('Withdraw check error:', err);
      return { allowed: false, reason: 'System error' };
    }
  },
  executeWithdrawal: async (amountPaise) => {
    return processTransaction('withdraw', amountPaise, 'Monthly Withdrawal', 'withdrawal');
  }
};
