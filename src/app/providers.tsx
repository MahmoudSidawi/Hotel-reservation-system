import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import ConciergeWidget from "@/components/concierge/ConciergeWidget";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ConciergeWidget />
    </AuthProvider>
  );
}
