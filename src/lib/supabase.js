import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Prevent the app from crashing if keys are missing or invalid placeholders
const isConfigured = supabaseUrl && 
                   supabaseKey && 
                   supabaseUrl !== 'your_supabase_url_here' && 
                   supabaseUrl.startsWith('http');

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (!isConfigured) {
  console.warn('Supabase is not configured. Please add valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.');
}
