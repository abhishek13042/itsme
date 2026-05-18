import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { SDE_TRACK_DATA } from '../lib/sdeTrackData'
import { getTodayIST } from '../lib/dateUtils'

const getChaptersList = (progressMap) => {
  const list = []
  SDE_TRACK_DATA.phases.forEach(phase => {
    phase.sections.forEach(sec => {
      if (phase.id === 'DSA') {
        sec.subsections?.forEach(sub => {
          sub.problems?.forEach(problem => {
            const prog = progressMap[problem.id] || {}
            list.push({
              chapter_id: problem.id,
              title: problem.title,
              category: phase.id,
              completed: prog.done || false,
              completed_at: prog.completedAt || null,
              notes: prog.notes || ''
            })
          })
        })
      } else {
        sec.topics?.forEach(topic => {
          const prog = progressMap[topic.id] || {}
          list.push({
            chapter_id: topic.id,
            title: topic.title,
            category: phase.id,
            completed: prog.done || false,
            completed_at: prog.completedAt || null,
            notes: prog.notes || ''
          })
        })
      }
    })
  })
  return list
}

const getLocalWeeklyGoal = (weekNumber, dsaSolved) => {
  const dsaPercent = Math.min(100, Math.floor((dsaSolved / 474) * 100))
  let focus = 'Step 3 — Solve Problems on Arrays [Easy -> Medium]'
  let dsaProblemsTarget = 15
  let dailyBreakdown = []
  let leetcodeTip = 'Use two-pointer technique for O(1) space optimization.'
  let weeklyDeliverable = 'Solve at least 15 Array problems and document optimal space-time complexities.'
  let nextWeekPreview = 'Moving onto Binary Search & Sorting techniques.'

  if (weekNumber === 1) {
    focus = 'Step 1 & 2 — Learn the Basics & Logical Thinking'
    dsaProblemsTarget = 15
    weeklyDeliverable = 'Understand basic syntax, loops, and print all basic star patterns.'
    leetcodeTip = 'Focus on understanding space and time complexity before writing code.'
    nextWeekPreview = 'Step 3: Mastering Arrays (Easy and Medium).'
    dailyBreakdown = [
      { day: 'Monday', dsa_task: 'Basic syntax, input/output & standard library templates', secondary_task: '', hours: 2 },
      { day: 'Tuesday', dsa_task: 'Patterns (Lec 1.3 Patterns 1-10)', secondary_task: '', hours: 2 },
      { day: 'Wednesday', dsa_task: 'Time & Space Complexity theory, basic recursion', secondary_task: '', hours: 2 },
      { day: 'Thursday', dsa_task: 'Hashing, basic maps & frequencies', secondary_task: '', hours: 2 },
      { day: 'Friday', dsa_task: 'Step 2: Sorting techniques (Selection, Bubble, Insertion)', secondary_task: '', hours: 2 },
      { day: 'Saturday', dsa_task: 'Merge Sort and Quick Sort recursion details', secondary_task: '', hours: 3 },
      { day: 'Sunday', dsa_task: 'Weekly review: Solve 5 practice problems', secondary_task: '', hours: 3 }
    ]
  } else if (weekNumber === 2) {
    focus = 'Step 3 — Arrays (Easy & Medium problems)'
    dsaProblemsTarget = 15
    weeklyDeliverable = 'Complete 15 array problems, including Kadanes Algorithm & Two-Sum.'
    leetcodeTip = 'Always analyze the brute force approach, then optimize with HashMaps or Two Pointers.'
    nextWeekPreview = 'Arrays Hard Problems & basic 2D Matrices.'
    dailyBreakdown = [
      { day: 'Monday', dsa_task: 'Arrays Easy: Largest, Second Largest, check if sorted', secondary_task: '', hours: 2 },
      { day: 'Tuesday', dsa_task: 'Remove duplicates, rotate array by K places', secondary_task: '', hours: 2 },
      { day: 'Wednesday', dsa_task: 'Move zeros, Union of two sorted arrays', secondary_task: '', hours: 2 },
      { day: 'Thursday', dsa_task: 'Arrays Medium: Two Sum, Sort 0s, 1s, 2s (Dutch National Flag)', secondary_task: '', hours: 2 },
      { day: 'Friday', dsa_task: 'Majority Element (>N/2), Kadanes Algorithm (Max Subarray)', secondary_task: '', hours: 2 },
      { day: 'Saturday', dsa_task: 'Best time to buy/sell stock, Rearrange array elements', secondary_task: '', hours: 3 },
      { day: 'Sunday', dsa_task: 'Weekly revision of Dutch National Flag and Kadane algorithms', secondary_task: '', hours: 3 }
    ]
  } else if (weekNumber === 3) {
    focus = 'Step 3 — Arrays (Hard problems) & Step 4 — Binary Search'
    dsaProblemsTarget = 15
    weeklyDeliverable = 'Solve 3-Sum, 4-Sum, and basic Binary Search.'
    leetcodeTip = 'In Binary Search, identify the search space (low, high) and how to discard half.'
    nextWeekPreview = 'Binary Search on Answers and Advanced String manipulation.'
    dailyBreakdown = [
      { day: 'Monday', dsa_task: 'Arrays Hard: 3-Sum and 4-Sum problems', secondary_task: '', hours: 2 },
      { day: 'Tuesday', dsa_task: 'Merge overlapping intervals, find missing & repeating numbers', secondary_task: '', hours: 2 },
      { day: 'Wednesday', dsa_task: 'Step 4: BS on 1D arrays: lower/upper bound, search insert position', secondary_task: '', hours: 2 },
      { day: 'Thursday', dsa_task: 'Search in rotated sorted array, search in rotated sorted with duplicates', secondary_task: '', hours: 2 },
      { day: 'Friday', dsa_task: 'Find minimum in rotated sorted, single element in sorted array', secondary_task: '', hours: 2 },
      { day: 'Saturday', dsa_task: 'Find peak element, square root of integer using BS', secondary_task: '', hours: 3 },
      { day: 'Sunday', dsa_task: 'Weekly test: Solve 4 advanced binary search problems', secondary_task: '', hours: 3 }
    ]
  } else if (weekNumber === 4) {
    focus = 'Step 4 — BS on Answers & Step 5 — Strings'
    dsaProblemsTarget = 12
    weeklyDeliverable = 'Complete Book Allocation, Koko Eating Bananas, and basic Strings.'
    leetcodeTip = 'Use sliding window or string traversal with ascii mapping for string problems.'
    nextWeekPreview = 'Step 6: Linked Lists (Singly & Doubly).'
    dailyBreakdown = [
      { day: 'Monday', dsa_task: 'BS on Answers: Koko eating bananas, minimum days to make bouquets', secondary_task: 'Start Python syntax if DSA > 250', hours: 2 },
      { day: 'Tuesday', dsa_task: 'Allocate books, split array largest sum', secondary_task: 'Python basic variables & flow control', hours: 2 },
      { day: 'Wednesday', dsa_task: 'Step 5: String Easy: reverse, outer parentheses, largest odd', secondary_task: 'Python lists & tuples operations', hours: 2 },
      { day: 'Thursday', dsa_task: 'String Medium: Roman to Int, Int to Roman', secondary_task: 'Python dictionaries & sets', hours: 2 },
      { day: 'Friday', dsa_task: 'Longest common prefix, isomorphic strings', secondary_task: 'Python OOP basics & classes', hours: 2 },
      { day: 'Saturday', dsa_task: 'Valid anagram, sort characters by frequency', secondary_task: 'Python file handling', hours: 3 },
      { day: 'Sunday', dsa_task: 'Implement basic calculator & string matching tests', secondary_task: 'Python exception handling review', hours: 3 }
    ]
  } else {
    focus = `Step ${Math.min(18, 5 + Math.floor(weekNumber / 2))} — Advanced DSA Topics`
    dsaProblemsTarget = 15
    weeklyDeliverable = `Advance 15 more topics/problems in Step ${Math.min(18, 5 + Math.floor(weekNumber / 2))}`
    leetcodeTip = 'Map out recurrence relations before writing dynamic programming or recursion.'
    nextWeekPreview = 'Moving onto advanced backend integration and microservices.'
    
    let secTask = ''
    if (dsaSolved >= 250 && dsaSolved < 350) secTask = 'Python Async, FastAPI basic routing'
    else if (dsaSolved >= 350) secTask = 'Backend focus: PostgreSQL index design, Redis cache strategy'
    
    dailyBreakdown = [
      { day: 'Monday', dsa_task: 'Solve 2 problems from active Step', secondary_task: secTask, hours: 2 },
      { day: 'Tuesday', dsa_task: 'Solve 2 problems from active Step', secondary_task: secTask, hours: 2 },
      { day: 'Wednesday', dsa_task: 'Solve 2 problems from active Step', secondary_task: secTask, hours: 2 },
      { day: 'Thursday', dsa_task: 'Solve 2 problems from active Step', secondary_task: secTask, hours: 2 },
      { day: 'Friday', dsa_task: 'Solve 2 problems from active Step', secondary_task: secTask, hours: 2 },
      { day: 'Saturday', dsa_task: 'Solve 3 problems from active Step', secondary_task: secTask, hours: 3 },
      { day: 'Sunday', dsa_task: 'Weekly review of advanced data structures', secondary_task: secTask, hours: 3 }
    ]
  }

  return {
    week_title: `SDE Prep: Week ${weekNumber}`,
    dsa_focus: focus,
    dsa_problems_target: dsaProblemsTarget,
    daily_breakdown: dailyBreakdown,
    leetcode_tip: leetcodeTip,
    weekly_deliverable: weeklyDeliverable,
    next_week_preview: nextWeekPreview
  }
}

export const useSdeStore = create((set, get) => ({
  progress: {},
  chapters: [],
  dsaSolved: 0,
  expandedTopic: null,
  isLoadingProgress: false,
  weeklyGoals: [],
  currentSdeWeek: 1,
  isGeneratingGoals: false,
  loading: false,
  lastLoaded: null,

  loadRoadmap: async (force = false) => {
    if (!force && get().lastLoaded && 
      Date.now() - get().lastLoaded < 120000) return
    set({ isLoadingProgress: true })
    try {
      const { data: progressData } = await supabase
        .from('sde_progress')
        .select('*')
      
      const progressMap = {}
      ;(progressData || []).forEach(row => {
        progressMap[row.topic_id] = {
          done: row.completed,
          completedAt: row.completed_at,
          notes: row.notes || ''
        }
      })

      const { data: playerData } = await supabase
        .from('player_state')
        .select('dsa_solved')
        .single()

      const chaptersList = getChaptersList(progressMap)

      set({
        progress: progressMap,
        chapters: chaptersList,
        dsaSolved: playerData?.dsa_solved || 0,
        isLoadingProgress: false,
        lastLoaded: Date.now()
      })
    } catch (err) {
      console.error('loadRoadmap error:', err)
      set({ isLoadingProgress: false })
    }
  },

  toggleTopic: async (topicId, topicTitle, phaseId) => {
    const current = get().progress[topicId]?.done || false
    const newVal = !current
    
    // Optimistic
    const newProgress = {
      ...get().progress,
      [topicId]: { 
        ...get().progress[topicId],
        done: newVal,
        completedAt: newVal ? getTodayIST() : null
      }
    }
    set({
      progress: newProgress,
      chapters: getChaptersList(newProgress)
    })

    try {
      await supabase.from('sde_progress').upsert({
        topic_id: topicId,
        topic_title: topicTitle || topicId,
        category: phaseId,
        completed: newVal,
        completed_at: newVal ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'topic_id' })
    } catch (err) {
      // Rollback
      const rollbackProgress = {
        ...get().progress,
        [topicId]: { 
          ...get().progress[topicId], 
          done: current 
        }
      }
      set({
        progress: rollbackProgress,
        chapters: getChaptersList(rollbackProgress)
      })
      console.error('toggleTopic error:', err)
    }
  },

  updateDsaSolved: async (count) => {
    set({ dsaSolved: count })
    try {
      await supabase
        .from('player_state')
        .update({ dsa_solved: count })
        .neq('id', '00000000-0000-0000-0000-000000000000')
    } catch (err) {
      console.error('updateDsaSolved error:', err)
    }
  },

  saveNotes: async (topicId, notes) => {
    const newProgress = {
      ...get().progress,
      [topicId]: { ...(get().progress[topicId] || {}), notes }
    }
    set({
      progress: newProgress,
      chapters: getChaptersList(newProgress)
    })
    try {
      await supabase.from('sde_progress')
        .update({ notes })
        .eq('topic_id', topicId)
    } catch (err) {
      console.error('saveNotes error:', err)
    }
  },

  generateSdeWeekGoals: async (weekNumber) => {
    set({ isGeneratingGoals: true })
    try {
      const { dsaSolved } = get()
      const dsaPercent = Math.min(100, 
        Math.floor((dsaSolved / 474) * 100))
      
      let parsed = null
      try {
        const { callGroq } = await import('../lib/groq')
        const result = await callGroq({
          messages: [{
            role: 'user',
            content: `Generate a specific weekly SDE study plan for 
            Abhishek — 20-year-old Indian CSE student, IIIT Nagpur.
            
            DSA Status: ${dsaSolved}/474 problems solved (${dsaPercent}%)
            Current SDE Week: ${weekNumber}
            
            Priority rules:
            - If DSA < 250: DSA is ONLY focus. 1.5 hours daily on Striver A2Z.
            - If DSA 250-350: DSA 1hr daily + can start Python.
            - If DSA > 350: DSA 45min daily + Backend focus.
            
            Return ONLY valid JSON:
            {
              "week_title": "punchy 5-word title",
              "dsa_focus": "which Striver A2Z step to focus on this week",
              "dsa_problems_target": 15,
              "daily_breakdown": [
                {
                  "day": "Monday",
                  "dsa_task": "specific problems/topics from Striver",
                  "secondary_task": "Python or Backend topic if unlocked",
                  "hours": 3
                }
              ],
              "leetcode_tip": "one specific technique to master this week",
              "weekly_deliverable": "concrete thing done by Sunday",
              "next_week_preview": "one line"
            }
            Generate all 7 days.`
          }],
          max_tokens: 1200,
          temperature: 0.7
        })

        if (result && !result.error && result.text) {
          const clean = result.text.replace(/```json|```/g, '').trim()
          parsed = JSON.parse(clean)
        } else {
          console.warn('callGroq failed or returned error, using premium local fallback:', result?.error)
          parsed = getLocalWeeklyGoal(weekNumber, dsaSolved)
        }
      } catch (innerErr) {
        console.warn('callGroq threw an error, using premium local fallback:', innerErr)
        parsed = getLocalWeeklyGoal(weekNumber, dsaSolved)
      }

      // Try to save to Supabase database, failing gracefully if unconfigured
      let saved = null
      try {
        const { data, error } = await supabase
          .from('ai_sessions')
          .insert({
            type: 'sde_weekly_goals',
            session_date: getTodayIST(),
            user_input: `week:${weekNumber}`,
            ai_response: JSON.stringify(parsed),
            context_snapshot: JSON.stringify({ 
              weekNumber, dsaSolved 
            })
          })
          .select()
          .single()
        if (!error && data) {
          saved = data
        }
      } catch (dbErr) {
        console.error('Graceful database skip in generateSdeWeekGoals:', dbErr)
      }

      set(state => ({
        weeklyGoals: [{
          week_number: weekNumber,
          goal_text: JSON.stringify(parsed),
          completed: false,
          id: saved?.id || `local-sde-week-${weekNumber}`
        }, ...(state.weeklyGoals || [])],
        currentSdeWeek: weekNumber,
        isGeneratingGoals: false
      }))
    } catch (err) {
      console.error('generateSdeWeekGoals root error:', err)
      set({ isGeneratingGoals: false })
    }
  },

  loadSdeWeeklyGoals: async () => {
    try {
      const { data } = await supabase
        .from('ai_sessions')
        .select('id, ai_response, context_snapshot, session_date')
        .eq('type', 'sde_weekly_goals')
        .order('session_date', { ascending: false })
        .limit(10)
      
      const goals = (data || []).map(row => ({
        id: row.id,
        goal_text: row.ai_response,
        week_number: (() => {
          try {
            return JSON.parse(row.context_snapshot).weekNumber || 1
          } catch { return 1 }
        })(),
        completed: false
      }))

      const latestGoalWeek = goals[0] ? goals[0].week_number : 1
      set({ weeklyGoals: goals, currentSdeWeek: latestGoalWeek })
      
      if (goals.length === 0) {
        await get().generateSdeWeekGoals(1)
      }
    } catch (dbErr) {
      console.error('loadSdeWeeklyGoals error (bypass to local week 1):', dbErr)
      set({ weeklyGoals: [], currentSdeWeek: 1 })
      await get().generateSdeWeekGoals(1)
    }
  }
}))
