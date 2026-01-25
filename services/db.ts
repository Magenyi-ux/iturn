import { AppState } from "../types";
import { api } from "./api";

export const saveUserState = async (state: AppState) => {
  try {
    await api.post('/user/state', state);
  } catch (error) {
    console.error("Error saving user state:", error);
    throw error;
  }
};

export const loadUserState = async (): Promise<AppState | null> => {
  try {
    const state = await api.get('/user/state');
    return state;
  } catch (error) {
    console.error("Error loading user state:", error);
    return null;
  }
};
