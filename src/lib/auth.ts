import { z } from "zod";
import { API_BASE_URL } from "./config";
import type { CurrentUser } from "../types";

const nullStringSchema = z.union([
  z.string(),
  z.object({ String: z.string(), Valid: z.boolean() }).transform((v) => (v.Valid ? v.String : null)),
  z.null(),
]);

const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: nullStringSchema.optional(),
});

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Nem sikerült lekérdezni a bejelentkezett felhasználót.");
  }

  const parsed = userSchema.parse(await response.json());
  return {
    id: parsed.id,
    email: parsed.email,
    displayName: parsed.displayName ?? null,
  };
}

export function startGoogleLogin() {
  window.location.assign(`${API_BASE_URL}/auth/google/login`);
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Nem sikerült kijelentkezni.");
  }
}
