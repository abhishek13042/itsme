import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailies, setDailies] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showFullDayCleared, setShowFullDayCleared] = useState(false);

  useEffect(() => {
    fetchPlayerData();
    const dailiesSubscription = supabase
      .channel('dailies_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_completions' }, () => {
        fetchCompletions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(dailiesSubscription);
    };
  }, []);

  const fetchPlayerData = async () => {
    try {
      const { data, error } = await supabase
        .from('player_state')
        .select('*')
        .single();

      if (error) throw error;

      // Handle midnight reset
      const today = new Date().toISOString().split('T')[0];
      if (data.last_active_date !== today) {
        await handleDayReset(data, today);
      } else {
        setPlayer(data);
      }

      await fetchDailies();
      await fetchCompletions();
    } catch (err) {
      console.error('Error fetching player data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailies = async () => {
    const { data } = await supabase.from('daily_quests').select('*');
    setDailies(data || []);
  };

  const fetchCompletions = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_completions')
      .select('quest_id')
      .eq('completed_date', today);
    setCompletions((data || []).map(c => c.quest_id));
  };

  const handleDayReset = async (data, today) => {
    const lastDate = new Date(data.last_active_date);
    const currDate = new Date(today);
    const diffDays = Math.floor((currDate - lastDate) / (1000 * 60 * 60 * 24));

    let newStreak = data.streak_days;
    
    // If more than 1 day missed, reset streak
    if (diffDays > 1) {
      newStreak = 0;
    } else if (diffDays === 1) {
      // Check if all dailies were done yesterday
      const yesterday = lastDate.toISOString().split('T')[0];
      const { count } = await supabase
        .from('daily_completions')
        .select('*', { count: 'exact', head: true })
        .eq('completed_date', yesterday);
      
      const { count: totalDailies } = await supabase
        .from('daily_quests')
        .select('*', { count: 'exact', head: true });

      if (count < totalDailies) {
        newStreak = 0;
      }
    }

    const { data: updatedPlayer } = await supabase
      .from('player_state')
      .update({ 
        streak_days: newStreak, 
        last_active_date: today 
      })
      .eq('id', data.id)
      .select()
      .single();
    
    setPlayer(updatedPlayer);
  };

  const calculateLevel = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;
  const xpForNextLevel = (level) => Math.pow(level * 10, 2);

  const addXP = async (amount) => {
    if (!player) return;

    const streakMultiplier = Math.min(1 + (player.streak_days * 0.1), 3.0);
    const finalXP = Math.round(amount * streakMultiplier);
    const newXP = player.xp + finalXP;
    
    const oldLevel = calculateLevel(player.xp);
    const newLevel = calculateLevel(newXP);

    if (newLevel > oldLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 2000);
    }

    const { data } = await supabase
      .from('player_state')
      .update({ xp: newXP })
      .eq('id', player.id)
      .select()
      .single();
    
    setPlayer(data);
  };

  const addGold = async (amount) => {
    if (!player) return;
    const { data } = await supabase
      .from('player_state')
      .update({ gold: player.gold + amount })
      .eq('id', player.id)
      .select()
      .single();
    setPlayer(data);
  };

  const toggleDaily = async (questId) => {
    if (!player) return;
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = completions.includes(questId);

    if (isCompleted) {
      await supabase
        .from('daily_completions')
        .delete()
        .eq('quest_id', questId)
        .eq('completed_date', today);
    } else {
      const quest = dailies.find(q => q.id === questId);
      await supabase
        .from('daily_completions')
        .insert({ quest_id: questId, completed_date: today });
      
      await addXP(quest.xp_reward);
      await addGold(quest.gold_reward);

      // Check if all done
      const newCompletions = [...completions, questId];
      if (newCompletions.length === dailies.length) {
        setShowFullDayCleared(true);
        await addXP(100); // Bonus
        setTimeout(() => setShowFullDayCleared(false), 3000);
        
        // Increase streak if day just cleared
        const { data: updatedPlayer } = await supabase
          .from('player_state')
          .update({ streak_days: player.streak_days + 1 })
          .eq('id', player.id)
          .select()
          .single();
        setPlayer(updatedPlayer);
      }
    }
    await fetchCompletions();
  };

  const updateStats = async (stats) => {
    if (!player) return;
    const { data } = await supabase
      .from('player_state')
      .update(stats)
      .eq('id', player.id)
      .select()
      .single();
    setPlayer(data);
  };

  const value = {
    player,
    loading,
    dailies,
    completions,
    toggleDaily,
    addXP,
    addGold,
    updateStats,
    showLevelUp,
    showFullDayCleared,
    calculateLevel,
    xpForNextLevel
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => useContext(PlayerContext);
