"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  DoorOpen,
  CalendarPlus,
  ClipboardList,
  LogIn,
  LogOut,
  Building2,
} from "lucide-react";

// `match` is the pathname used for active-state (usePathname drops the query
// string, so the two walk-in entries match on the shared path — both highlight
// on the booking page, which is acceptable).
const NAV_ITEMS = [
  { label: "Dashboard", href: "/receptionist", match: "/receptionist", icon: LayoutDashboard, exact: true },
  { label: "New Reservation", href: "/receptionist/walk-in?mode=reservation", match: "/receptionist/walk-in", icon: CalendarPlus },
  { label: "Walk-in", href: "/receptionist/walk-in?mode=walkin", match: "/receptionist/walk-in", icon: DoorOpen },
  { label: "Reservations", href: "/receptionist/reservations", match: "/receptionist/reservations", icon: ClipboardList },
  { label: "Check In", href: "/receptionist/check-in", match: "/receptionist/check-in", icon: LogIn },
  { label: "Check Out", href: "/receptionist/check-out", match: "/receptionist/check-out", icon: LogOut },
];

export default function ReceptionistSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-[#18181B] text-[#E4E4E7] flex flex-col justify-between border-r border-[#27272A] shrink-0 font-sans select-none min-h-screen">
      <div>
        <div className="p-6 border-b border-[#27272A] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight text-white">VELORA HOTEL</h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#D4AF37]">
              Front Desk
            </p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 mt-2">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
            Reception
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.match
              : pathname.startsWith(item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[#27272A] text-[#D4AF37] border-l-4 border-[#D4AF37]"
                    : "text-zinc-400 hover:text-white hover:bg-[#27272A]/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#D4AF37]" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#27272A] bg-[#09090B] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center font-bold text-xs text-[#D4AF37]">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{userName}</p>
            <p className="text-[10px] text-zinc-500">Receptionist</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 border border-[#27272A] hover:text-white hover:bg-[#27272A]/50 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
