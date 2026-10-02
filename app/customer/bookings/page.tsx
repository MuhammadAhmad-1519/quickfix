'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Wrench, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CustomerBookingsList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (filter === 'ACTIVE') {
      return ['AWAITING_ACCEPTANCE', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'INSPECTION', 'PRICE_PENDING', 'PRICE_APPROVED', 'IN_PROGRESS'].includes(b.status);
    }
    if (filter === 'COMPLETED') {
      return ['COMPLETED', 'PAID'].includes(b.status);
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="text-xs text-slate-500">Track and manage your home repair requests in Lahore.</p>
        </div>
        <Link
          href="/customer"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm self-start sm:self-auto"
        >
          <Wrench className="w-4 h-4" />
          <span>Book New Service</span>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex p-1 bg-slate-200/80 rounded-xl max-w-xs text-xs font-bold">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filter === 'ALL' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('ACTIVE')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filter === 'ACTIVE' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filter === 'COMPLETED' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No bookings found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You haven&apos;t booked a service yet. QuickFix connects you with verified Lahore plumbers, electricians, and AC techs.
          </p>
          <div className="pt-2">
            <Link
              href="/customer"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-sm"
            >
              <span>Book a Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Link
              key={b._id}
              href={`/customer/bookings/${b._id}`}
              className="block bg-white border border-slate-200/80 hover:border-teal-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">#{b.bookingCode}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        b.status === 'PAID' || b.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : b.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700">
                    {b.serviceCategory.toUpperCase()} • {b.problemType.replace('_', ' ')}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Technician: <strong className="text-slate-800">{b.technicianName}</strong> • {b.address}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block">Price</span>
                    <span className="text-xs font-extrabold text-slate-800">
                      {b.finalPrice ? `Rs. ${b.finalPrice.toLocaleString()}` : `Rs. ${b.estimatedPriceMin.toLocaleString()}–${b.estimatedPriceMax.toLocaleString()}`}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-teal-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>View Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
