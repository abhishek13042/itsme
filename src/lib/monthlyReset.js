import { supabase } from './supabase';

export const checkAndResetMonth = async () => {
    try {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        let { data: lastSummary } = await supabase
          .from('monthly_summaries')
          .select('month')
          .order('month', { ascending: false })
          .limit(1)
          .single();
          
        let lastMonth = lastSummary ? lastSummary.month : null;
        
        // Fallback: check targets
        if (!lastMonth) {
            const { data: lastTarget } = await supabase
               .from('monthly_targets')
               .select('month')
               .order('month', { ascending: false })
               .limit(1)
               .single();
            if (lastTarget) lastMonth = lastTarget.month;
        }

        if (!lastMonth || lastMonth === currentMonth) {
            return;
        }

        console.log(`New month detected: transitioning from ${lastMonth} to ${currentMonth}`);

        // 1. Calculate previous month stats
        const { data: wallet } = await supabase.from('wallet').select('*').single();
        if (!wallet) return;

        const { data: targets } = await supabase
            .from('monthly_targets')
            .select('*')
            .eq('month', lastMonth);
            
        let targets_total = 0;
        let targets_hit = 0;
        let completion_percent = 0;
        
        if (targets && targets.length > 0) {
            targets_total = targets.length;
            targets_hit = targets.filter(t => t.completed).length;
            completion_percent = Math.floor((targets_hit / targets_total) * 100);
        }

        const net_balance = wallet.balance_paise - wallet.month_start_balance;

        // 2. Generate monthly_summary row
        await supabase.from('monthly_summaries').insert([{
            month: lastMonth,
            total_earned: net_balance > 0 ? net_balance : 0, 
            total_penalties: net_balance < 0 ? Math.abs(net_balance) : 0,
            net_balance,
            completion_percent,
            withdraw_eligible: completion_percent >= 70,
            targets_hit,
            targets_total
        }]);

        // 3. Generate new monthly_targets
        const newTargets = [
            { month: currentMonth, target_type: 'daily_streak', target_description: 'Maintain 7-day streak', rupee_value: 10000 },
            { month: currentMonth, target_type: 'daily_streak', target_description: 'Maintain 30-day streak bonus', rupee_value: 30000 },
            { month: currentMonth, target_type: 'weekly_boss', target_description: 'Defeat world boss', rupee_value: 20000 },
            { month: currentMonth, target_type: 'perfect_week', target_description: 'Complete all 7 dailies for 7 days straight', rupee_value: 20000 },
            { month: currentMonth, target_type: 'main_quests', target_description: 'Complete 8 main quests this month', rupee_value: 15000 },
            { month: currentMonth, target_type: 'phase_milestone', target_description: 'Hit phase milestone checkpoint', rupee_value: 50000 },
            { month: currentMonth, target_type: 'sde_goal', target_description: 'Solve 30 DSA problems this month', rupee_value: 15000 },
            { month: currentMonth, target_type: 'trading_goal', target_description: 'Journal every trade for 20 days', rupee_value: 15000 },
            { month: currentMonth, target_type: 'health_goal', target_description: 'Gym 20+ days this month', rupee_value: 15000 },
            { month: currentMonth, target_type: 'exam_goal', target_description: 'All subjects above 70% readiness', rupee_value: 10000 }
        ];

        await supabase.from('monthly_targets').insert(newTargets);

        // 4. Reset month_start_balance
        await supabase.from('wallet')
            .update({ month_start_balance: wallet.balance_paise })
            .eq('id', wallet.id);

        console.log('Month successfully reset and targets seeded.');

    } catch (err) {
        console.error('Error in checkAndResetMonth:', err);
    }
};
