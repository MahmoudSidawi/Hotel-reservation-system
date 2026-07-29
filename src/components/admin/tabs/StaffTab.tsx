'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Loader2, Plus, ShieldCheck, X, CheckCircle2 } from 'lucide-react';

type StaffMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
};

const ROLE_COLORS: Record<string, string> = {
  admin:        'bg-violet-100 text-violet-800',
  receptionist: 'bg-amber-100 text-amber-800',
  housekeeping: 'bg-teal-100 text-teal-800',
  guest:        'bg-zinc-100 text-zinc-600',
};

type NewStaffForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
};

function CreateStaffModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<NewStaffForm>({ name: '', email: '', password: '', role: 'receptionist', department: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Name, email, and password are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Failed to create staff account');
        return;
      }
      onCreated();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <h3 className="font-bold text-zinc-900">Create Staff Account</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-3">
          {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</p>}
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Full Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Password *</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400">
                <option value="receptionist">Receptionist</option>
                <option value="housekeeping">Housekeeping</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Front Desk"
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50">Cancel</button>
          <button onClick={handleCreate} disabled={saving}
            className="px-5 py-2 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 flex items-center gap-1.5">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StaffTab() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setStaff((Array.isArray(data) ? data : []).filter((u: StaffMember) => u.role !== 'guest'));
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id: string) => {
    await fetch(`/api/users/${id}/deactivate`, { method: 'PATCH' });
    load();
  };

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchRole = !roleFilter || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Staff & User Management</h2>
          <p className="text-xs text-zinc-500">{staff.length} staff members</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-700 transition">
          <Plus className="w-4 h-4" /> Create Staff
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="receptionist">Receptionist</option>
          <option value="housekeeping">Housekeeping</option>
        </select>
        <button onClick={load} className="flex items-center gap-1.5 border border-zinc-200 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading staff...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No staff members found</p>
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold tracking-wider">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-zinc-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-zinc-900">{s.name}</td>
                  <td className="px-4 py-3 text-zinc-600">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ROLE_COLORS[s.role] ?? 'bg-zinc-100'}`}>
                      {s.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{s.department || '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${s.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {s.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(s._id)}
                      className={`text-[10px] font-bold px-3 py-1 rounded border transition ${s.isActive !== false ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {s.isActive !== false ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <CreateStaffModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
