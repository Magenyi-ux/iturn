
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { AppState } from "../types";

export const saveUserState = async (uid: string, state: AppState) => {
  try {
    await setDoc(doc(db, "users", uid), state);
  } catch (error) {
    console.error("Error saving user state:", error);
    throw error;
  }
};

export const loadUserState = async (uid: string): Promise<AppState | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppState;
    }
    return null;
  } catch (error) {
    console.error("Error loading user state:", error);
    throw error;
  }
};
