'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Wrench,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Star,
  MapPin,
  Phone,
  DollarSign,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { BookingStatus } from '@/lib/types';

export default function CustomerBookingDetail() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [technician, setTechnician] = useState<any>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [existingDispute, setExistingDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals / forms
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('POOR_SERVICE');
  const [disputeDesc, setDisputeDesc] = useState('');

  useEffect(() => {
    fetchBooking();
    const timer = setInterval(fetchBooking, 6000); // Polling status updates
    return () => clearInterval(timer);
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      const data = await res.json();
      if (data.success) {
        setBooking(data.booking);
        setTechnician(data.technician);
        setExistingReview(data.review);
        setExistingDispute(data.dispute);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handlePriceAction = async (action: 'APPROVE_PRICE' | 'REJECT_PRICE', rejectionReason?: string) => {
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rejectionReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update price quote');
      setMsg({ type: 'success', text: data.message });
      fetchBooking();
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
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');
      setMsg({ type: 'success', text: 'Payment confirmed! Please leave a review.' });
      fetchBooking();
      setShowReviewModal(true);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      setShowReviewModal(false);
      setMsg({ type: 'success', text: 'Thank you! Your review has been published.' });
      fetchBooking();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          category: disputeCategory,
          description: disputeDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to file dispute');
      setShowDisputeModal(false);
      setMsg({ type: 'success', text: 'Dispute submitted. QuickFix admin team will review.' });
      fetchBooking();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <Clock className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading booking status...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Booking not found</h2>
        <Link href="/customer" className="text-xs font-bold text-teal-600 underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Stepper logic
  const steps: { key: string; label: string }[] = [
    { key: 'REQUESTED', label: 'Requested' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'EN_ROUTE', label: 'En Route' },
    { key: 'ARRIVED', label: 'Arrived & Inspecting' },
    { key: 'PRICE_APPROVED', label: 'Price Approved' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'PAID', label: 'Paid' },
  ];

  const getStepIndex = (status: BookingStatus) => {
    switch (status) {
      case 'REQUESTED':
      case 'TECHNICIAN_SELECTED':
      case 'AWAITING_ACCEPTANCE':
        return 0;
      case 'ACCEPTED':
        return 1;
      case 'EN_ROUTE':
        return 2;
      case 'ARRIVED':
      case 'INSPECTION':
      case 'PRICE_PENDING':
        return 3;
      case 'PRICE_APPROVED':
      case 'IN_PROGRESS':
        return 4;
      case 'COMPLETED':
      case 'PAYMENT_PENDING':
        return 5;
      case 'PAID':
        return 6;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(booking.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <Link
        href="/customer/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-600"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Bookings</span>
      </Link>

      {/* Status banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Booking #{booking.bookingCode}</h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  booking.status === 'PAID' || booking.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : booking.status === 'CANCELLED'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-teal-50 text-teal-700 border border-teal-200 animate-pulse'
                }`}
              >
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {booking.serviceCategory.toUpperCase()} • {booking.problemType.replace('_', ' ')}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Estimated Price</span>
            <span className="text-sm font-extrabold text-slate-900">
              Rs. {booking.estimatedPriceMin.toLocaleString()} – {booking.estimatedPriceMax.toLocaleString()}
            </span>
          </div>
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

        {/* Visual Lifecycle Stepper */}
        {booking.status !== 'CANCELLED' && booking.status !== 'DISPUTED' && (
          <div className="py-2">
            <div className="grid grid-cols-7 gap-1 text-center">
              {steps.map((st, i) => (
                <div key={st.key} className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                      i <= currentStepIdx
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {i < currentStepIdx ? '✓' : i + 1}
                  </div>
                  <span
                    className={`text-[9px] mt-1.5 leading-tight ${
                      i <= currentStepIdx ? 'font-bold text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION PANEL 1: PRICE INSPECTION QUOTE APPROVAL */}
        {booking.status === 'PRICE_PENDING' && (
          <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-amber-900">
                  Technician Quoted Final Price: Rs. {(booking.finalPrice || 0).toLocaleString()}
                </h3>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  {booking.technicianName} has physically inspected your problem and submitted this final quote.
                  Under QuickFix principles, work will <strong>only begin after you approve</strong> this price.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handlePriceAction('APPROVE_PRICE')}
                disabled={actionLoading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all"
              >
                Approve Rs. {(booking.finalPrice || 0).toLocaleString()} & Begin Repair
              </button>
              <button
                onClick={() => handlePriceAction('REJECT_PRICE', 'Customer considered quote too high')}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
              >
                Decline Quote
              </button>
            </div>
          </div>
        )}

        {/* ACTION PANEL 2: CASH PAYMENT CONFIRMATION */}
        {(booking.status === 'COMPLETED' || booking.status === 'PAYMENT_PENDING') && (
          <div className="p-5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-emerald-900">Repair Work Finished!</h3>
                <p className="text-xs text-emerald-700 mt-1">
                  Please inspect the repair thoroughly. Hand over cash payment of{' '}
                  <strong>Rs. {(booking.finalPrice || booking.estimatedPriceMin).toLocaleString()}</strong> to{' '}
                  {booking.technicianName}, then tap confirm below to close this job.
                </p>
              </div>
            </div>

            <button
              onClick={handleConfirmCashPayment}
              disabled={actionLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-all"
            >
              Confirm Cash Payment Handed Over
            </button>
          </div>
        )}

        {/* ACTION PANEL 3: REVIEW SUBMITTED OR PROMPT */}
        {booking.status === 'PAID' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {existingReview ? (
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Your Review</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span>{existingReview.rating} / 5 Stars</span>
                  </div>
                </div>
                <p className="text-slate-600 italic mt-1">&quot;{existingReview.comment}&quot;</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Rate & Review Your Technician</h4>
                  <p className="text-[11px] text-slate-500">Help the Lahore community with your feedback.</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm"
                >
                  Write Review
                </button>
              </div>
            )}
          </div>
        )}

        {/* Technician Profile Card */}
        {technician && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-bold text-base flex items-center justify-center">
                {technician.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900">{technician.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-500" /> {technician.rating}
                  </span>
                  <span>•</span>
                  <span>{technician.completedJobs} jobs done</span>
                </div>
              </div>
            </div>

            <a
              href={`tel:${technician.phone}`}
              className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Technician</span>
            </a>
          </div>
        )}

        {/* Service Details Breakdown */}
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Address</span>
            <span className="font-semibold text-slate-800">{booking.address}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Payment Method</span>
            <span className="font-semibold text-slate-800">{booking.paymentMethod} (On-Site)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Problem Description</span>
            <span className="font-semibold text-slate-800 max-w-xs text-right">{booking.description}</span>
          </div>
          {booking.finalPrice && (
            <div className="flex justify-between py-1 font-bold text-slate-900">
              <span>Final Confirmed Price</span>
              <span>Rs. {booking.finalPrice.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Dispute Button / Notice */}
        <div className="pt-2 flex items-center justify-between text-xs">
          {existingDispute ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 w-full text-xs">
              <span className="font-bold block">Dispute Filed ({existingDispute.status})</span>
              <p className="mt-0.5">{existingDispute.description}</p>
              {existingDispute.adminResolutionNotes && (
                <p className="mt-1 text-[11px] font-semibold text-rose-900">
                  Admin Resolution: {existingDispute.adminResolutionNotes}
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowDisputeModal(true)}
              className="text-slate-500 hover:text-rose-600 underline font-medium text-xs flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Report an issue or dispute</span>
            </button>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900">Rate Your Service Experience</h3>
            <p className="text-xs text-slate-500">
              How was your repair with {booking.technicianName}?
            </p>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Feedback</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about punctuality, quality of repair, and pricing..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-slate-900">File a Service Complaint</h3>
            <p className="text-xs text-slate-500">
              QuickFix administration reviews all customer concerns in Lahore within 24 hours.
            </p>

            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                >
                  <option value="POOR_SERVICE">Poor Workmanship / Incomplete</option>
                  <option value="PRICE_DISAGREEMENT">Price Disagreement</option>
                  <option value="PROPERTY_DAMAGE">Accidental Property Damage</option>
                  <option value="BEHAVIOR">Unprofessional Technician Conduct</option>
                  <option value="OTHER">Other Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Describe The Issue</label>
                <textarea
                  rows={3}
                  required
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Explain what went wrong..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
