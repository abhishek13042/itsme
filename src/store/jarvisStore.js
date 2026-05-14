import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { callGroq } from '../lib/groq';
import { buildSystemPrompt } from '../lib/jarvisPrompt';
import { getTodayIST } from '../lib/dateUtils';
import { triggerJarvisToast } from '../components/JarvisToast';
import { detectMood, getMoodAdjustment, saveMoodLog } from '../lib/moodDetector';
import { extractAndSaveFromResponse, MEMORY_TYPES } from '../lib/globalMemory'

export const useJarvisStore = create((set, get) => ({
  // --- STATE ---
  chatHistory: [],           // array of {id, role: 'user'|'jarvis', text, timestamp}
  morningBrief: null,        // string or null
  eveningReview: null,       // string or null
  generatedQuests: [],       // array of {title, xp, domain, difficulty, description}
  isGenerating: false,       // boolean
  voiceEnabled: localStorage.getItem('jarvis_voice_enabled') === 'true',
  playerContext: null,       // stores the last fetched context object
  briefGeneratedAt: null,    // ISO string timestamp
  isStreaming: false,
  streamingContent: '',
  todayIntention: '',
  intentionSaved: false,
  isLoadingIntention: false,
  currentMood: 'neutral',
  moodHistory: [],

  // --- ACTIONS ---

  toggleVoice: () => {
    const newState = !get().voiceEnabled;
    localStorage.setItem('jarvis_voice_enabled', newState);
    set({ voiceEnabled: newState });
  },

  setPlayerContext: (context) => {
    set({ playerContext: context });
  },

  clearChat: () => {
    set({ chatHistory: [] });
  },

  loadTodaySessions: async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('ai_sessions')
      .select('*')
      .eq('session_date', today)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load Jarvis sessions:', error);
      return;
    }

    if (data) {
      const morning = data.find(s => s.type === 'morning_brief');
      const evening = data.find(s => s.type === 'evening_review');
      
      const history = data
        .filter(s => s.type === 'conversation')
        .map(s => ([
          {
            id: s.id + '_u',
            role: 'user',
            text: s.user_input,
            timestamp: s.created_at
          },
          {
            id: s.id + '_j',
            role: 'jarvis',
            text: typeof s.ai_response === 'string' ? s.ai_response : (s.ai_response?.response || s.ai_response?.text || JSON.stringify(s.ai_response)),
            timestamp: s.created_at
          }
        ]))
        .flat();

      set({ 
        morningBrief: morning ? (typeof morning.ai_response === 'string' ? morning.ai_response : JSON.stringify(morning.ai_response)) : null,
        eveningReview: evening ? (typeof evening.ai_response === 'string' ? evening.ai_response : JSON.stringify(evening.ai_response)) : null,
        chatHistory: history,
        briefGeneratedAt: morning ? morning.created_at : null
      });
    }
  },

  loadTodayIntention: async () => {
    const today = getTodayIST()
    const { data } = await supabase
      .from('ai_sessions')
      .select('user_input')
      .eq('type', 'daily_intention')
      .eq('session_date', today)
      .single()
    if (data?.user_input) {
      set({ 
        todayIntention: data.user_input, 
        intentionSaved: true 
      })
    }
  },

  saveIntention: async (text) => {
    if (!text.trim()) return
    const today = getTodayIST()
    
    // Check if already saved today
    const { data: existing } = await supabase
      .from('ai_sessions')
      .select('id')
      .eq('type', 'daily_intention')
      .eq('session_date', today)
      .single()

    if (existing) {
      await supabase
        .from('ai_sessions')
        .update({ user_input: text })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('ai_sessions')
        .insert({
          type: 'daily_intention',
          session_date: today,
          user_input: text,
          ai_response: '',
          context_snapshot: '{}'
        })
    }
    set({ todayIntention: text, intentionSaved: true })
    triggerJarvisToast({
      type: 'success',
      title: 'Intention Set',
      message: text.substring(0, 50),
      jarvisLine: 'Locked in. Now execute.'
    })
  },

  sendMessage: async (userMessage) => {
    // Add user message immediately
    const userMsg = { role: 'user', content: userMessage, text: userMessage,
      timestamp: new Date().toISOString() }
    set(state => ({ 
      chatHistory: [...state.chatHistory, userMsg],
      isStreaming: true,
      streamingContent: ''
    }))

    try {
      const { collectFullContext } = await import('../lib/jarvisContext')
      const context = await collectFullContext()
      
      const detectedMood = detectMood(userMessage)
      const moodAdjustment = getMoodAdjustment(detectedMood)
      set({ currentMood: detectedMood })
      
      // Save mood log async
      saveMoodLog(supabase, detectedMood, userMessage)

      const baseSystemPrompt = buildSystemPrompt(context, 'chat')
      const systemPrompt = baseSystemPrompt + (moodAdjustment 
        ? `\n\nMOOD CONTEXT: ${moodAdjustment}` 
        : '')
      
      const res = await fetch('/api/groq/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...get().chatHistory.map(m => ({ 
              role: m.role === 'jarvis' ? 'assistant' : 'user', content: m.text || m.content 
            }))
          ],
          max_tokens: 1000,
          stream: true
        })
      })

      if (!res.ok) {
        throw new Error(await res.text())
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
          
          for (const line of lines) {
            const data = line.replace('data: ', '')
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              const token = parsed.choices?.[0]?.delta?.content || ''
              fullContent += token
              set({ streamingContent: fullContent })
            } catch {}
          }
        }
      } catch (streamErr) {
        console.warn('Streaming error, falling back to non-streaming:', streamErr)
        // Fallback to non-streaming if stream fails midway
        if (!fullContent) {
          const result = await callGroq({
            messages: [
              { role: 'system', content: systemPrompt },
              ...get().chatHistory.map(m => ({ 
                role: m.role === 'jarvis' ? 'assistant' : 'user', content: m.text || m.content 
              }))
            ],
            max_tokens: 1000
          })
          if (result.error) throw new Error(result.error)
          fullContent = result.text
        }
      }

      const assistantMsg = { 
        id: Date.now() + 1,
        role: 'jarvis', 
        text: fullContent,
        content: fullContent,
        timestamp: new Date().toISOString()
      }
      set(state => ({
        chatHistory: [...state.chatHistory, assistantMsg],
        isStreaming: false,
        streamingContent: ''
      }))

      // Persistence
      await supabase.from('ai_sessions').insert({
        session_date: new Date().toISOString().split('T')[0],
        type: 'conversation',
        context_snapshot: context,
        ai_response: { response: fullContent },
        user_input: userMessage
      });

      // Extract and save memory from response
      extractAndSaveFromResponse({
        userInput: userMessage,
        aiResponse: fullContent,
        type: MEMORY_TYPES.GLOBAL,
        source: 'jarvis_chat'
      }) // fire and forget

    } catch (err) {
      console.error('JARVIS chat error:', err)
      set({ isStreaming: false, streamingContent: '' })
      
      // Add error message to chat
      const errorMsg = {
        id: Date.now(),
        role: 'jarvis',
        text: "I encountered a systems error. Please check your connection or Groq API key.",
        timestamp: new Date().toISOString()
      }
      set(state => ({ chatHistory: [...state.chatHistory, errorMsg] }))
    }
  },

  generateMorningBrief: async (context) => {
    if (get().isGenerating) return;
    set({ isGenerating: true });

    try {
      const { data: lastDebrief } = await supabase
        .from('ai_sessions')
        .select('ai_response, user_input, session_date')
        .eq('type', 'evening_debrief')
        .order('session_date', { ascending: false })
        .limit(1)
        .single()

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      const { data: yesterdayIntention } = await supabase
        .from('ai_sessions')
        .select('user_input')
        .eq('type', 'daily_intention')
        .eq('session_date', yesterdayStr)
        .single()

      // Fetch mood trends
      const { data: moodLogs } = await supabase
        .from('ai_sessions')
        .select('ai_response, session_date')
        .eq('type', 'mood_log')
        .order('session_date', { ascending: false })
        .limit(7)

      const moodTrend = (moodLogs || []).map(m => m.ai_response)
      const stressCount = moodTrend.filter(m => m === 'stressed').length
      const motivatedCount = moodTrend.filter(m => m === 'motivated').length

      // Fetch XP velocity for morning brief
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const { data: recentXp, error: xpError } = await supabase
        .from('xp_log')
        .select('amount, created_at')
        .gte('created_at', twoWeeksAgo.toISOString())

      if (xpError) console.error('XP fetch error:', xpError)

      const todayDate = new Date()
      const weekStart = new Date()
      weekStart.setDate(todayDate.getDate() - todayDate.getDay() + 1)
      weekStart.setHours(0,0,0,0)

      const thisWeekXP = (recentXp || [])
        .filter(r => new Date(r.created_at) >= weekStart)
        .reduce((sum, r) => sum + (r.amount || 0), 0)

      const systemPrompt = buildSystemPrompt(context || get().playerContext, 'briefing');
      const basePrompt = `Generate my morning brief. Be concise, sharp, and data-driven. Cover: current level and XP progress, today's streak status, wallet balance, top 3 priorities for today based on my domain progress, and one motivational line that is specific to my situation — not generic. ${thisWeekXP > 0 ? `XP earned this week so far: ${thisWeekXP}.` : ''} Format with clear sections. Max 200 words.`;
      
      const userPrompt = `${basePrompt}
${lastDebrief ? `
LAST NIGHT'S DEBRIEF:
Rating: ${lastDebrief.user_input}
Notes: ${lastDebrief.ai_response}
Use this to personalize today's brief — reference what was 
discussed, acknowledge progress or struggles mentioned.
` : 'No previous debrief available — this is a fresh start.'}
${yesterdayIntention?.user_input ? `
YESTERDAY'S INTENTION: "${yesterdayIntention.user_input}"
Reference this briefly — did yesterday's focus carry forward?
` : ''}
${moodTrend.length > 0 ? `
RECENT MOOD PATTERN (last 7 sessions):
${moodTrend.join(', ')}
Stressed sessions: ${stressCount}, Motivated: ${motivatedCount}
Adjust brief tone accordingly.
` : ''}`;

      const result = await callGroq({
        systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 1000
      })

      if (result.error) {
        console.error('Groq error:', result.error)
        const fallback = "Systems restricted. Briefing unavailable. Focus on your core metrics today."
        set({ morningBrief: fallback, isGenerating: false })
        return fallback
      }

      set({ 
        morningBrief: result.text,
        briefGeneratedAt: new Date().toISOString(),
        isGenerating: false 
      });

      // Persistence
      await supabase.from('ai_sessions').insert({
        session_date: new Date().toISOString().split('T')[0],
        type: 'morning_brief',
        context_snapshot: context || get().playerContext,
        ai_response: { response: result.text }
      });

      return result.text;
    } catch (err) {
      console.error('generateMorningBrief error:', err);
      set({ 
        morningBrief: "Failed to generate brief. Check your API key and try again.",
        isGenerating: false 
      });
    }
  },

  generateEveningReview: async (context, dayRating, notes) => {
    if (get().isGenerating) return;
    set({ isGenerating: true });

    try {
      const { data: intentionData } = await supabase
        .from('ai_sessions')
        .select('user_input')
        .eq('type', 'daily_intention')
        .eq('session_date', getTodayIST())
        .single()

      const systemPrompt = buildSystemPrompt(context || get().playerContext, 'briefing');
      const userPrompt = `Generate my evening debrief. Day rating: ${dayRating}. My notes: ${notes || 'None provided'}. Cover: what I accomplished today vs what I planned, XP earned, habit streaks status, one honest assessment of the day, and tomorrow's top focus. Be direct. Max 200 words.
${intentionData?.user_input ? `
TODAY'S INTENTION WAS: "${intentionData.user_input}"
Evaluate whether Abhishek lived up to his intention today.
Be direct — did he execute or not?
` : ''}`;
      
      const result = await callGroq({
        systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 1000
      })

      if (result.error) {
        console.error('Groq error:', result.error)
        set({ isGenerating: false })
        return "Review unavailable. Reflect on your progress manually."
      }

      set({ 
        eveningReview: result.text,
        isGenerating: false 
      });

      // Persistence
      await supabase.from('ai_sessions').insert({
        session_date: new Date().toISOString().split('T')[0],
        type: 'evening_review',
        context_snapshot: context || get().playerContext,
        ai_response: { response: result.text },
        user_input: `Rating: ${dayRating}, Notes: ${notes}`
      });

      return result.text;
    } catch (err) {
      console.error('generateEveningReview error:', err);
      set({ isGenerating: false });
    }
  },

  generateDailyQuests: async (context) => {
    if (get().isGenerating) return;
    set({ isGenerating: true });

    try {
      const systemPrompt = buildSystemPrompt(context || get().playerContext, 'briefing');
      const userPrompt = `Generate exactly 5 daily quests for me today. Base them on my current domain progress, weak areas, and today's priorities. Return ONLY a valid JSON array, no markdown, no explanation, just the raw JSON array. Each quest object must have exactly these fields: title (string, max 8 words), description (string, max 20 words, specific and actionable), domain (one of: SDE, Trading, Health, Exam, Finance, General), xp (number between 50 and 300 based on difficulty), difficulty (one of: Easy, Medium, Hard). Example format: [{"title":"Solve 3 LeetCode mediums","description":"Focus on sliding window and two pointer patterns","domain":"SDE","xp":150,"difficulty":"Medium"}]`;
      
      const result = await callGroq({
        systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 1000
      })

      if (result.error) {
        console.error('Groq error:', result.error)
        set({ generatedQuests: [], isGenerating: false })
        return []
      }

      let quests = [];
      try {
        const cleaned = result.text.replace(/```json|```/g, '').trim();
        quests = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('Quest JSON Parse Error:', parseErr, 'Raw:', result.text);
        quests = [];
      }

      set({ 
        generatedQuests: quests,
        isGenerating: false 
      });

      return quests;
    } catch (err) {
      console.error('generateDailyQuests error:', err);
      set({ 
        generatedQuests: [],
        isGenerating: false 
      });
      return [];
    }
  }
}));

