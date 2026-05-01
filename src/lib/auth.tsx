import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshAdminStatus: (nextUser: User | null) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseAdminEmails() {
  const raw = import.meta.env.VITE_ADMIN_EMAILS as string | undefined;
  return new Set(
    (raw ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

async function getAdminRoleFromProfile(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  return String(data.role ?? "").toLowerCase() === "admin";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshAdminStatus = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setIsAdmin(false);
      return;
    }

    const adminEmails = parseAdminEmails();
    const emailIsAdmin = !!nextUser.email && adminEmails.has(nextUser.email.toLowerCase());

    if (emailIsAdmin) {
      setIsAdmin(true);
      return;
    }

    const roleIsAdmin = await getAdminRoleFromProfile(nextUser.id);
    setIsAdmin(roleIsAdmin);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const nextSession = data.session ?? null;
      const nextUser = nextSession?.user ?? null;

      setSession(nextSession);
      setUser(nextUser);
      await refreshAdminStatus(nextUser);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const nextUser = nextSession?.user ?? null;
      setSession(nextSession ?? null);
      setUser(nextUser);
      await refreshAdminStatus(nextUser);
      setLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [refreshAdminStatus]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, loading, isAdmin, signOut, refreshAdminStatus }),
    [user, session, loading, isAdmin, signOut, refreshAdminStatus],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
