"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "guest" | "receptionist" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      console.log("[AuthContext] Fetching current user from /api/auth/me...");
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("[AuthContext] User fetched successfully:", data.user);
        setUser(data.user);
        return data.user;
      } else {
        console.log("[AuthContext] No active session found (Status:", res.status, ")");
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error("[AuthContext] Error fetching current user:", err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const logout = async () => {
    try {
      console.log("[AuthContext] Logging out user...");
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      console.log("[AuthContext] Logout successful. Redirecting to /login...");
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("[AuthContext] Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser: fetchCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
