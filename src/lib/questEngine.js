import { supabase } from './supabase';
import { awardXP } from './xpEngine';
import { rewards } from './rewards';

export const completeQuest = async (questId) => {
  try {
    // 1. Fetch quest details
    const { data: quest, error: fetchError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single();

    if (fetchError) throw fetchError;
    if (quest.completed) return { alreadyCompleted: true };

    // 2. Mark quest completed in Supabase
    const { error: updateError } = await supabase
      .from('quests')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', questId);

    if (updateError) throw updateError;

    // 3. Award XP and Rupees
    const xpResult = await awardXP(quest.xp_reward, `quest:${quest.title}`);
    const walletResult = await rewards.earnReward(quest.rupee_value, `Quest: ${quest.title}`, 'quest');

    // 4. Update gold in player_state
    const { data: player } = await supabase.from('player_state').select('gold').single();
    if (player) {
      await supabase
        .from('player_state')
        .update({ gold: (player.gold || 0) + (quest.gold_reward || 0) })
        .eq('id', (await supabase.from('player_state').select('id').single()).data.id);
    }

    // 5. Check weekly target progress
    const weeklyBonus = await checkWeeklyBonus();

    return {
      xpAwarded: xpResult.xpAwarded,
      rupeeEarned: walletResult.transaction.amount_paise,
      weeklyBonusTriggered: weeklyBonus.bonusEarned,
      newLevel: xpResult.newLevel,
      levelUp: xpResult.levelUp
    };
  } catch (err) {
    console.error('Error in completeQuest:', err);
    throw err;
  }
};

export const getBossStatus = async () => {
  try {
    const { data: boss, error: bossError } = await supabase
      .from('boss')
      .select('*')
      .eq('is_active', true)
      .single();

    if (bossError && bossError.code !== 'PGRST116') throw bossError;
    if (!boss) return { boss: null, tasks: [], hpPercent: 0, isDefeated: true };

    const { data: tasks, error: taskError } = await supabase
      .from('boss_tasks')
      .select('*')
      .eq('boss_id', boss.id);

    if (taskError) throw taskError;

    const currentHP = (tasks || [])
      .filter(t => !t.completed)
      .reduce((sum, t) => sum + (t.hp_damage || 0), 0);
    
    const hpPercent = Math.max(0, Math.floor((currentHP / boss.total_hp) * 100));

    return {
      boss,
      tasks: tasks || [],
      hpPercent,
      isDefeated: currentHP === 0
    };
  } catch (err) {
    console.error('Error in getBossStatus:', err);
    throw err;
  }
};

export const completeBossTask = async (taskId) => {
  try {
    // 1. Mark boss_task completed
    const { data: task, error: fetchError } = await supabase
      .from('boss_tasks')
      .select('*, boss(*)')
      .eq('id', taskId)
      .single();

    if (fetchError) throw fetchError;
    if (task.completed) return { alreadyCompleted: true };

    const { error: updateError } = await supabase
      .from('boss_tasks')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', taskId);

    if (updateError) throw updateError;

    // 2. Recalculate boss HP
    const status = await getBossStatus();
    
    let rewardsData = null;
    let bossDefeated = false;

    // 3. If HP === 0, handle defeat
    if (status.hpPercent === 0) {
      const xpResult = await awardXP(task.boss.xp_reward, 'boss_defeated');
      const walletResult = await rewards.earnReward(task.boss.gold_reward * 100, `Boss defeated: ${task.boss.name}`, 'boss');
      
      // Unlock "Exam Slayer" badge
      const { data: player } = await supabase.from('player_state').select('badges, id').single();
      if (player && !player.badges?.includes('Exam Slayer')) {
          await supabase.from('player_state')
            .update({ badges: [...(player.badges || []), 'Exam Slayer'] })
            .eq('id', player.id);
      }

      await supabase.from('boss').update({ is_active: false }).eq('id', task.boss.id);
      
      bossDefeated = true;
      rewardsData = { xp: xpResult.xpAwarded, rupees: walletResult.transaction.amount_paise };
    }

    return {
      newHP: status.hpPercent,
      bossDefeated,
      rewards: rewardsData
    };
  } catch (err) {
    console.error('Error in completeBossTask:', err);
    throw err;
  }
};

export const checkWeeklyBonus = async () => {
  try {
    // Calculate week start (Monday)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff)).toISOString().split('T')[0];

    const { data: summary, error: fetchError } = await supabase
      .from('quests')
      .select('*')
      .eq('completed', true)
      .gte('completed_at', weekStart);

    if (fetchError) throw fetchError;

    const questsThisWeek = summary?.length || 0;
    let bonusEarned = false;

    if (questsThisWeek >= 4) {
      // Check if already claimed
      const { data: target } = await supabase
        .from('weekly_targets')
        .select('*')
        .eq('week_start', weekStart)
        .single();

      if (!target || !target.bonus_claimed) {
        await rewards.earnReward(15000, 'Weekly Quest Milestone', 'weekly_bonus');
        
        if (target) {
            await supabase.from('weekly_targets')
              .update({ bonus_claimed: true, quests_completed: questsThisWeek })
              .eq('id', target.id);
        } else {
            await supabase.from('weekly_targets').insert([{
                week_start: weekStart,
                quests_completed: questsThisWeek,
                bonus_claimed: true
            }]);
        }
        bonusEarned = true;
      }
    }

    return { bonusEarned, questsThisWeek };
  } catch (err) {
    console.error('Error in checkWeeklyBonus:', err);
    throw err;
  }
};

export const completeDailyQuest = async (questId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Check if already completed today
    const { data: existing } = await supabase
      .from('daily_completions')
      .select('*')
      .eq('quest_id', questId)
      .eq('completed_date', today)
      .single();

    if (existing) return { alreadyCompleted: true };

    // 2. Fetch quest details
    const { data: quest, error: fetchError } = await supabase
      .from('daily_quests')
      .select('*')
      .eq('id', questId)
      .single();

    if (fetchError) throw fetchError;

    // 3. Insert completion record
    const { error: insertError } = await supabase
      .from('daily_completions')
      .insert([{ quest_id: questId, completed_date: today }]);

    if (insertError) throw insertError;

    // 4. Award XP and Rupees
    const xpResult = await awardXP(quest.xp_reward, `daily:${quest.quest_text}`);
    
    // Convert gold_reward to rupees (paise) for simplicity in this prompt's logic
    // Actually prompt says +₹X in pill. I'll use the rupee mapping.
    const rupeeAmount = (quest.gold_reward || 0) * 100; // Assuming 1 gold = 1 rupee for now
    const walletResult = await rewards.earnReward(rupeeAmount, `Daily: ${quest.quest_text}`, 'daily');

    return {
      xpAwarded: xpResult.xpAwarded,
      rupeeEarned: walletResult.transaction.amount_paise,
      newLevel: xpResult.newLevel,
      levelUp: xpResult.levelUp
    };
  } catch (err) {
    console.error('Error in completeDailyQuest:', err);
    throw err;
  }
};

