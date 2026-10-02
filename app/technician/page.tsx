'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Clock,
  CheckCircle2,
  DollarSign,
  Star,
  MapPin,
  Phone,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Power,
  Zap,
} from 'lucide-react';
import { AvailabilityStatus, BookingStatus } from '@/lib/types';

export default function TechnicianDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meRes, bookRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/bookings'),
      ]);

      const meData = await meRes.json();
      const bookData = await bookRes.json();

      if (meData.authenticated && meData.user.technician) {
        setProfile(meData.user.technician);

        // Fetch technician reviews
        const revRes = await fetch(`/api/reviews?technicianId=${meData.user.technician._id}`);
        const revData = await revRes.json();
        if (revData.success) {
          setReviews(revData.reviews || []);
        }
      }

      if (bookData.success) {
        setBookings(bookData.bookings || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvailability = async (newAvail: AvailabilityStatus, emergency?: boolean) => {
    setUpdatingAvailability(true);
    setMsg('');
    try {
      const res = await fetch('/api/technicians/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availability: newAvail,
          emergencyAvailable: emergency ?? profile?.emergencyAvailable,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev: any) => ({
          ...prev,
          availability: newAvail,
          emergencyAvailable: emergency ?? prev?.emergencyAvailable,
        }));
        setMsg('Availability status updated.');
      }
    } catch {
      setMsg('Failed to update availability.');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleJobResponse = async (bookingId: string, accept: boolean) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus: accept ? 'ACCEPTED' : 'CANCELLED',
          reason: accept ? undefined : 'Technician unavailable',
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch {
      // ignore
    }
  };

  // Calculations
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'PAID');
  const grossEarnings = completedJobs.reduce((sum, b) => sum + (b.finalPrice || 0), 0);
  const platformCommission = completedJobs.reduce((sum, b) => sum + (b.commissionAmount || 0), 0);
  const netEarnings = completedJobs.reduce((sum, b) => sum + (b.technicianAmount || 0), 0);

  const pendingRequests = bookings.filter((b) => b.status === 'AWAITING_ACCEPTANCE');
  const activeJobs = bookings.filter((b) =>
    ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'INSPECTION', 'PRICE_PENDING', 'PRICE_APPROVED', 'IN_PROGRESS'].includes(b.status)
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading technician portal...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Verification Notice if not VERIFIED */}
      {profile?.verificationStatus !== 'VERIFIED' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold">
              Account Status: {profile?.verificationStatus || 'PENDING REVIEW'}
            </h4>
            <p className="mt-0.5 text-amber-800">
              QuickFix administration is verifying your CNIC and credentials. Only <strong>VERIFIED</strong> technicians appear to Lahore customers in matching results.
            </p>
          </div>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-bold text-xl flex items-center justify-center">
            {profile?.name?.charAt(0) || 'T'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{profile?.name}</h1>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  profile?.verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {profile?.verificationStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Services: <strong className="text-slate-700">{profile?.services?.join(', ')}</strong> • Area: {profile?.serviceArea}
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto">
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => handleUpdateAvailability('AVAILABLE_NOW')}
              disabled={updatingAvailability}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
                profile?.availability === 'AVAILABLE_NOW'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Available Now
            </button>
            <button
              onClick={() => handleUpdateAvailability('AVAILABLE_LATER')}
              disabled={updatingAvailability}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
                profile?.availability === 'AVAILABLE_LATER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scheduled Later
            </button>
            <button
              onClick={() => handleUpdateAvailability('OFFLINE')}
              disabled={updatingAvailability}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all ${
                profile?.availability === 'OFFLINE'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* Financials & KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">Gross Job Volume</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            Rs. {grossEarnings.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">Total customer repairs</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">QuickFix Commission (15%)</span>
          <span className="text-xl font-black text-rose-600 mt-1 block">
            - Rs. {platformCommission.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">Platform fee deducted</span>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 block">Net Payout Take-Home</span>
          <span className="text-xl font-black text-emerald-700 mt-1 block">
            Rs. {netEarnings.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600">Your retained earnings</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 block">Rating & Jobs</span>
          <div className="flex items-center gap-1 text-xl font-black text-slate-900 mt-1">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span>{profile?.rating || 5.0}</span>
            <span className="text-xs font-normal text-slate-400 ml-1">({profile?.completedJobs || 0} jobs)</span>
          </div>
          <span className="text-[10px] text-slate-400">{profile?.reviewCount || 0} reviews received</span>
        </div>
      </div>

      {/* SECTION 1: INCOMING REQUESTS (Customer Selected You) */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>New Requests Awaiting Your Acceptance ({pendingRequests.length})</span>
          </h2>

          <div className="space-y-3">
            {pendingRequests.map((b) => (
              <div
                key={b._id}
                className="bg-amber-50/50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">#{b.bookingCode}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Customer Picked You
                    </span>
                    {b.urgency === 'EMERGENCY' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        EMERGENCY
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {b.serviceCategory.toUpperCase()} • {b.problemType.replace('_', ' ')}
                  </h3>
                  <p className="text-xs text-slate-600">{b.description}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>Customer Address: <strong>{b.address}</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-amber-200">
                  <button
                    onClick={() => handleJobResponse(b._id, true)}
                    className="flex-1 md:flex-none bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-sm transition-all"
                  >
                    Accept Job
                  </button>
                  <button
                    onClick={() => handleJobResponse(b._id, false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: ACTIVE JOBS (Accepted, En Route, In Progress) */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Active Jobs ({activeJobs.length})</h2>

        {activeJobs.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center text-xs text-slate-400">
            No jobs currently in progress. Keep your availability active to receive requests from Lahore customers.
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((b) => (
              <div
                key={b._id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">#{b.bookingCode}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    Customer: {b.customerName} ({b.customerPhone})
                  </p>
                  <p className="text-xs text-slate-500">
                    {b.serviceCategory.toUpperCase()} • {b.problemType.replace('_', ' ')}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>{b.address}</span>
                  </p>
                </div>

                <Link
                  href={`/technician/jobs/${b._id}`}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-sm transition-all"
                >
                  <span>Open Job Execution Screen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: REVIEWS RECEIVED */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">Recent Customer Reviews</h2>
        {reviews.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center text-xs text-slate-400">
            No customer reviews yet. Complete your first repair to start building your public rating.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{r.customerName}</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">&quot;{r.comment}&quot;</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
