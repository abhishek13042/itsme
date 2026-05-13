import { create } from 'zustand';
import { supabase } from '../lib/supabase';

import { callGroq } from '../lib/groq';

const groqFetch = async (prompt) => {
  const result = await callGroq({
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2500,
    temperature: 0.9
  });
  return result.text;
};

export const useExplorerStore = create((set, get) => ({
  // Current topic state
  weeklyTopic: null,
  dailyConcepts: [],
  books: [],
  papers: [],
  currentTopicId: null,
  currentNotes: '',

  // Archive
  topicArchive: [],

  // Brain drops
  brainDrops: [],

  // Knowledge depth per domain
  knowledgeDepth: [],

  // Read tracking (persisted per topic)
  readItems: new Set(),

  // UI state
  isGenerating: false,
  isSavingNotes: false,
  lastGenerated: null,

  // ── LOAD CURRENT TOPIC ──
  loadSavedTopic: async () => {
    try {
      const { data } = await supabase
        .from('explorer_topics')
        .select('*')
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const readSet = new Set(data.read_concepts || []);
        set({
          weeklyTopic: data.topic_data,
          dailyConcepts: data.concepts || [],
          books: data.books || [],
          papers: data.papers || [],
          currentTopicId: data.id,
          currentNotes: data.notes || '',
          readItems: readSet,
          lastGenerated: data.created_at,
        });
      }
    } catch (err) {
      console.error('Explorer loadSavedTopic error:', err);
    }
  },

  // ── LOAD ARCHIVE ──
  loadArchive: async () => {
    try {
      const { data } = await supabase
        .from('explorer_topics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      set({ topicArchive: data || [] });
    } catch (err) {
      console.error('Explorer loadArchive error:', err);
    }
  },

  // ── LOAD KNOWLEDGE DEPTH ──
  loadKnowledgeDepth: async () => {
    try {
      const { data } = await supabase
        .from('knowledge_depth')
        .select('*')
        .order('depth_score', { ascending: false });

      set({ knowledgeDepth: data || [] });
    } catch (err) {
      console.error('Knowledge depth load error:', err);
    }
  },

  // ── GENERATE NEW TOPIC ──
  generateWeeklyTopic: async () => {
    set({ isGenerating: true });

    // Mark current topic completed
    const { currentTopicId } = get();
    if (currentTopicId) {
      try {
        await supabase
          .from('explorer_topics')
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', currentTopicId);
      } catch (err) {
        console.error('Failed to mark topic completed:', err);
      }
    }

    try {
      const domains = [
        'Psychology',
        'Neuroscience',
        'Cognitive Science',
        'Geopolitics',
        'Artificial Intelligence',
      ];
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const weekNumber = Math.ceil(new Date().getDate() / 7);

      const prompt = `You are an intellectual provocateur curating content for Abhishek — a 20-year-old Indian engineering student who has broken out of the system. He trades forex, builds software, and refuses to be another cog. He has realized that the Indian education system, parenting culture, and society are built on operant conditioning — rewarding compliance and punishing curiosity. He wants to understand reality at its deepest level: how humans are wired, how power operates, how consciousness works, how the world is actually controlled.

He is NOT looking for textbook summaries or Wikipedia-level content. He wants the kind of knowledge that makes you see the world differently the next morning. The kind that makes you question everything you thought you knew. The kind that they don't teach in school because it would make people harder to control.

Generate a weekly exploration package for this domain: ${randomDomain}

The topic must be SPECIFIC and UNCOMFORTABLE — not "Introduction to Psychology" but something like "How Manufactured Consent Shapes What You Think You Want" or "The Neuroscience of Why Obedience Feels Safe."

Return ONLY valid JSON, no markdown, no backticks, no explanation:
{
  "topic": {
    "title": "specific, provocative title that makes you want to read immediately",
    "subtitle": "one sentence that creates urgency — why THIS, why NOW, why does ignoring this cost you",
    "domain": "${randomDomain}",
    "whyItMatters": "3 sentences. Start with a concrete uncomfortable truth. Then explain the mechanism. Then tell Abhishek exactly what changes in how he sees the world after understanding this. Be specific to his life — student, trader, first-gen, Indian system survivor.",
    "bigQuestion": "one question so uncomfortable it will disturb his thinking all week. Not philosophical fluff — something that directly challenges an assumption he lives by.",
    "weekNumber": ${weekNumber},
    "ignitionHook": "2 sentences that would make anyone drop everything and start reading right now. This is the hook that makes the topic feel urgent and personal."
  },
  "concepts": [
    {
      "title": "concept name",
      "summary": "4-5 sentences. Explain it like talking to a brilliant friend — no jargon without explanation, no hedging, no academic distancing. Use concrete examples from real life, history, or science. Make it land.",
      "whyForYou": "2 sentences connecting this DIRECTLY to Abhishek's actual life — his trading psychology, his experience with the Indian education system, his family dynamics, his ambition to build something real. Be specific, not generic.",
      "domain": "${randomDomain}",
      "depthLevel": "Foundation|Intermediate|Advanced"
    }
  ],
  "books": [
    {
      "title": "exact book title",
      "author": "exact author name",
      "why": "3 sentences. What specific insight does this book contain that you cannot get elsewhere? What will Abhishek think differently after reading it? Why this book over every other book on this topic?",
      "difficulty": "Accessible|Intermediate|Dense",
      "readThisIf": "one sentence finishing 'Read this if you want to understand...'"
    }
  ],
  "papers": [
    {
      "title": "real research paper title — must be a real paper that exists",
      "authors": "real author names",
      "journal": "real journal name",
      "year": "real publication year",
      "plainSummary": "4 sentences. What did they actually find? What was surprising? What does it prove or disprove? Why does it matter beyond academia?",
      "mindblowFactor": "one sentence — the single most surprising finding from this paper"
    }
  ],
  "roadmapPosition": {
    "phase": "Awakening|Foundation|Deepening|Mastery",
    "prerequisite": "what concept or topic should Abhishek already understand before this",
    "leadsTo": "what topic this naturally opens up next",
    "coreSkill": "the single mental skill this topic builds — e.g. 'pattern recognition in power systems' or 'emotional regulation awareness'"
  }
}

Generate exactly 5 concepts that build on each other (concept 1 is foundation, concept 5 is advanced synthesis). Generate 3 books and 3 papers. All books and papers must be REAL — accurate titles, real authors, real journals.`;

      const raw = await groqFetch(prompt);
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const topic = parsed.topic;
      const concepts = parsed.concepts || [];
      const books = parsed.books || [];
      const papers = parsed.papers || [];
      const roadmapPosition = parsed.roadmapPosition || {};

      // Save to Supabase
      const { data: saved } = await supabase
        .from('explorer_topics')
        .insert({
          topic_data: { ...topic, roadmapPosition },
          concepts,
          books,
          papers,
          domain: topic.domain,
          week_number: topic.weekNumber,
          completed: false,
          read_concepts: [],
          notes: '',
          depth_score: 0,
        })
        .select()
        .single();

      // Update knowledge depth for this domain (manual update — no RPC needed)
      try {
        const { data: kd } = await supabase
          .from('knowledge_depth')
          .select('*')
          .eq('domain', topic.domain)
          .single();

        if (kd) {
          await supabase
            .from('knowledge_depth')
            .update({
              topics_explored: (kd.topics_explored || 0) + 1,
              last_updated: new Date().toISOString(),
            })
            .eq('domain', topic.domain);
        }
      } catch (e) {
        // knowledge_depth table may not exist yet — silent fail
      }

      set({
        weeklyTopic: { ...topic, roadmapPosition },
        dailyConcepts: concepts,
        books,
        papers,
        currentTopicId: saved?.id || null,
        currentNotes: '',
        readItems: new Set(),
        isGenerating: false,
        lastGenerated: new Date().toISOString(),
      });

      // Reload archive and depth
      get().loadArchive();
      get().loadKnowledgeDepth();
    } catch (err) {
      console.error('Explorer generate error:', err);
      set({ isGenerating: false });
    }
  },

  // ── MARK CONCEPT READ (persisted) ──
  markRead: async (title) => {
    const { currentTopicId, readItems } = get();
    const newSet = new Set([...readItems, title]);
    set({ readItems: newSet });

    if (currentTopicId) {
      try {
        const readArray = [...newSet];
        await supabase
          .from('explorer_topics')
          .update({
            read_concepts: readArray,
            depth_score: readArray.length * 20,
          })
          .eq('id', currentTopicId);

        // Update knowledge depth
        const { weeklyTopic } = get();
        if (weeklyTopic?.domain) {
          const { data: kd } = await supabase
            .from('knowledge_depth')
            .select('*')
            .eq('domain', weeklyTopic.domain)
            .single();

          if (kd) {
            await supabase
              .from('knowledge_depth')
              .update({
                concepts_read: (kd.concepts_read || 0) + 1,
                depth_score: (kd.depth_score || 0) + 20,
                last_updated: new Date().toISOString(),
              })
              .eq('domain', weeklyTopic.domain);
          }
        }

        get().loadKnowledgeDepth();
      } catch (err) {
        console.error('markRead persist error:', err);
      }
    }
  },

  // ── SAVE NOTES ──
  saveNotes: async (notes) => {
    set({ currentNotes: notes, isSavingNotes: true });
    const { currentTopicId } = get();
    if (currentTopicId) {
      try {
        await supabase
          .from('explorer_topics')
          .update({ notes })
          .eq('id', currentTopicId);
      } catch (err) {
        console.error('saveNotes error:', err);
      }
    }
    setTimeout(() => set({ isSavingNotes: false }), 500);
  },

  // ── EXPORT TO GOOGLE DOCS (clipboard + open docs.new) ──
  exportToGoogleDocs: (topic, concepts, papers, books, notes, brainDrops) => {
    const topicBrainDrops = brainDrops.filter(
      (d) => d.topic_title === topic?.title
    );

    const line = '='.repeat(60);

    const docContent = `EXPLORER — ${topic?.domain?.toUpperCase() || 'RESEARCH'}
${topic?.title || ''}
Generated: ${new Date().toLocaleDateString('en-IN')}
${line}

SUBTITLE
${topic?.subtitle || ''}

WHY THIS MATTERS
${topic?.whyItMatters || ''}

THIS WEEK'S BIG QUESTION
"${topic?.bigQuestion || ''}"

IGNITION HOOK
${topic?.ignitionHook || ''}

${line}
5 CONCEPTS
${line}

${concepts
  .map(
    (c, i) => `${i + 1}. ${c.title}
   Level: ${c.depthLevel || 'Foundation'}
   
   ${c.summary}
   
   WHY FOR YOU: ${c.whyForYou}
`
  )
  .join('\n')}

${line}
RESEARCH PAPERS
${line}

${papers
  .map(
    (p, i) => `${i + 1}. ${p.title}
   ${p.authors} · ${p.journal} · ${p.year}
   
   ${p.plainSummary}
   
   MINDBLOW: ${p.mindblowFactor || ''}
`
  )
  .join('\n')}

${line}
BOOKS
${line}

${books
  .map(
    (b, i) => `${i + 1}. ${b.title} — ${b.author}
   Difficulty: ${b.difficulty}
   ${b.why}
   Read if: ${b.readThisIf || ''}
`
  )
  .join('\n')}

${line}
MY RESEARCH NOTES
${line}

${notes || '(No notes yet)'}

${line}
BRAIN DROPS FROM THIS TOPIC
${line}

${
  topicBrainDrops.length > 0
    ? topicBrainDrops.map((d, i) => `${i + 1}. ${d.content}`).join('\n')
    : '(No brain drops yet)'
}

${line}
ROADMAP POSITION
${line}

Phase: ${topic?.roadmapPosition?.phase || 'Foundation'}
This topic builds: ${topic?.roadmapPosition?.coreSkill || ''}
Prerequisite: ${topic?.roadmapPosition?.prerequisite || 'None'}
Opens up next: ${topic?.roadmapPosition?.leadsTo || 'TBD'}
`;

    navigator.clipboard.writeText(docContent).then(() => {
      window.open('https://docs.new', '_blank');
    }).catch(() => {
      const blob = new Blob([docContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    });
  },

  // ── BRAIN DROPS ──
  addBrainDrop: async (content, topicTitle) => {
    try {
      const { data } = await supabase
        .from('brain_drops')
        .insert({
          content,
          topic_title: topicTitle,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (data) {
        set((state) => ({ brainDrops: [data, ...state.brainDrops] }));
      }

      // Update knowledge depth brain drops count
      const { weeklyTopic } = get();
      if (weeklyTopic?.domain) {
        const { data: kd } = await supabase
          .from('knowledge_depth')
          .select('*')
          .eq('domain', weeklyTopic.domain)
          .single();

        if (kd) {
          await supabase
            .from('knowledge_depth')
            .update({
              brain_drops: (kd.brain_drops || 0) + 1,
              depth_score: (kd.depth_score || 0) + 5,
              last_updated: new Date().toISOString(),
            })
            .eq('domain', weeklyTopic.domain);

          get().loadKnowledgeDepth();
        }
      }
    } catch (err) {
      console.error('Brain drop error:', err);
    }
  },

  loadBrainDrops: async () => {
    try {
      const { data } = await supabase
        .from('brain_drops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      set({ brainDrops: data || [] });
    } catch (err) {
      console.error('Load brain drops error:', err);
    }
  },

  // ── LOAD ARCHIVED TOPIC INTO VIEW ──
  viewArchivedTopic: (archivedEntry) => {
    set({
      weeklyTopic: archivedEntry.topic_data,
      dailyConcepts: archivedEntry.concepts || [],
      books: archivedEntry.books || [],
      papers: archivedEntry.papers || [],
      currentTopicId: archivedEntry.id,
      currentNotes: archivedEntry.notes || '',
      readItems: new Set(archivedEntry.read_concepts || []),
      lastGenerated: archivedEntry.created_at,
    });
  },
}));
