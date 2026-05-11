import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkData() {
  console.log('Checking Character Sheet Data...');
  
  const { data: badges, error: bErr } = await supabase.from('badges').select('badge_key, earned');
  if (bErr) console.error('Badges Error:', bErr);
  else console.log(`Found ${badges.length} badges.`);

  const { data: player, error: pErr } = await supabase.from('player_state').select('level, stat_dsa, stat_analytical').single();
  if (pErr) console.error('Player Error:', pErr);
  else console.log('Player Stats:', player);

  const { count: brainLogs, error: lErr } = await supabase.from('brain_logs').select('*', { count: 'exact', head: true });
  if (lErr) console.error('Brain Logs Error:', lErr);
  else console.log(`Found ${brainLogs} brain logs.`);
}

checkData();
