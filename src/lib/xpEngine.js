import { supabase } from './supabase';

export const LEVEL_FORMULA = {
  getLevel: (totalXP) => Math.floor(Math.sqrt(Math.max(0, totalXP) / 100)) + 1,
  
  // XP threshold where Level 1 starts at 0, Level 2 starts at 100, Level 3 starts at 400...
  xpForLevel: (lvl) => Math.pow(lvl - 1, 2) * 100,

  // Current progress within the level
  getXpProgress: (totalXP) => {
    const level = Math.floor(Math.sqrt(Math.max(0, totalXP) / 100)) + 1;
    const baseXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    
    return {
      current: totalXP - baseXP,
      needed: nextLevelXP - baseXP
    };
  }
};

export const getStreakMultiplier = (streakDays) => {
  return Math.min(1 + (streakDays * 0.1), 3.0);
};

export const awardXP = async (amount, source) => {
  try {
    // 1. Get current player state
    const { data: player, error: fetchError } = await supabase
      .from('player_state')
      .select('*')
      .single();

    if (fetchError) throw fetchError;

    // 2. Calculate multiplier
    const multiplier = getStreakMultiplier(player.streak_days);
    const finalAmount = Math.floor(amount * multiplier);

    // 3. Insert into xp_log
    const { error: logError } = await supabase
      .from('xp_log')
      .insert([{
        amount,
        multiplier,
        final_amount: finalAmount,
        source
      }]);

    if (logError) throw logError;

    // 4. Update player_state
    const oldLevel = LEVEL_FORMULA.getLevel(player.xp);
    const newXP = player.xp + finalAmount;
    const totalXPAlltime = (player.total_xp_alltime || 0) + finalAmount;
    const newLevel = LEVEL_FORMULA.getLevel(newXP);
    const levelUp = newLevel > oldLevel;

    const { data: updatedPlayer, error: updateError } = await supabase
      .from('player_state')
      .update({
        xp: newXP,
        total_xp_alltime: totalXPAlltime,
        level: newLevel
      })
      .eq('id', player.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 5. Check badges (optional: can be done separately or here)
    const newBadges = await checkBadges(updatedPlayer);
    if (newBadges.length > 0) {
        const { error: badgeError } = await supabase
            .from('player_state')
            .update({
                badges: [...(updatedPlayer.badges || []), ...newBadges]
            })
            .eq('id', player.id);
        if (badgeError) console.error('Error updating badges:', badgeError);
    }

    return {
      xpAwarded: finalAmount,
      multiplier,
      levelUp,
      newLevel,
      player: updatedPlayer,
      newBadges
    };
  } catch (err) {
    console.error('Error in awardXP:', err);
    throw err;
  }
};

export const checkAndUpdateStreak = async () => {
  try {
    const { data: player, error: fetchError } = await supabase
      .from('player_state')
      .select('*')
      .single();

    if (fetchError) throw fetchError;

    const today = new Date().toISOString().split('T')[0];
    const lastActive = player.last_active_date;
    
    if (!lastActive) {
      // First time
      const { data } = await supabase
        .from('player_state')
        .update({ last_active_date: today, streak_days: 1 })
        .eq('id', player.id)
        .select()
        .single();
      return { streakDays: 1, streakLost: false };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = player.streak_days;
    let streakLost = false;

    if (lastActive === yesterdayStr) {
      newStreak += 1;
    } else if (lastActive === today) {
      // No change
      return { streakDays: newStreak, streakLost: false };
    } else {
      // Streak lost
      newStreak = 1; // Start new
      streakLost = true;
    }

    const longestStreak = Math.max(newStreak, player.longest_streak || 0);

    const { data: updatedPlayer } = await supabase
      .from('player_state')
      .update({
        streak_days: newStreak,
        last_active_date: today,
        longest_streak: longestStreak
      })
      .eq('id', player.id)
      .select()
      .single();

    return { streakDays: newStreak, streakLost, player: updatedPlayer };
  } catch (err) {
    console.error('Error in checkAndUpdateStreak:', err);
    throw err;
  }
};

export const checkBadges = async (player) => {
  try {
    const { data: allBadges } = await supabase.from('badges').select('*').eq('earned', false);
    if (!allBadges || allBadges.length === 0) return [];

    const newBadges = [];
    const today = new Date().toISOString().split('T')[0];

    // Evaluate conditions
    for (const badge of allBadges) {
      let earned = false;
      
      switch (badge.badge_key) {
        case 'first_blood':
          const { count: dqCount } = await supabase.from('daily_completions').select('*', { count: 'exact', head: true });
          if (dqCount >= 1) earned = true;
          break;
        case 'week_warrior':
          if (player.streak_days >= 7) earned = true;
          break;
        case 'month_monk':
          if (player.streak_days >= 30) earned = true;
          break;
        case 'dsa_warrior':
          if (player.lc_problems_solved >= 100) earned = true;
          break;
        case 'dsa_master':
          if (player.lc_problems_solved >= 300) earned = true;
          break;
        case 'gym_initiate':
          if (player.streak_days >= 7) earned = true; // Simplified check for streak context
          break;
        case 'deep_thinker':
          const { count: bLogs } = await supabase.from('brain_logs').select('*', { count: 'exact', head: true });
          if (bLogs >= 10) earned = true;
          break;
        case 'problem_solver':
          const { count: bLogs30 } = await supabase.from('brain_logs').select('*', { count: 'exact', head: true });
          if (bLogs30 >= 30) earned = true;
          break;
        // ... more cases can be added as needed
      }

      if (earned) {
        await supabase.from('badges').update({ 
          earned: true, 
          earned_at: new Date().toISOString() 
        }).eq('id', badge.id);
        
        await awardXP(badge.xp_reward || 50, `badge_unlocked:${badge.title}`);
        newBadges.push(badge.title);
      }
    }

    return newBadges;
  } catch (err) {
    console.error('Error in checkBadges:', err);
    return [];
  }
};
