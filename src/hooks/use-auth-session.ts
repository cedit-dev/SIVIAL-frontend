import { useEffect, useState } from "react";

import { type AuthSession, getStoredSession, subscribeAuth } from "@/lib/auth";

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());

  useEffect(() => subscribeAuth(() => setSession(getStoredSession())), []);

  return session;
}
