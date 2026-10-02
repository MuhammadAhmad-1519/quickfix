'use client';

import React, { useEffect, useState } from 'react';
import {
  Shield,
  Users,
  Wrench,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings,
  Filter,
  Eye,
  RefreshCw,
} from 'lucide-react';

export default function AdminPortal() {
  const [tab, setTab] = useState<'OVERVIEW' | 'TECHNICIANS' | 'BOOKINGS' | 'DISPUTES' | 'SETTINGS'>('OVERVIEW');
  const [stats, setStats] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters & settings
  const [techFilter, setTechFilter] = useState<string>('');
  const [commissionInput, setCommissionInput] = useState<number>(15);

  useEffect(() => {
    fetchInitialData();
  }, [tab, techFilter]);

  const fetchInitialData = async () => {
    try {
      const [statsRes, setRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/settings'),
      ]);

      const statsData = await statsRes.json();
      const setData = await setRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (setData.success && setData.settings) {
        setSettings(setData.settings);
        setCommissionInput(Math.round((setData.settings.commissionRate || 0.15) * 100));
      }

      if (tab === 'TECHNICIANS') {
        const url = techFilter ? `/api/admin/technicians?status=${techFilter}` : '/api/admin/technicians';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) setTechnicians(data.technicians);
      }

      if (tab === 'BOOKINGS') {
        const res = await fetch('/api/bookings');
        const data = await res.json();
        if (data.success) setBookings(data.bookings);
      }

      if (tab === 'DISPUTES') {
        const res = await fetch('/api/disputes');
        const data = await res.json();
        if (data.success) setDisputes(data.disputes);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTechnician = async (techId: string, action: 'APPROVE' | 'REJECT' | 'SUSPEND', notes?: string) => {
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/technicians/${techId}/verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification action failed');
      setMsg({ type: 'success', text: data.message });
      fetchInitialData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId: string, status: string, adminResolutionNotes: string) => {
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId, status, adminResolutionNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update dispute');
      setMsg({ type: 'success', text: data.message });
      fetchInitialData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMsg(null);
    try {
      const decimalRate = Number(commissionInput) / 100;
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: decimalRate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      setMsg({ type: 'success', text: `Platform commission rate updated to ${commissionInput}%.` });
      fetchInitialData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span>QuickFix Administration</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Lahore Control Center
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Manage technician verification, dispute arbitration, bookings, and platform revenue.
            </p>
          </div>
        </div>

        <button
          onClick={fetchInitialData}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-slate-200/80 rounded-2xl overflow-x-auto text-xs font-bold">
        {[
          { id: 'OVERVIEW', label: 'Overview KPIs' },
          { id: 'TECHNICIANS', label: `Technicians (${stats?.pendingTechnicians ? `${stats.pendingTechnicians} Pending` : 'All'})` },
          { id: 'BOOKINGS', label: `Bookings (${stats?.totalBookings || 0})` },
          { id: 'DISPUTES', label: `Disputes (${stats?.openDisputes || 0})` },
          { id: 'SETTINGS', label: 'Platform Settings' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              tab === t.id ? 'bg-white text-purple-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW KPIS */}
      {tab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">Total Customers</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {stats?.totalCustomers || 0}
              </span>
              <span className="text-[10px] text-slate-400">Lahore homeowners</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">Verified Technicians</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {stats?.verifiedTechnicians || 0}
              </span>
              <span className="text-[10px] text-slate-400">Active in search results</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">Pending Applications</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {stats?.pendingTechnicians || 0}
              </span>
              <span className="text-[10px] text-slate-400">Awaiting admin review</span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 block">Active Bookings</span>
              <span className="text-2xl font-black text-teal-600 mt-1 block">
                {stats?.activeBookings || 0}
              </span>
              <span className="text-[10px] text-slate-400">Currently in progress</span>
            </div>
          </div>

          {/* Revenue & Commission Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 block font-medium">Gross Merchandise Value (GMV)</span>
              <span className="text-3xl font-extrabold text-white block">
                Rs. {(stats?.gmv || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block pt-1">
                Total completed customer job volume in Lahore
              </span>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm space-y-1">
              <span className="text-xs text-purple-200 block font-medium">
                QuickFix Commission Earned ({(settings?.commissionRate ? settings.commissionRate * 100 : 15)}%)
              </span>
              <span className="text-3xl font-extrabold text-emerald-400 block">
                Rs. {(stats?.commission || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-purple-300 block pt-1">
                Platform revenue retained by QuickFix
              </span>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-1">
              <span className="text-xs text-slate-500 block font-medium">Technician Net Payouts</span>
              <span className="text-3xl font-extrabold text-slate-900 block">
                Rs. {(stats?.techPayout || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block pt-1">
                Earnings disbursed to Lahore professionals
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TECHNICIAN VERIFICATION */}
      {tab === 'TECHNICIANS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Technician Applications & Verification</h2>
              <p className="text-xs text-slate-500">
                Review submitted National CNICs, skills, and approve or reject profiles.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {technicians.map((t) => (
              <div
                key={t._id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        t.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : t.verificationStatus === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {t.verificationStatus}
                    </span>
                    <span className="text-xs text-slate-500">CNIC: <strong>{t.cnic}</strong></span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Category: <strong className="text-teal-700">{t.services?.join(', ')}</strong> • Experience: {t.experienceYears} yrs • Area: {t.serviceArea}
                  </p>

                  <p className="text-xs text-slate-500 italic">&quot;{t.bio}&quot;</p>

                  {t.verificationDocuments?.adminNotes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <strong>Admin Notes:</strong> {t.verificationDocuments.adminNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {t.verificationStatus !== 'VERIFIED' && (
                    <button
                      onClick={() => handleVerifyTechnician(t._id, 'APPROVE', 'CNIC & skills confirmed by admin.')}
                      disabled={actionLoading}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm"
                    >
                      Approve Profile
                    </button>
                  )}
                  {t.verificationStatus !== 'REJECTED' && (
                    <button
                      onClick={() => handleVerifyTechnician(t._id, 'REJECT', 'Credentials did not match requirements.')}
                      disabled={actionLoading}
                      className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm"
                    >
                      Reject
                    </button>
                  )}
                  {t.verificationStatus === 'VERIFIED' && (
                    <button
                      onClick={() => handleVerifyTechnician(t._id, 'SUSPEND', 'Profile suspended pending investigation.')}
                      disabled={actionLoading}
                      className="flex-1 md:flex-none bg-slate-800 hover:bg-black text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS LEDGER */}
      {tab === 'BOOKINGS' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
            Platform Booking Ledger
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Technician</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Final Price</th>
                  <th className="p-3">Commission (15%)</th>
                  <th className="p-3">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">#{b.bookingCode}</td>
                    <td className="p-3 font-medium text-slate-800">{b.customerName}</td>
                    <td className="p-3">{b.technicianName}</td>
                    <td className="p-3 uppercase text-[11px] font-semibold text-teal-700">{b.serviceCategory}</td>
                    <td className="p-3">
                      <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {b.finalPrice ? `Rs. ${b.finalPrice.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3 text-rose-600 font-semibold">
                      {b.commissionAmount ? `Rs. ${b.commissionAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3 text-emerald-700 font-bold">
                      {b.technicianAmount ? `Rs. ${b.technicianAmount.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DISPUTES RESOLUTION */}
      {tab === 'DISPUTES' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 font-bold text-sm text-slate-900">
            Customer & Technician Disputes
          </div>

          {disputes.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              No disputes on record. All jobs running smoothly.
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div
                  key={d._id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Dispute #{d.bookingCode}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                        {d.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Raised by {d.raisedByName} ({d.raisedByRole})
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-semibold">
                    Category: {d.category.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    &quot;{d.description}&quot;
                  </p>

                  {d.adminResolutionNotes && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <strong>Admin Resolution:</strong> {d.adminResolutionNotes}
                    </div>
                  )}

                  {d.status !== 'RESOLVED' && d.status !== 'CLOSED' && (
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() =>
                          handleResolveDispute(d._id, 'RESOLVED', 'Issue investigated and amicably resolved with homeowner.')
                        }
                        disabled={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() =>
                          handleResolveDispute(d._id, 'REJECTED', 'Claim reviewed against booking terms and dismissed.')
                        }
                        disabled={actionLoading}
                        className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3 rounded-xl shadow-sm"
                      >
                        Dismiss Complaint
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PLATFORM SETTINGS */}
      {tab === 'SETTINGS' && (
        <div className="max-w-2xl bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Platform Financial & Launch Settings</h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure QuickFix platform commission and launch market parameters dynamically.
            </p>
          </div>

          <form onSubmit={handleSaveCommission} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                QuickFix Platform Commission Rate (%)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(Number(e.target.value))}
                  className="w-32 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-600"
                />
                <span className="self-center text-xs text-slate-500 font-medium">
                  % of final customer repair price (e.g. 15%)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Centrally stored and applied server-side. Never hard-coded in browser code.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Launch Market City</label>
              <input
                type="text"
                disabled
                value="Lahore, Pakistan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-sm transition-all"
            >
              Save Platform Configuration
            </button>
          </form>

          {/* Audit Trail */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 mb-2">Recent Admin Audit Logs</h3>
            <div className="space-y-2 text-[11px] text-slate-500 max-h-48 overflow-y-auto">
              {(settings?.auditLogs || []).map((log: any, i: number) => (
                <div key={i} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">{log.action}</span>: {log.details}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
