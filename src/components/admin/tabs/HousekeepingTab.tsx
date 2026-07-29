'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Loader2, Sparkles } from 'lucide-react';

type Room = {
  _id: string;
  roomNumber: string;
  floor: number;
  status: string;
  notes?: string;
  lastCleaned?: string;
  roomTypeId?: { name: string };
};

const KANBAN_COLUMNS = [
  { id: 'needs_cleaning', label: '🧹 Needs Cleaning', color: 'border-orange-200 bg-orange-50' },
  { id: 'cleaning',       label: '🫧 In Progress',    color: 'border-blue-200 bg-blue-50'     },
  { id: 'available',      label: '✅ Clean & Ready',  color: 'border-emerald-200 bg-emerald-50' },
];

export default function HousekeepingTab() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/housekeeping/rooms');
      if (res.ok) setRooms(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (roomId: string, status: string) => {
    const res = await fetch('/api/housekeeping/rooms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRooms((prev) => prev.map((r) => (r._id === roomId ? updated : r)));
    }
  };

  const columnRooms = (status: string) => rooms.filter((r) => r.status === status);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Housekeeping Board</h2>
          <p className="text-xs text-zinc-500">Drag cards or use buttons to update room status</p>
        </div>
        <button onClick={load} className="border border-zinc-200 px-3 py-2 rounded-lg text-zinc-600 hover:bg-zinc-50 flex items-center gap-1.5 text-xs">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading rooms...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {KANBAN_COLUMNS.map((col) => {
            const colRooms = columnRooms(col.id);
            return (
              <div key={col.id} className={`rounded-xl border-2 ${col.color} p-4 min-h-[200px]`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">{col.label}</h3>
                  <span className="bg-white border border-zinc-200 text-zinc-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {colRooms.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {colRooms.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400">
                      <Sparkles className="w-8 h-8 mx-auto mb-1 opacity-30" />
                      <p className="text-xs">No rooms here</p>
                    </div>
                  ) : (
                    colRooms.map((room) => (
                      <div key={room._id} className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Floor {room.floor}</p>
                            <p className="font-bold text-zinc-900 text-sm">Room #{room.roomNumber}</p>
                            <p className="text-[11px] text-zinc-500">{room.roomTypeId?.name ?? ''}</p>
                          </div>
                        </div>
                        {room.notes && (
                          <p className="text-[11px] text-zinc-400 italic line-clamp-2">{room.notes}</p>
                        )}
                        {room.lastCleaned && (
                          <p className="text-[10px] text-zinc-400">
                            Last cleaned: {new Date(room.lastCleaned).toLocaleDateString()}
                          </p>
                        )}
                        {/* Transition buttons */}
                        <div className="flex gap-1.5 pt-1">
                          {col.id === 'needs_cleaning' && (
                            <button onClick={() => updateStatus(room._id, 'cleaning')}
                              className="flex-1 text-[10px] font-bold bg-blue-600 text-white rounded py-1.5 hover:bg-blue-700">
                              Start Cleaning
                            </button>
                          )}
                          {col.id === 'cleaning' && (
                            <button onClick={() => updateStatus(room._id, 'available')}
                              className="flex-1 text-[10px] font-bold bg-emerald-600 text-white rounded py-1.5 hover:bg-emerald-700">
                              Mark Clean ✓
                            </button>
                          )}
                          {col.id === 'available' && (
                            <button onClick={() => updateStatus(room._id, 'needs_cleaning')}
                              className="flex-1 text-[10px] font-bold text-orange-600 border border-orange-200 rounded py-1.5 hover:bg-orange-50">
                              Needs Cleaning
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
