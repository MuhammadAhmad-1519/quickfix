'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  MapPin,
  Phone,
  ArrowLeft,
  ArrowRight,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { calculateCommission } from '@/lib/pricing/priceEstimates';

export default function TechnicianJobExecution() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchJob();
    const interval = setInterval(fetchJob, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      const data = await res.json();
      if (data.success) {
        setBooking(data.booking);
        if (data.booking.finalPrice) {
          setQuotedPrice(data.booking.finalPrice.toString());
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setMsg({ type: 'success', text: `Job updated to ${newStatus.replace('_', ' ')}` });
      fetchJob();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitFinalPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SUBMIT_PRICE',
          finalPrice: Number(quotedPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit price');
      setMsg({ type: 'success', text: 'Final price quote submitted to customer for approval.' });
      fetchJob();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCashPayment = async () => {
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to confirm payment');
      setMsg({ type: 'success', text: 'Payment confirmed! Job completed.' });
      fetchJob();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-xs text-slate-400">Loading job details...</div>;
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-900">Job not found</h2>
        <Link href="/technician" className="text-xs font-bold text-teal-600 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Price calculation preview
  const numPrice = Number(quotedPrice) || 0;
  const commissionPreview = calculateCommission(numPrice, booking.commissionRate);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <Link
        href="/technician"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-600"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Jobs</span>
      </Link>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Job #{booking.bookingCode}</h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Customer: <strong className="text-slate-800">{booking.customerName}</strong>
            </p>
          </div>

          <a
            href={`tel:${booking.customerPhone}`}
            className="inline-flex items-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <Phone className="w-3.5 h-3.5 text-teal-600" />
            <span>Call Customer ({booking.customerPhone})</span>
          </a>
        </div>

        {msg && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Location & Problem Summary */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="flex items-start gap-2 text-slate-700">
            <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>Customer Address: <strong>{booking.address}</strong></span>
          </div>
          <div className="flex items-start gap-2 text-slate-700">
            <Wrench className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>Issue: <strong>{booking.serviceCategory.toUpperCase()} • {booking.problemType.replace('_', ' ')}</strong></span>
          </div>
          <p className="text-slate-600 pl-6 italic">&quot;{booking.description}&quot;</p>
        </div>

        {/* STAGE-BASED ACTION INTERFACES */}

        {/* 1. Awaiting acceptance */}
        {booking.status === 'AWAITING_ACCEPTANCE' && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <h3 className="font-bold text-sm text-amber-900">Accept or Decline Request</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate('ACCEPTED')}
                disabled={actionLoading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm"
              >
                Accept This Job
              </button>
              <button
                onClick={() => handleStatusUpdate('CANCELLED')}
                disabled={actionLoading}
                className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* 2. Accepted -> Mark En Route */}
        {booking.status === 'ACCEPTED' && (
          <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
            <h3 className="font-bold text-sm text-teal-900">Step 1: Start Travel to Customer</h3>
            <p className="text-xs text-teal-700">
              When you depart for the customer&apos;s location in {booking.address}, tap below to notify them you are on your way.
            </p>
            <button
              onClick={() => handleStatusUpdate('EN_ROUTE')}
              disabled={actionLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              <span>Mark En Route (Traveling)</span>
            </button>
          </div>
        )}

        {/* 3. En Route -> Mark Arrived */}
        {booking.status === 'EN_ROUTE' && (
          <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
            <h3 className="font-bold text-sm text-teal-900">Step 2: Arrival at Location</h3>
            <p className="text-xs text-teal-700">
              When you arrive at the customer&apos;s door, mark arrived so they know to receive you.
            </p>
            <button
              onClick={() => handleStatusUpdate('ARRIVED')}
              disabled={actionLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Arrived at Customer Location</span>
            </button>
          </div>
        )}

        {/* 4. Arrived -> Start Inspection */}
        {booking.status === 'ARRIVED' && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Step 3: Begin Problem Inspection</h3>
            <p className="text-xs text-slate-600">
              Inspect the issue with your tools to determine required parts and final repair pricing.
            </p>
            <button
              onClick={() => handleStatusUpdate('INSPECTION')}
              disabled={actionLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm"
            >
              Start Inspection Now
            </button>
          </div>
        )}

        {/* 5. Inspection -> Submit Final Price Quote */}
        {booking.status === 'INSPECTION' && (
          <div className="p-5 rounded-2xl bg-amber-50/60 border-2 border-amber-300 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-amber-900">Step 4: Enter Final Inspected Price</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                Baseline preliminary estimate was Rs. {booking.estimatedPriceMin.toLocaleString()}–{booking.estimatedPriceMax.toLocaleString()}.
                Enter the exact price quoted to the customer.
              </p>
            </div>

            <form onSubmit={handleSubmitFinalPrice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Final Quoted Price (PKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">Rs.</span>
                  <input
                    type="number"
                    min="500"
                    required
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    placeholder="e.g. 2200"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Commission Breakdown Live Calculator */}
              {numPrice > 0 && (
                <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Customer Total Price</span>
                    <span className="font-bold text-slate-900">Rs. {numPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>QuickFix Commission ({(commissionPreview.commissionRate * 100).toFixed(0)}%)</span>
                    <span className="font-semibold">- Rs. {commissionPreview.commissionAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-emerald-700 pt-1 border-t border-slate-100">
                    <span>Your Net Payout</span>
                    <span>Rs. {commissionPreview.technicianAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={actionLoading || numPrice <= 0}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-all"
              >
                Submit Price Quote for Customer Approval
              </button>
            </form>
          </div>
        )}

        {/* 6. Price Pending Approval */}
        {booking.status === 'PRICE_PENDING' && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
            <Clock className="w-7 h-7 text-amber-600 mx-auto animate-spin" />
            <h3 className="font-bold text-sm text-amber-900">
              Quoted: Rs. {(booking.finalPrice || 0).toLocaleString()}
            </h3>
            <p className="text-xs text-amber-700 max-w-sm mx-auto">
              Awaiting customer approval on their screen. Work will begin immediately once they approve.
            </p>
          </div>
        )}

        {/* 7. Price Approved -> Start In Progress */}
        {booking.status === 'PRICE_APPROVED' && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Customer Approved Rs. {(booking.finalPrice || 0).toLocaleString()}!</span>
            </div>
            <p className="text-xs text-emerald-700">
              You are authorized to start repair work. Tap below when you begin fixing the problem.
            </p>
            <button
              onClick={() => handleStatusUpdate('IN_PROGRESS')}
              disabled={actionLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm"
            >
              Start Repair Work (In Progress)
            </button>
          </div>
        )}

        {/* 8. In Progress -> Complete Job */}
        {booking.status === 'IN_PROGRESS' && (
          <div className="p-5 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-3">
            <h3 className="font-bold text-sm text-teal-900">Repair in Progress</h3>
            <p className="text-xs text-teal-700">
              Once you finish repairing the issue and clean up the work area, tap below to mark the job completed.
            </p>
            <button
              onClick={() => handleStatusUpdate('COMPLETED')}
              disabled={actionLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm"
            >
              Mark Repair Completed
            </button>
          </div>
        )}

        {/* 9. Completed -> Confirm Cash Payment */}
        {(booking.status === 'COMPLETED' || booking.status === 'PAYMENT_PENDING') && (
          <div className="p-5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-3">
            <h3 className="font-bold text-sm text-emerald-900">Collect Cash Payment</h3>
            <p className="text-xs text-emerald-700">
              Collect <strong>Rs. {(booking.finalPrice || 0).toLocaleString()}</strong> in cash from the customer. Once received, tap below to record payment and close this job.
            </p>
            <button
              onClick={handleConfirmCashPayment}
              disabled={actionLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm"
            >
              Confirm Cash Payment Received (Close Job)
            </button>
          </div>
        )}

        {/* 10. Job Paid & Closed */}
        {booking.status === 'PAID' && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-base text-slate-900">Job Successfully Closed!</h3>
            <p className="text-xs text-slate-600">
              Payment of Rs. {(booking.finalPrice || 0).toLocaleString()} was confirmed. Your take-home payout is Rs. {(booking.technicianAmount || 0).toLocaleString()}.
            </p>
            <div className="pt-2">
              <Link
                href="/technician"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
