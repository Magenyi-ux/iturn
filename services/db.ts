import { AppState } from "../types";
import { supabase } from "./supabase";

export const saveUserState = async (state: AppState) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_state')
      .select('state')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
       console.error("Error loading user state:", error);
       return null;
    }

    return data?.state as AppState || null;
  } catch (error) {
    console.error("Error loading user state:", error);
    return null;
  }
};
