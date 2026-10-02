'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Wrench,
  Zap,
  Wind,
  MapPin,
  AlertTriangle,
  Clock,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Upload,
  Calendar,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { SERVICE_PROBLEMS, LAHORE_AREAS, PriceRange } from '@/lib/pricing/priceEstimates';
import { ServiceCategory, UrgencyLevel } from '@/lib/types';
import { MatchedTechnician } from '@/lib/matching/matchEngine';

function CustomerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard state
  const [step, setStep] = useState<'CATEGORY' | 'DETAILS' | 'MATCHES'>('CATEGORY');
  const [category, setCategory] = useState<ServiceCategory>('plumbing');
  const [problemType, setProblemType] = useState<string>('water_leak');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('NORMAL');
  const [selectedArea, setSelectedArea] = useState('Gulberg (Central Lahore)');
  const [customAddress, setCustomAddress] = useState('');
  const [coords, setCoords] = useState<[number, number]>([74.3436, 31.5204]);
  const [imageAttached, setImageAttached] = useState(false);

  // AI Triage & Matching Results
  const [loadingTriage, setLoadingTriage] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [matchingTechnicians, setMatchingTechnicians] = useState<MatchedTechnician[]>([]);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Active bookings banner
  const [activeBookings, setActiveBookings] = useState<any[]>([]);

  useEffect(() => {
    const initialCat = searchParams.get('category') as ServiceCategory;
    if (initialCat && ['plumbing', 'electrical', 'ac_repair'].includes(initialCat)) {
      setCategory(initialCat);
      setProblemType(SERVICE_PROBLEMS[initialCat][0].id);
      setStep('DETAILS');
    }
    fetchActiveBookings();
  }, [searchParams]);

  const fetchActiveBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) {
        const active = data.bookings.filter((b: any) =>
          ['AWAITING_ACCEPTANCE', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'INSPECTION', 'PRICE_PENDING', 'PRICE_APPROVED', 'IN_PROGRESS'].includes(b.status)
        );
        setActiveBookings(active);
      }
    } catch {
      // ignore
    }
  };

  const handleCategorySelect = (cat: ServiceCategory) => {
    setCategory(cat);
    setProblemType(SERVICE_PROBLEMS[cat][0].id);
    setStep('DETAILS');
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords([pos.coords.longitude, pos.coords.latitude]);
          setCustomAddress('Detected GPS Location, Lahore');
        },
        () => {
          alert('Location permission denied. Please select your Lahore area manually.');
        }
      );
    }
  };

  const handleAreaChange = (areaName: string) => {
    setSelectedArea(areaName);
    const found = LAHORE_AREAS.find((a) => a.name === areaName);
    if (found) {
      setCoords(found.coordinates);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingTriage(true);
    setErrorMsg('');

    try {
      // 1. Run AI diagnosis & triage
      const triageRes = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          problemType,
          description: description || 'Routine maintenance inspection requested.',
          urgency,
        }),
      });
      const triageData = await triageRes.json();
      setAiAnalysis(triageData.analysis);

      // 2. Run matching engine
      const matchRes = await fetch('/api/technicians/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          urgency,
          coordinates: coords,
          areaName: selectedArea,
        }),
      });
      const matchData = await matchRes.json();
      if (matchData.success && matchData.technicians.length > 0) {
        setMatchingTechnicians(matchData.technicians);
        setStep('MATCHES');
      } else {
        setErrorMsg('No verified technicians are currently available in this category. Please try another category.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to match technicians. Please check your connection.');
    } finally {
      setLoadingTriage(false);
    }
  };

  const handleSelectTechnician = async (tech: MatchedTechnician) => {
    setSelectedTechId(tech.id);
    setBookingLoading(true);

    try {
      const payload = {
        technicianId: tech.id,
        serviceCategory: category,
        problemType,
        description: description || 'Home service requested',
        address: customAddress ? `${customAddress}, ${selectedArea}` : selectedArea,
        urgency,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book technician');
      }

      // Customer chose technician -> redirect to active booking tracker
      router.push(`/customer/bookings/${data.bookingId}`);
    } catch (err: any) {
      setErrorMsg(err.message);
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Active Bookings Alert */}
      {activeBookings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                You have {activeBookings.length} Active Job in Progress
              </h4>
              <p className="text-[11px] text-amber-700">
                {activeBookings[0].technicianName} ({activeBookings[0].serviceCategory}) — Status:{' '}
                <span className="font-semibold">{activeBookings[0].status.replace('_', ' ')}</span>
              </p>
            </div>
          </div>
          <Link
            href={`/customer/bookings/${activeBookings[0]._id}`}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg shadow-sm whitespace-nowrap"
          >
            Track Status
          </Link>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 'CATEGORY' && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What needs fixing?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a service category to find verified professionals in Lahore.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleCategorySelect('plumbing')}
              className="p-6 bg-white border border-slate-200 rounded-2xl text-left hover:border-teal-500 hover:shadow-md transition-all group flex flex-col justify-between h-44"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 group-hover:scale-105 transition-transform">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-600">Plumbing</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Water leaks, blocked drains, broken taps, geyser</p>
                <span className="text-[10px] font-bold text-teal-700 mt-2 block">Rs. 1,500 – 3,000</span>
              </div>
            </button>

            <button
              onClick={() => handleCategorySelect('electrical')}
              className="p-6 bg-white border border-slate-200 rounded-2xl text-left hover:border-teal-500 hover:shadow-md transition-all group flex flex-col justify-between h-44"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-600">Electrical</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Short circuit, DB breakers, switches, UPS & solar</p>
                <span className="text-[10px] font-bold text-teal-700 mt-2 block">Rs. 800 – 2,500</span>
              </div>
            </button>

            <button
              onClick={() => handleCategorySelect('ac_repair')}
              className="p-6 bg-white border border-slate-200 rounded-2xl text-left hover:border-teal-500 hover:shadow-md transition-all group flex flex-col justify-between h-44"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-200 group-hover:scale-105 transition-transform">
                <Wind className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-600">AC Repair</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Not cooling, gas refill (R410), PCB error, jet wash</p>
                <span className="text-[10px] font-bold text-teal-700 mt-2 block">Rs. 2,000 – 4,500</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PROBLEM DETAILS WIZARD */}
      {step === 'DETAILS' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Step 2 of 3</span>
              <h2 className="text-xl font-bold text-slate-900 capitalize">
                {category.replace('_', ' ')} Service Request
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setStep('CATEGORY')}
              className="text-xs text-slate-500 hover:text-teal-600 underline font-medium"
            >
              Change Category
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-6">
            {/* Predefined Problems */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Select Specific Issue
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SERVICE_PROBLEMS[category].map((prob) => (
                  <button
                    key={prob.id}
                    type="button"
                    onClick={() => setProblemType(prob.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      problemType === prob.id
                        ? 'border-teal-600 bg-teal-50/70 text-teal-900 shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{prob.label}</span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Rs. {prob.min.toLocaleString()}–{prob.max.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Describe The Problem
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Water is dripping continuously from the joint under the kitchen sink..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Our Gemini AI problem assistant will analyze this description to suggest the safest immediate step.
              </p>
            </div>

            {/* Photo Attachment (Mock/File) */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Attach Photo (Optional)
              </label>
              <div
                onClick={() => setImageAttached(!imageAttached)}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                  imageAttached
                    ? 'border-teal-500 bg-teal-50/50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-700">
                  {imageAttached ? '✓ 1 Photo attached (water_leak_preview.jpg)' : 'Tap to attach photo of the issue'}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG up to 10MB</p>
              </div>
            </div>

            {/* Location in Lahore */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Lahore Area / Neighborhood
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => handleAreaChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {LAHORE_AREAS.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Street / House Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    placeholder="House / Street details"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    title="Auto-detect GPS location"
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="hidden sm:inline">GPS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Urgency Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgency('NORMAL')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    urgency === 'NORMAL'
                      ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold text-xs block">Normal Service</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Standard response today</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency('EMERGENCY')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    urgency === 'EMERGENCY'
                      ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-bold text-xs text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Emergency Dispatch
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Prioritize instant arrival</span>
                </button>
              </div>

              {urgency === 'EMERGENCY' && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Safety Notice:</strong> For life-threatening emergencies, exposed live high-voltage wires, gas leaks, or flooding, shut off your main switch/valve and contact Rescue 1122.
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loadingTriage}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-3.5 px-6 rounded-xl shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
            >
              {loadingTriage ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analyzing with AI & Matching Technicians...</span>
                </>
              ) : (
                <>
                  <span>Find Suitable Verified Professionals</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 3: TECHNICIAN COMPARISON & SELECTION */}
      {step === 'MATCHES' && (
        <div className="space-y-6">
          {/* AI Preliminary Triage Card */}
          {aiAnalysis && (
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  QuickFix AI Preliminary Triage
                </span>
                <span className="text-[10px] bg-teal-800/60 px-2 py-0.5 rounded text-teal-200">
                  Guidance Only
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="text-slate-200 font-medium">
                  <strong>Assessment:</strong> {aiAnalysis.possibleIssue}
                </p>
                <p className="text-teal-200">
                  <strong>Safe Next Step:</strong> {aiAnalysis.suggestedNextStep}
                </p>
                {aiAnalysis.safetyWarning && (
                  <div className="p-2.5 rounded-lg bg-rose-900/60 border border-rose-500/40 text-rose-200 text-[11px]">
                    {aiAnalysis.safetyWarning}
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                {aiAnalysis.disclaimer}
              </p>
            </div>
          )}

          {/* Heading with Core Principle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Customer Choice Model
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Compare & Choose Your Professional
              </h2>
              <p className="text-xs text-slate-500">
                Found {matchingTechnicians.length} verified technicians nearby in Lahore. QuickFix never auto-assigns — you choose.
              </p>
            </div>

            <button
              onClick={() => setStep('DETAILS')}
              className="text-xs text-slate-600 hover:text-teal-600 underline self-start sm:self-auto font-medium"
            >
              Modify Details
            </button>
          </div>

          {/* Technician Cards List */}
          <div className="space-y-4">
            {matchingTechnicians.map((tech) => (
              <div
                key={tech.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  selectedTechId === tech.id
                    ? 'border-teal-600 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar with verification badge */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 text-teal-800 font-bold text-lg flex items-center justify-center border border-slate-200">
                      {tech.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{tech.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        CNIC Verified
                      </span>
                      {tech.emergencyAvailable && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Emergency Ready
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {tech.rating} ({tech.reviewCount} reviews)
                      </span>
                      <span>•</span>
                      <span>{tech.completedJobs} jobs done</span>
                      <span>•</span>
                      <span>{tech.experienceYears} yrs experience</span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1">{tech.bio}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        {tech.serviceArea} ({tech.distanceKm} km away)
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Clock className="w-3 h-3" />
                        ETA: {tech.estimatedArrival}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Selection CTA */}
                <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Estimated Range</span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-800">
                      Rs. {tech.estimatedPriceMin.toLocaleString()} – {tech.estimatedPriceMax.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectTechnician(tech)}
                    disabled={bookingLoading}
                    className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-sm transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {bookingLoading && selectedTechId === tech.id ? (
                      <span>Sending Request...</span>
                    ) : (
                      <>
                        <span>Select {tech.name.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboard() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
          Loading QuickFix Lahore services...
        </div>
      }
    >
      <CustomerDashboardContent />
    </React.Suspense>
  );
}
