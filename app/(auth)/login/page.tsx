'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, Shield, User, Key, AlertCircle, ArrowRight, Check } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoAccounts = [
    {
      role: 'Customer',
      name: 'Ahmad Khan',
      email: 'ahmad@quickfix.local',
      pass: 'CustomerPass123!',
      badge: 'Lahore Homeowner',
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900',
    },
    {
      role: 'Technician (Plumber)',
      name: 'Tariq Mehmood',
      email: 'tariq.plumber@quickfix.local',
      pass: 'TechPass123!',
      badge: 'Verified Plumber (Gulberg)',
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900',
    },
    {
      role: 'Technician (Electrician)',
      name: 'Usman Ali',
      email: 'usman.electric@quickfix.local',
      pass: 'TechPass123!',
      badge: 'Verified Electrician (DHA)',
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900',
    },
    {
      role: 'Admin',
      name: 'Platform Staff',
      email: 'admin@quickfix.local',
      pass: 'AdminPass123!',
      badge: 'Platform Manager',
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-900',
    },
  ];

  const handleQuickFill = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push(data.redirectPath || '/customer');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-teal-600 text-white items-center justify-center shadow-lg shadow-teal-600/25 mb-4">
          <Wrench className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back to QuickFix
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Lahore&apos;s verified marketplace for plumbing, electrical, and AC repairs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Fast Demo Switch Card */}
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              Demo Fast-Login (One-Click)
            </span>
            <span className="text-[10px] text-slate-400">Click to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickFill(acc)}
                className={`p-2 rounded-xl border text-left transition-all ${acc.color} text-xs`}
              >
                <p className="font-bold leading-tight">{acc.role}</p>
                <p className="text-[10px] opacity-75 truncate">{acc.badge}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. ahmad@quickfix.local"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-teal-600 hover:text-teal-700">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
