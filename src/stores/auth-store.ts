import { create } from "zustand";
import type { CurrentUser } from "../types";
import { fetchCurrentUser } from "../lib/auth";

type AuthState = {
  user: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
  loadUser: () => Promise<CurrentUser | null>;
  clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await fetchCurrentUser();
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ismeretlen hiba.";
      set({ user: null, isLoading: false, error: message });
      return null;
    }
  },
  clearUser: () => set({ user: null }),
}));
