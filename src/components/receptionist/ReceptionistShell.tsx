"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import ReceptionistSidebar from "@/components/receptionist/Sidebar";

export default function ReceptionistShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      <ReceptionistSidebar
        userName={userName}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar — hidden on lg+ since the sidebar is always visible there */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-[#27272A] bg-[#18181B] px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="p-2 -ml-2 rounded-lg text-[#E4E4E7] hover:bg-[#27272A] transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-sm font-bold text-white">
            VELORA HOTEL
          </span>
        </div>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}