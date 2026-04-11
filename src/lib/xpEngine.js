import { supabase } from './supabase';

export const LEVEL_FORMULA = {
  getLevel: (totalXP) => Math.floor(Math.sqrt(totalXP / 100)) + 1,
  getXpForNextLevel: (level) => Math.pow(level * 10, 2),
  getXpProgress: (totalXP) => {
    const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;
    return totalXP - Math.pow((level - 1) * 10, 2);
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
  const currentBadges = player.badges || [];
  const newBadges = [];

  const addBadge = (id) => {
    if (!currentBadges.includes(id)) {
      newBadges.push(id);
    }
  };

  // Badge Logic
  // "First Blood" → complete first daily quest
  const { data: completions } = await supabase.from('daily_completions').select('*').limit(1);
  if (completions && completions.length > 0) addBadge("First Blood");

  // "Week Warrior" → 7 day streak
  if (player.streak_days >= 7) addBadge("Week Warrior");

  // "Century" → 100 XP in one day
  const today = new Date().toISOString().split('T')[0];
  const { data: todayXP } = await supabase
    .from('xp_log')
    .select('final_amount')
    .gte('created_at', today);
  const totalToday = (todayXP || []).reduce((sum, log) => sum + log.final_amount, 0);
  if (totalToday >= 100) addBadge("Century");

  // "Exam Slayer" → defeat exam boss
  const { data: bosses } = await supabase.from('boss').select('*').eq('name', 'Final Sem Exam Gauntlet').eq('current_hp', 0);
  if (bosses && bosses.length > 0) addBadge("Exam Slayer");

  // "Grinder" → 30 day streak
  if (player.streak_days >= 30) addBadge("Grinder");

  // "Code Initiate" → complete first SDE quest
  const { data: sdeQuests } = await supabase.from('quests').select('*').eq('domain', 'sde').eq('completed', true).limit(1);
  if (sdeQuests && sdeQuests.length > 0) addBadge("Code Initiate");

  // "Market Journal" → log 10 trades
  const { count } = await supabase.from('trades').select('*', { count: 'exact', head: true });
  if (count >= 10) addBadge("Market Journal");

  return newBadges;
};
