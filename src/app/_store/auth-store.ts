import { create } from "zustand";
import type { AuthStatus, ClientSession } from "@/app/_types/auth.types";

type AuthState = {
  session: ClientSession | null;
  status: AuthStatus;
  clearSession: () => void;
  updateSession: () => Promise<void>;
};

function sanitizeSession(data: unknown): ClientSession | null {
  if (!data || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  const {
    accessToken: _a,
    access_token: _b,
    refreshToken: _c,
    token: _d,
    ...safe
  } = raw;
  if (!safe.id) return null;
  return safe as ClientSession;
}

async function fetchSessionFromAPI() {
  try {
    const response = await fetch("/api/auth/session", {
      credentials: "include",
    });
    if (!response.ok) {
      return { session: null, status: "unauthenticated" as AuthStatus };
    }
    const data = await response.json();
    if (!data.isLoggedIn) {
      return { session: null, status: "unauthenticated" as AuthStatus };
    }
    const session = sanitizeSession(data.user);
    return {
      session,
      status: "authenticated" as AuthStatus,
    };
  } catch {
    return { session: null, status: "unauthenticated" as AuthStatus };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  status: "loading",
  clearSession: () => set({ session: null, status: "unauthenticated" }),
  updateSession: async () => {
    const { session, status } = await fetchSessionFromAPI();
    set({ session, status });
  },
}));

if (typeof window !== "undefined") {
  useAuthStore.getState().updateSession();
}
