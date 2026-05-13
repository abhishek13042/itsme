import { generateText } from './groq.js';
import { supabase } from './supabase.js';

const COACH_SYSTEM_PROMPT = `You are PLAYER ONE's AI coach 
for Abhishek. You are direct, honest, motivating without 
being fake. His goals: FAANG SDE prep, profitable trading, 
9+ CGPA, healthy physique. Keep responses sharp and 
actionable. No fluff. No corporate speak.`;

export async function generateMorningPlan(context) {
  const userPrompt = `Generate today's battle plan for Abhishek.
Context: ${JSON.stringify(context)}

Return ONLY valid JSON, no markdown, no backticks:
{
  "top_priority": "single most important thing today",
  "time_blocks": [
    { 
      "time": "6:30-8:00", 
      "task": "task description", 
      "category": "DSA/Trading/Health/Study", 
      "xp": 50 
    }
  ],
  "daily_quests_order": ["quest names in priority order"],
  "warning": "if streak at risk or exam close, else null",
  "motivation": "1 brutal honest sentence, no corporate speak"
}`;

  const raw = await generateText(COACH_SYSTEM_PROMPT, userPrompt);
  
  // Clean response — remove any markdown if present
  const cleaned = raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
  
  const plan = JSON.parse(cleaned);
  
  // Save to Supabase
  const today = new Date().toISOString().split('T')[0];
  await supabase.from('daily_plans').upsert({
    plan_date: today,
    morning_plan: plan,
    plan_generated_at: new Date().toISOString()
  }, { onConflict: 'plan_date' });
  
  return plan;
}

export async function generateEveningReview(userInput, context) {
  const userPrompt = `Give Abhishek his evening review.
Morning plan: ${JSON.stringify(context.plan)}
Completed quests: ${JSON.stringify(context.completed)}
Missed quests: ${JSON.stringify(context.missed)}
His input about today: "${userInput}"

Return ONLY valid JSON, no markdown, no backticks:
{
  "score": 7,
  "wins": ["win 1", "win 2"],
  "misses": ["miss 1", "miss 2"],
  "biggest_bottleneck": "what held you back most",
  "tomorrow_priority": "single most important thing tomorrow",
  "rupee_summary": "₹XX earned today",
  "honest_feedback": "2-3 sentences, direct, no sugarcoating"
}`;

  const raw = await generateText(COACH_SYSTEM_PROMPT, userPrompt);
  
  const cleaned = raw
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
  
  const review = JSON.parse(cleaned);
  
  // Save to Supabase
  const today = new Date().toISOString().split('T')[0];
  await supabase.from('daily_plans').upsert({
    plan_date: today,
    evening_review: review,
    day_score: review.score,
    review_generated_at: new Date().toISOString()
  }, { onConflict: 'plan_date' });
  
  return review;
}
