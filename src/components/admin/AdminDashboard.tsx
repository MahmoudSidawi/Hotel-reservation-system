'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, ShieldCheck,
  Wrench, Sparkles, BarChart3, Bell, LogOut, Building2, Menu, X,
  ChevronRight, Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// ── Lazy-loaded tab modules ───────────────────────────────────────────────────
const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const RoomsTab = lazy(() => import('./tabs/RoomsTab'));
const ReservationsTab = lazy(() => import('./tabs/ReservationsTab'));
const CalendarTab = lazy(() => import('./tabs/CalendarTab'));
const GuestsTab = lazy(() => import('./tabs/GuestsTab'));
const StaffTab = lazy(() => import('./tabs/StaffTab'));
const MaintenanceTab = lazy(() => import('./tabs/MaintenanceTab'));
const HousekeepingTab = lazy(() => import('./tabs/HousekeepingTab'));
const ReportsTab = lazy(() => import('./tabs/ReportsTab'));
const NotificationsTab = lazy(() => import('./tabs/NotificationsTab'));

export type AdminTab =
  | 'overview' | 'rooms' | 'reservations' | 'calendar'
  | 'guests' | 'staff' | 'maintenance' | 'housekeeping'
  | 'reports' | 'notifications';

const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview',      label: 'Overview',      icon: LayoutDashboard },
  { id: 'rooms',         label: 'Rooms',         icon: BedDouble       },
  { id: 'calendar',     label: 'Calendar',      icon: CalendarCheck    },
  { id: 'reservations', label: 'Reservations',  icon: CalendarCheck    },
  { id: 'guests',       label: 'Guests',        icon: Users            },
  { id: 'staff',        label: 'Staff & Users', icon: ShieldCheck      },
  { id: 'maintenance',  label: 'Maintenance',   icon: Wrench           },
  { id: 'housekeeping', label: 'Housekeeping',  icon: Sparkles         },
  { id: 'reports',      label: 'Reports',       icon: BarChart3        },
  { id: 'notifications',label: 'Notifications', icon: Bell             },
];

// ── Notification badge ────────────────────────────────────────────────────────
function useUnreadCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/notifications?unread=true&limit=1');
        if (res.ok) {
          const data = await res.json();
          setCount(data.unreadCount ?? 0);
        }
      } catch { /* ignore */ }
    };
    poll();
    const id = setInterval(poll, 4000);
    return () => clearInterval(id);
  }, []);
  return count;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({
  activeTab,
  onSelect,
  onLogout,
  isOpen,
  onClose,
  unreadCount,
}: {
  activeTab: AdminTab;
  onSelect: (t: AdminTab) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
}) {
  const { user } = useAuth();
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-[#090D16] text-zinc-300 flex flex-col border-r border-zinc-800/80 shrink-0 select-none transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-tight">VELORA</p>
              <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-mono">Admin</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            Management
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hasUnread = item.id === 'notifications' && unreadCount > 0;
            return (
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); onClose(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-l-2 border-[#D4AF37] pl-[10px]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-zinc-500'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {hasUnread && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3 h-3 text-[#D4AF37]" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#D4AF37]">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-4 py-3 border-t border-zinc-800 text-xs font-semibold text-zinc-500 hover:text-white hover:bg-zinc-800/50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Top bar ───────────────────────────────────────────────────────────────────
const TAB_TITLES: Record<AdminTab, string> = {
  overview: 'Executive Overview',
  rooms: 'Room Inventory',
  calendar: 'Availability Calendar',
  reservations: 'Reservations',
  guests: 'Guest Profiles',
  staff: 'Staff & Users',
  maintenance: 'Maintenance',
  housekeeping: 'Housekeeping',
  reports: 'Reports & Analytics',
  notifications: 'Notifications',
};

function TopBar({
  activeTab,
  onMenuOpen,
}: {
  activeTab: AdminTab;
  onMenuOpen: () => void;
}) {
  return (
    <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-1.5 rounded text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-zinc-900">{TAB_TITLES[activeTab]}</h1>
          <p className="text-[10px] text-zinc-500">Velora Hotel Management System</p>
        </div>
      </div>
      <div className="text-xs text-zinc-400 font-mono hidden sm:block">
        {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    </header>
  );
}

// ── Tab loading fallback ──────────────────────────────────────────────────────
function TabLoader() {
  return (
    <div className="flex items-center justify-center h-64 gap-2 text-zinc-400">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}

// ── Main shell ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  const unreadCount = useUnreadCount();

  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':      return <OverviewTab />;
      case 'rooms':         return <RoomsTab />;
      case 'calendar':      return <CalendarTab />;
      case 'reservations':  return <ReservationsTab />;
      case 'guests':        return <GuestsTab />;
      case 'staff':         return <StaffTab />;
      case 'maintenance':   return <MaintenanceTab />;
      case 'housekeeping':  return <HousekeepingTab />;
      case 'reports':       return <ReportsTab />;
      case 'notifications': return <NotificationsTab />;
      default:              return <OverviewTab />;
    }
  };

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        onSelect={setActiveTab}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar activeTab={activeTab} onMenuOpen={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<TabLoader />}>
            {renderTab()}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
