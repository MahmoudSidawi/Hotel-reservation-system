'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, RefreshCw, Loader2, Check } from 'lucide-react';

type Notification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedType?: string;
};

const TYPE_ICONS: Record<string, string> = {
  reservation_created:    '📋',
  reservation_confirmed:  '✅',
  reservation_cancelled:  '❌',
  reservation_modified:   '✏️',
  check_in:               '🛎️',
  check_out:              '🚪',
  payment_received:       '💳',
  maintenance_reported:   '🔧',
  maintenance_resolved:   '✅',
  cleaning_requested:     '🧹',
  cleaning_done:          '✨',
  system_alert:           '⚠️',
  new_review:             '⭐',
};

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (unreadOnly) params.set('unread', 'true');
      const res = await fetch(`/api/notifications?${params}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch { /* ignore */ }
    finally {
      if (isInitial) setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchNotifications(true);
    const interval = setInterval(() => fetchNotifications(false), 4000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Notifications</h2>
            <p className="text-xs text-zinc-500">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer">
            <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded" />
            Unread only
          </label>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 text-zinc-600">
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button onClick={() => fetchNotifications(true)} className="border border-zinc-200 px-3 py-2 rounded-lg text-zinc-600 hover:bg-zinc-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={`flex items-start gap-3 p-4 rounded-xl border transition cursor-pointer ${
                n.isRead
                  ? 'bg-white border-zinc-200 opacity-60'
                  : 'bg-white border-zinc-300 shadow-sm ring-1 ring-zinc-100'
              }`}
            >
              <div className="text-2xl shrink-0 mt-0.5">
                {TYPE_ICONS[n.type] ?? '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold ${n.isRead ? 'text-zinc-600' : 'text-zinc-900'}`}>{n.title}</p>
                  {!n.isRead && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-rose-500 mt-1.5" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-zinc-400 mt-1.5 font-mono">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
