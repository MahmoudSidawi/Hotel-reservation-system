'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';

type CalendarReservation = {
  _id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  roomId?: { _id: string; roomNumber: string };
  userId?: { name: string };
  guestName?: string;
};

type Room = {
  _id: string;
  roomNumber: string;
  status: string;
  roomTypeId?: { name: string };
};

const STATUS_BG: Record<string, string> = {
  pending:     'bg-zinc-300 text-zinc-800',
  confirmed:   'bg-amber-300 text-amber-900',
  checked_in:  'bg-emerald-400 text-white',
  checked_out: 'bg-blue-200 text-blue-800',
  cancelled:   'bg-rose-200 text-rose-800',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<CalendarReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [roomsRes, resRes] = await Promise.all([
        fetch('/api/rooms'),
        fetch('/api/reservations'),
      ]);
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (resRes.ok) {
        const data = await resRes.json();
        setReservations(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const daysInMonth = getDaysInMonth(year, month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // For a given room and day, get the reservation block
  const getBlock = (roomId: string, day: number): CalendarReservation | null => {
    const date = new Date(year, month, day);
    date.setHours(12, 0, 0, 0);
    return reservations.find((r) => {
      if (String(r.roomId?._id) !== roomId) return false;
      const ci = new Date(r.checkIn);
      const co = new Date(r.checkOut);
      return date >= ci && date < co;
    }) ?? null;
  };

  const isStart = (roomId: string, day: number): CalendarReservation | null => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return reservations.find((r) => {
      if (String(r.roomId?._id) !== roomId) return false;
      const ci = new Date(r.checkIn);
      ci.setHours(0, 0, 0, 0);
      return ci.getTime() === date.getTime();
    }) ?? null;
  };

  const today = now.getDate();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-zinc-900 min-w-[180px] text-center">{monthName}</h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-semibold">
            {Object.entries({ confirmed: 'amber-300', checked_in: 'emerald-400', pending: 'zinc-300' }).map(([s]) => (
              <span key={s} className={`flex items-center gap-1 ${STATUS_BG[s]} px-2 py-0.5 rounded`}>
                {s.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
          <button onClick={load} className="flex items-center gap-1.5 border border-zinc-200 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading calendar...
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-auto">
          <table className="text-[10px] min-w-max w-full">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-3 py-2 text-left font-bold text-zinc-600 uppercase tracking-wider sticky left-0 bg-zinc-50 z-10 border-r border-zinc-200 min-w-[100px]">
                  Room
                </th>
                {days.map((d) => (
                  <th key={d} className={`px-1.5 py-2 text-center font-bold min-w-[28px] ${isCurrentMonth && d === today ? 'text-amber-600 bg-amber-50' : 'text-zinc-500'}`}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rooms.map((room) => (
                <tr key={room._id} className="hover:bg-zinc-50/50 transition">
                  <td className="px-3 py-2 sticky left-0 bg-white z-10 border-r border-zinc-100">
                    <p className="font-bold text-zinc-800">#{room.roomNumber}</p>
                    <p className="text-zinc-400 truncate max-w-[80px]">{room.roomTypeId?.name ?? ''}</p>
                  </td>
                  {days.map((d) => {
                    const block = getBlock(room._id, d);
                    const startBlock = isStart(room._id, d);
                    return (
                      <td
                        key={d}
                        className={`px-0.5 py-1.5 text-center border-l border-zinc-50 ${
                          isCurrentMonth && d === today ? 'bg-amber-50/60' : ''
                        }`}
                        title={block ? `${block.userId?.name ?? block.guestName ?? 'Guest'} — ${block.status}` : ''}
                      >
                        {block ? (
                          <div className={`rounded text-[9px] font-bold py-0.5 px-0.5 truncate ${STATUS_BG[block.status] ?? 'bg-zinc-200'}`}>
                            {startBlock ? (block.userId?.name ?? block.guestName ?? '?')?.[0] : '·'}
                          </div>
                        ) : (
                          <div className="w-full h-4" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-xs text-zinc-400 text-center">
        Hover over a colored cell to see guest details. Click a day on a room row to create a reservation.
      </div>
    </div>
  );
}
