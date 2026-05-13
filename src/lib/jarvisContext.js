import { supabase } from './supabase';

/**
 * Aggregates entire Player One state for AI Context
 */
export async function collectFullContext() {
  const todayDate = new Date().toISOString().split('T')[0];

  const timeoutPromise = new Promise(resolve => 
    setTimeout(() => resolve({ _timeout: true }), 8000)
  );

  const contextPromise = (async () => {
    try {
      const [
        playerRes,
        dailyCompletionsRes,
        allDailiesRes,
        activeQuestsRes,
        completedQuestsRes,
        settingsRes,
        subjectsRes,
        healthLogsRes,
        walletRes,
        brainLogsRes,
        tradesRes,
        sdeProgressRes
      ] = await Promise.all([
        supabase.from('player_state').select('*').single(),
        supabase.from('daily_completions').select('quest_id').eq('completed_date', todayDate),
        supabase.from('daily_quests').select('id, title, xp_reward'),
        supabase.from('quests').select('*').eq('completed', false).limit(5),
        supabase.from('quests').select('*').eq('completed', true).gte('completed_at', todayDate),
        supabase.from('settings').select('value').eq('key', 'exam_date').maybeSingle(),
        supabase.from('sem_subjects').select('*, semesters(target_cgpa, sgpa)').order('created_at'),
        supabase.from('health_logs').select('*').eq('log_date', todayDate).maybeSingle(),
        supabase.from('wallet').select('*').maybeSingle(),
        supabase.from('brain_logs').select('*').order('logged_at', { ascending: false }).limit(5),
        supabase.from('trades').select('*').order('date', { ascending: false }).limit(5),
        supabase.from('sde_progress').select('*').order('month_target', { ascending: true })
      ]);

      const playerData = playerRes?.data || null;
      const subjectsData = subjectsRes?.data || [];
      const healthData = healthLogsRes?.data || {};
      const sdeData = sdeProgressRes?.data || [];
      const walletData = walletRes?.data || null;
      const activeQuestsData = activeQuestsRes?.data || [];
      const completedQuestsData = completedQuestsRes?.data || [];
      const brainLogsData = brainLogsRes?.data || [];
      const tradesData = tradesRes?.data || [];

      // Format Exams
      const examDateStr = settingsRes?.data?.value;
      const exams = subjectsData.map(s => {
        const days = examDateStr ? Math.ceil((new Date(examDateStr) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
        // Estimate chapters from readiness (0-100)
        const total = 10;
        const completed = Math.floor((s.readiness || 0) / 10);
        return {
          subject: s.short_name || s.name,
          daysUntil: days,
          chaptersCompleted: completed,
          totalChapters: total
        };
      });

      // Calculate XP earned today from dailies
      const completedIds = new Set(dailyCompletionsRes?.data?.map(c => c.quest_id) || []);
      const xpFromDailies = (allDailiesRes?.data || [])
        .filter(q => completedIds.has(q.id))
        .reduce((sum, q) => sum + (q.xp_reward || 0), 0);

      // Format SDE
      const sdeSolvedToday = sdeData.filter(p => p.completed_at?.startsWith(todayDate)).length;
      
      const { data: memories } = await supabase
        .from('ai_sessions')
        .select('type, ai_response, user_input, session_date')
        .order('session_date', { ascending: false })
        .limit(20)

      const memorySnapshot = (memories || []).map(m => ({
        date: m.session_date,
        type: m.type,
        summary: m.ai_response?.substring(0, 200),
        userInput: m.user_input?.substring(0, 100)
      }))

      return {
        player: playerData ? {
          level: playerData.level || 1,
          xp: playerData.xp || 0,
          totalXp: (playerData.level || 1) * 1000,
          streak: playerData.streak_days || 0,
          walletBalance: Math.floor((walletData?.balance_paise || 0) / 100),
          cgpa: subjectsData[0]?.semesters?.sgpa || subjectsData[0]?.semesters?.target_cgpa || 9.0,
          username: "Abhishek"
        } : null,
        today: {
          date: todayDate,
          dayOfWeek: new Date().toLocaleDateString('en-IN', { weekday: 'long' }),
          completedQuests: dailyCompletionsRes?.data?.length || 0,
          totalQuests: allDailiesRes?.data?.length || 7,
          xpEarnedToday: xpFromDailies
        },
        exams: exams,
        quests: {
          active: activeQuestsData.map(q => q.title),
          completed: completedQuestsData.map(q => q.title)
        },
        wallet: {
          balance: Math.floor((walletData?.balance_paise || 0) / 100),
          recentTransactions: []
        },
        sde: {
          currentChapter: sdeData.find(d => !d.completed)?.title || 'Recursion',
          problemsSolvedToday: sdeSolvedToday,
          problemsSolvedTotal: sdeData.filter(p => p.completed).length,
          currentStreak: playerData?.streak_days || 0
        },
        brainLogs: brainLogsData.map(b => ({
          content: b.topic || b.subject_area,
          createdAt: b.logged_at
        })),
        trades: tradesData.map(t => ({
          pair: t.pair,
          direction: t.type || t.direction,
          result: (t.pnl || 0) > 0 ? 'WIN' : 'LOSS',
          pnl: t.pnl || 0,
          date: t.date,
          notes: t.notes
        })),
        health: {
          workoutDoneToday: !!healthData?.gym_done,
          workoutType: healthData?.workout_type || 'General',
          currentStreak: playerData?.streak_days || 0,
          lastWorkout: healthData?.log_date
        },
        recentMemory: memorySnapshot
      };
    } catch (err) {
      console.error('Inner fetch error:', err);
      throw err;
    }
  })();

  try {
    const result = await Promise.race([contextPromise, timeoutPromise]);
    if (result._timeout) {
      console.warn('JARVIS context fetch timed out — returning partial context');
      return {
        player: null,
        today: { date: todayDate, completedQuests: 0, totalQuests: 0, xpEarnedToday: 0 },
        exams: [],
        quests: { active: [], completed: [] },
        wallet: { balance: 0, recentTransactions: [] },
        sde: {},
        brainLogs: [],
        trades: [],
        health: {},
        recentMemory: []
      };
    }
    return result;
  } catch (err) {
    console.error('Error collecting JARVIS context:', err);
    return {
      player: null,
      today: { date: new Date().toISOString().split('T')[0], completedQuests: 0, totalQuests: 0, xpEarnedToday: 0 },
      exams: [],
      quests: { active: [], completed: [] },
      wallet: { balance: 0, recentTransactions: [] },
      sde: {},
      brainLogs: [],
      trades: [],
      health: {},
      recentMemory: []
    };
  }
}

