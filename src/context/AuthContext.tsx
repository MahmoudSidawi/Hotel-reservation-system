"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "guest" | "receptionist" | "admin";

export type NotificationPrefs = {
  bookingUpdates?: boolean;
  offersAndPromos?: boolean;
  smsAlerts?: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  notificationPrefs?: NotificationPrefs;
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
      const res = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate", Pragma: "no-cache" },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      } else {
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
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("[AuthContext] Logout failed:", err);
    } finally {
      // Always clear client state and send the user home, where the navbar
      // shows the Login button again — even if the network call hiccuped.
      setUser(null);
      setLoading(false);
      router.push("/");
      router.refresh();
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
