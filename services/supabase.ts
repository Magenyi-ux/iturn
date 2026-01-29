
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export type UserState = {
  id: string;
  state: any;
  updated_at: string;
};

export const saveUserState = async (userId: string, state: any) => {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from('user_state')
    .upsert({ id: userId, state, updated_at: new Date().toISOString() });
  if (error) console.error('Error saving user state:', error);
};

export const getUserState = async (userId: string) => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('user_state')
    .select('state')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Error fetching user state:', error);
    return null;
  }
  return data?.state;
};
