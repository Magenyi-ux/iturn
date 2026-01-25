import { AppState } from "../types";
import { supabase, isSupabaseConfigured } from "./supabase";

const LOCAL_STORAGE_KEY = 'atelier_ai_user_state';

export const saveUserState = async (state: AppState) => {
  try {
    if (!isSupabaseConfigured) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // If no user but supabase is configured, we might still want a local fallback for guest sessions
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
      return;
    }

    const { error } = await supabase
      .from('user_state')
      .upsert({ id: user.id, state: state });

    if (error) throw error;
  } catch (error) {
    console.error("Error saving user state:", error);
  }
};

export const loadUserState = async (): Promise<AppState | null> => {
  try {
    if (!isSupabaseConfigured) {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      return localData ? JSON.parse(localData) : null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      return localData ? JSON.parse(localData) : null;
    }

    const { data, error } = await supabase
      .from('user_state')
      .select('state')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
       console.error("Error loading user state:", error);
       return null;
    }

    return (data?.state as AppState) || null;
  } catch (error) {
    console.error("Error loading user state:", error);
    return null;
  }
};
