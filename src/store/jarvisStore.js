import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { generateText } from '../lib/gemini';
import { buildSystemPrompt } from '../lib/jarvisPrompt';

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

  sendMessage: async (userText, context) => {
    if (get().isGenerating) return;
    set({ isGenerating: true });

    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: userText,
      timestamp: new Date().toISOString()
    };

    set(state => ({ chatHistory: [...state.chatHistory, userMsg] }));

    try {
      const systemPrompt = buildSystemPrompt(context || get().playerContext, 'chat');
      const responseText = await generateText(systemPrompt, userText);

      const jarvisMsg = {
        id: Date.now() + 1,
        role: 'jarvis',
        text: responseText,
        timestamp: new Date().toISOString()
      };

      set(state => ({ 
        chatHistory: [...state.chatHistory, jarvisMsg],
        isGenerating: false 
      }));

      // Persistence
      await supabase.from('ai_sessions').insert({
        session_date: new Date().toISOString().split('T')[0],
        type: 'conversation',
        context_snapshot: context || get().playerContext,
        ai_response: { response: responseText },
        user_input: userText
      });

      return responseText;
    } catch (err) {
      console.error('Jarvis sendMessage error:', err);
      const errorText = "System error. Try again.";
      const errorMsg = {
        id: Date.now() + 2,
        role: 'jarvis',
        text: errorText,
        timestamp: new Date().toISOString()
      };
      set(state => ({ 
        chatHistory: [...state.chatHistory, errorMsg],
        isGenerating: false 
      }));
      return errorText;
    }
  },

  generateMorningBrief: async (context) => {
    if (get().isGenerating) return;
    set({ isGenerating: true });

    try {
      const systemPrompt = buildSystemPrompt(context || get().playerContext, 'briefing');
      const userPrompt = "Generate my morning brief. Be concise, sharp, and data-driven. Cover: current level and XP progress, today's streak status, wallet balance, top 3 priorities for today based on my domain progress, and one motivational line that is specific to my situation — not generic. Format with clear sections. Max 200 words.";
      
      const responseText = await generateText(systemPrompt, userPrompt);

      set({ 
        morningBrief: responseText,
        briefGeneratedAt: new Date().toISOString(),
        isGenerating: false 
      });

      // Persistence
      await supabase.from('ai_sessions').insert({
        session_date: new Date().toISOString().split('T')[0],
        type: 'morning_brief',
        context_snapshot: context || get().playerContext,
        ai_response: { response: responseText }
      });

      return responseText;
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
      const systemPrompt = buildSystemPrompt(context || get().playerContext, 'briefing');
      const userPrompt = `Generate my evening debrief. Day rating: ${dayRating}. My notes: ${notes || 'None provided'}. Cover: what I accomplished today vs what I planned, XP earned, habit streaks status, one honest assessment of the day, and tomorrow's top focus. Be direct. Max 200 words.`;
      
      const responseText = await generateText(systemPrompt, userPrompt);

      set({ 
        eveningReview: responseText,
        isGenerating: false 
      });

      // Persistence
      await supabase.from('ai_sessions').insert({
        session_date: new Date().toISOString().split('T')[0],
        type: 'evening_review',
        context_snapshot: context || get().playerContext,
        ai_response: { response: responseText },
        user_input: `Rating: ${dayRating}, Notes: ${notes}`
      });

      return responseText;
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
      
      const responseText = await generateText(systemPrompt, userPrompt);
      
      let quests = [];
      try {
        const cleaned = responseText.replace(/```json|```/g, '').trim();
        quests = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('Quest JSON Parse Error:', parseErr, 'Raw:', responseText);
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

