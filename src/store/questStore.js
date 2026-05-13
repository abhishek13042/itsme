import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { completeQuest, completeBossTask, getBossStatus, checkWeeklyBonus } from '../lib/questEngine';
import { triggerJarvisToast } from '../components/JarvisToast';
import { getJarvisLine } from '../lib/jarvisReactions';

export const useQuestStore = create((set, get) => ({
  activeQuests: [],
  completedQuests: [],
  dailyQuests: [],
  todayCompletions: [],
  questClusters: [],
  isGeneratingClusters: false,
  clustersGeneratedAt: null,
  clustersApproved: false,
  boss: null,
  bossTasks: [],
  hpPercent: 0,
  isBossDefeated: false,
  weeklyProgress: 0,
  penalties: [],
  loading: false,
  isLoading: false,
  recentlyDeleted: [],
  deleteTimeouts: {},
  lastLoaded: null,
  lastDailiesLoaded: null,

  loadQuests: async (force = false) => {
    if (!force && get().lastLoaded && Date.now() - get().lastLoaded < 120000) return;
    set({ loading: true, isLoading: true });
    try {
      const { data: allQuests, error } = await supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const active = allQuests?.filter(q => !q.completed) || [];
      const completed = allQuests?.filter(q => q.completed) || [];

      set({
        activeQuests: active, 
        completedQuests: completed,
        loading: false,
        isLoading: false,
        lastLoaded: Date.now()
      });
    } catch (err) {
      console.error('Failed to load quests:', err);
      set({ loading: false, isLoading: false });
    }
  },

  loadPenalties: async () => {
    try {
      const { data } = await supabase
        .from('penalties')
        .select('*')
        .order('created_at', { ascending: false });
      set({ penalties: data || [] });
    } catch (err) {
      console.error('Failed to load penalties:', err);
    }
  },

  loadBoss: async () => {
    try {
      const status = await getBossStatus();
      set({
        boss: status.boss,
        bossTasks: status.tasks,
        hpPercent: status.hpPercent,
        isBossDefeated: status.isDefeated
      });
    } catch (err) {
      console.error('Failed to load boss status:', err);
    }
  },

  completeQuest: async (questId) => {
    try {
      const result = await completeQuest(questId);
      await get().loadQuests(); // Refresh lists and weekly progress
      return result;
    } catch (err) {
      console.error('Failed to complete quest:', err);
      throw err;
    }
  },

  completeBossTask: async (taskId) => {
    try {
      const result = await completeBossTask(taskId);
      await get().loadBoss(); // Refresh HP and defeat status
      return result;
    } catch (err) {
      console.error('Failed to complete boss task:', err);
      throw err;
    }
  },

  loadDailyQuests: async (force = false) => {
    if (!force && get().lastDailiesLoaded && Date.now() - get().lastDailiesLoaded < 120000) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: dailies } = await supabase.from('daily_quests').select('*').eq('is_active', true);
      const { data: completions } = await supabase
        .from('daily_completions')
        .select('*, daily_quests(title, xp_reward, domain)')
        .eq('completed_date', today);
      
      set({ 
        dailyQuests: dailies || [], 
        todayCompletions: completions?.map(c => ({
          ...c,
          quest_title: c.daily_quests?.title,
          xp_reward: c.daily_quests?.xp_reward,
          domain: c.daily_quests?.domain
        })) || [],
        lastDailiesLoaded: Date.now()
      });
    } catch (err) {
      console.error('Failed to load daily quests:', err);
    }
  },

  completeDaily: async (questId) => {
    const previousCompletions = [...get().todayCompletions];
    
    // Optimistic Update
    set(state => ({
      todayCompletions: [...state.todayCompletions, questId]
    }));

    try {
      const { completeDailyQuest } = await import('../lib/questEngine');
      const result = await completeDailyQuest(questId);

      if (!result.success) {
        // Rollback
        set({ todayCompletions: previousCompletions });
        throw new Error(result.error);
      }

      // Refresh data
      await get().loadDailyQuests();

      // Fire toast
      const quest = get().dailyQuests.find(q => q.id === questId);
      const allDone = get().todayCompletions.length >= get().dailyQuests.length;

      if (allDone) {
        // All quests done — big moment
        triggerJarvisToast({
          type: 'success',
          title: 'ALL MISSIONS COMPLETE',
          xp: result.xpAwarded || quest?.xp_reward || 100,
          message: 'Every quest done. Legendary.',
          duration: 5000
        });
        // Get JARVIS line async and update toast
        getJarvisLine('all_quests_done', { 
          total: get().dailyQuests.length 
        }).then(line => {
          if (line) triggerJarvisToast({
            type: 'success',
            title: 'ALL MISSIONS COMPLETE',
            xp: result.xpAwarded || 100,
            jarvisLine: line,
            duration: 5000
          });
        });
      } else {
        // Single quest done
        triggerJarvisToast({
          type: 'xp',
          title: quest?.domain || 'QUEST',
          xp: quest?.xp_reward || 100,
          message: quest?.title || 'Quest complete',
          duration: 3500
        });
        getJarvisLine('quest_complete', { 
          title: quest?.title, 
          xp: quest?.xp_reward 
        }).then(line => {
          if (line) triggerJarvisToast({
            type: 'xp',
            title: quest?.domain || 'QUEST',
            xp: quest?.xp_reward || 100,
            jarvisLine: line,
            duration: 3500
          });
        });
      }

      return result;
    } catch (err) {
      console.error('Failed to complete daily:', err);
      set({ todayCompletions: previousCompletions });
      throw err;
    }
  },

  addDailyQuest: async (quest) => {
    try {
      const { data, error } = await supabase
        .from('daily_quests')
        .insert([{ ...quest, is_active: true }])
        .select()
        .single();
      
      if (error) throw error;
      set(state => ({ dailyQuests: [data, ...state.dailyQuests] }));
      return data;
    } catch (err) {
      console.error('Failed to add daily quest:', err);
      throw err;
    }
  },

  deleteDailyQuest: async (questId) => {
    // Optimistic: remove from UI
    const deletedQuest = get().dailyQuests.find(q => q.id === questId)
    set(state => ({
      dailyQuests: state.dailyQuests.filter(q => q.id !== questId),
      recentlyDeleted: [...(state.recentlyDeleted || []), deletedQuest]
    }))

    // Show undo toast for 5 seconds before actual delete
    triggerJarvisToast({
      type: 'warning',
      title: 'Quest Deleted',
      message: 'Tap to undo',
      duration: 5000,
      onAction: () => get().undoDelete(questId)
    })

    const deleteTimeout = setTimeout(async () => {
      await supabase.from('daily_quests').delete().eq('id', questId)
      set(state => ({
        recentlyDeleted: state.recentlyDeleted.filter(q => q.id !== questId)
      }))
    }, 5000)

    // Store timeout reference
    set(state => ({
      deleteTimeouts: { 
        ...(state.deleteTimeouts || {}), 
        [questId]: deleteTimeout 
      }
    }))
  },

  undoDelete: (questId) => {
    const { recentlyDeleted, deleteTimeouts } = get()
    
    // Cancel the timeout
    if (deleteTimeouts?.[questId]) {
      clearTimeout(deleteTimeouts[questId])
    }
    
    // Restore to UI
    const quest = recentlyDeleted?.find(q => q.id === questId)
    if (quest) {
      set(state => ({
        dailyQuests: [...state.dailyQuests, quest],
        recentlyDeleted: state.recentlyDeleted.filter(q => q.id !== questId),
        deleteTimeouts: Object.fromEntries(
          Object.entries(state.deleteTimeouts || {})
            .filter(([k]) => k !== questId)
        )
      }))
    }
  },

  loadQuestClusters: async () => {
    try {
      const { supabase } = await import('../lib/supabase')
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('quest_clusters')
        .select('*')
        .eq('cluster_date', today)
        .order('domain')
      set({ 
        questClusters: data || [],
        clustersApproved: data?.some(c => c.approved) || false,
        clustersGeneratedAt: data?.[0]?.created_at || null
      })
    } catch (err) {
      console.error('loadQuestClusters error:', err)
    }
  },

  generateQuestClusters: async (contextData) => {
    set({ isGeneratingClusters: true })
    try {
      const today = new Date().toISOString().split('T')[0]
      const gymStartDate = new Date('2026-06-16')
      const daysUntilGym = Math.max(0, 
        Math.ceil((gymStartDate - new Date()) / (1000 * 60 * 60 * 24))
      )
      const gymStarted = new Date() >= gymStartDate

      const prompt = `You are the quest engine for PLAYER ONE — 
      Abhishek's personal life RPG. Generate a full day of 
      personalized quest clusters for him.

      WHO HE IS:
      - Abhishek, 20yo CSE student at IIIT Nagpur, Semester 4-6
      - First-generation college student, lower CGPA, going off-campus
      - Vegetarian + eggs (no meat, no fish)
      - Forex trader (GBPUSD, EURUSD, XAUUSD) using ICT/SMC framework
      - Starts gym on June 16 — ${gymStarted ? 'GYM HAS STARTED' : 
        `${daysUntilGym} days until gym`}
      - Building PLAYER ONE (React+Vite+Supabase) as main project
      - Following AI Engineer track: Deep Learning → NLP → CV
      - Uses Striver's A2Z for DSA
      - Physical journaling before trades
      - Explorer mindset — Psychology, Neuroscience, Geopolitics

      TODAY'S CONTEXT:
      - Level: ${contextData?.level || 1}
      - Streak: ${contextData?.streak || 0} days
      - DSA problems solved: ${contextData?.dsaSolved || 0}
      - SDE chapters done: ${contextData?.chaptersCompleted || 0}
      - Health score yesterday: ${contextData?.lastHealthScore || 0}%
      - Gym done today: ${contextData?.gymDone ? 'Yes' : 'No'}
      - Today's completions so far: ${contextData?.completedToday || 0}
      - Wallet: ₹${contextData?.wallet || 0}

      Generate exactly 5 quest clusters. Each cluster is a themed 
      group of 2-4 micro-quests under one domain.

      Rules for quest generation:
      - Make quests SPECIFIC and ACTIONABLE — not "study DSA" 
        but "Solve 2 LeetCode medium sliding window problems"
      - Each quest should take 20-90 minutes max
      - Reference his actual situation (exam mode, gym start date,
        vegetarian protein, PLAYER ONE development, etc.)
      - Difficulty curve: first 2 clusters easy/medium, 
        last cluster hard
      - One cluster must always be health/habit focused
      - One cluster must be SDE/DSA focused
      - One cluster can be Explorer/learning focused
      - XP rewards: Easy 50, Medium 100, Hard 200

      Return ONLY valid JSON, no markdown, no backticks:
      [
        {
          "cluster_name": "short punchy cluster name (3-4 words)",
          "domain": "SDE|Trading|Health|Exam|Explorer|General|Finance",
          "theme": "one sentence describing the cluster's goal today",
          "color": "#hex color from: #1A1A2E #E07B39 #1A6B4A #C0392B #7C3AED #9A9590",
          "icon": "single emoji representing this cluster",
          "quests": [
            {
              "title": "specific actionable quest title (max 8 words)",
              "description": "what exactly to do — specific and measurable",
              "xp_reward": 50,
              "difficulty": "Easy|Medium|Hard",
              "time_estimate": "20 min"
            }
          ],
          "total_xp": sum of all quest xp in this cluster,
          "why_today": "one sentence — why this cluster matters specifically today for Abhishek"
        }
      ]

      Generate exactly 5 clusters with 2-4 quests each.`

      const { callGroq } = await import('../lib/groq')
      const result = await callGroq({ 
        messages: [{ role: 'user', content: prompt }], 
        max_tokens: 2000,
        temperature: 0.85
      })
      const raw = result.text
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const clusters = JSON.parse(cleaned)

      // Save to Supabase
      const { supabase } = await import('../lib/supabase')
      const { data: saved } = await supabase
        .from('quest_clusters')
        .insert(clusters.map(c => ({
          cluster_date: today,
          cluster_name: c.cluster_name,
          domain: c.domain,
          theme: c.theme,
          quests: c.quests.map(q => ({ 
            ...q, 
            color: c.color, 
            icon: c.icon,
            why_today: c.why_today,
            cluster_name: c.cluster_name
          })),
          total_xp: c.total_xp,
          approved: false
        })))
        .select()

      set({
        questClusters: saved || [],
        isGeneratingClusters: false,
        clustersGeneratedAt: new Date().toISOString(),
        clustersApproved: false
      })

      // Fire reaction toast
      try {
        const { triggerJarvisToast } = await import(
          '../components/JarvisToast'
        )
        const { getJarvisLine } = await import('../lib/jarvisReactions')
        triggerJarvisToast({
          type: 'info',
          title: 'MISSIONS READY',
          message: `${clusters.length} quest clusters generated.`,
          duration: 3500
        })
        getJarvisLine('quest_cluster_generated', { 
          count: clusters.length 
        }).then(line => {
          if (line) triggerJarvisToast({
            type: 'info',
            title: 'MISSIONS READY',
            jarvisLine: line,
            duration: 3500
          })
        })
      } catch (e) {}

      return saved || []
    } catch (err) {
      console.error('generateQuestClusters error:', err)
      set({ isGeneratingClusters: false })
      return []
    }
  },

  approveCluster: async (clusterId) => {
    try {
      const { supabase } = await import('../lib/supabase')
      const cluster = get().questClusters.find(c => c.id === clusterId)
      if (!cluster) return

      // Add each quest in the cluster to daily_quests
      const questsToAdd = cluster.quests.map(q => ({
        title: q.title,
        description: q.description,
        xp_reward: q.xp_reward,
        domain: cluster.domain,
        difficulty: q.difficulty,
        is_active: true,
        source: 'jarvis',
        cluster_id: clusterId
      }))

      for (const quest of questsToAdd) {
        await supabase.from('daily_quests').insert([quest])
      }

      // Mark cluster as approved
      await supabase
        .from('quest_clusters')
        .update({ approved: true, approved_at: new Date().toISOString() })
        .eq('id', clusterId)

      // Update local state
      set(state => ({
        questClusters: state.questClusters.map(c => 
          c.id === clusterId ? { ...c, approved: true } : c
        ),
        clustersApproved: true
      }))

      // Reload daily quests
      await get().loadDailyQuests(true)

    } catch (err) {
      console.error('approveCluster error:', err)
    }
  },

  approveAllClusters: async () => {
    const unapproved = get().questClusters.filter(c => !c.approved)
    for (const cluster of unapproved) {
      await get().approveCluster(cluster.id)
    }
  }
}));
