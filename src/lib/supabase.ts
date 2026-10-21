import { createClient } from '@supabase/supabase-js';

const env = import.meta.env as Record<string, string | undefined>;

const supabaseUrl = 
  env.VITE_SUPABASE_URL || 
  env.SUPABASE_URL || 
  env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey = 
  env.VITE_SUPABASE_ANON_KEY || 
  env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
