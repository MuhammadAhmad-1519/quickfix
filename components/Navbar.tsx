'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Wrench, Bell, User, LogOut, Shield, Sparkles, Calendar, Settings, Home, Briefcase } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    fetchUser();
    fetchNotifications();
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-slate-900">QuickFix</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Lahore
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none">Home Services Marketplace</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link
            href="/"
            className={`hover:text-teal-600 transition-colors ${pathname === '/' ? 'text-teal-600 font-semibold' : ''}`}
          >
            Home
          </Link>

          {user?.role === 'CUSTOMER' && (
            <>
              <Link
                href="/customer"
                className={`hover:text-teal-600 transition-colors ${pathname === '/customer' ? 'text-teal-600 font-semibold' : ''}`}
              >
                Find Professional
              </Link>
              <Link
                href="/customer/bookings"
                className={`hover:text-teal-600 transition-colors ${pathname.startsWith('/customer/bookings') ? 'text-teal-600 font-semibold' : ''}`}
              >
                My Bookings
              </Link>
              <Link
                href="/customer/ai-chat"
                className={`flex items-center gap-1.5 hover:text-teal-600 transition-colors ${pathname === '/customer/ai-chat' ? 'text-teal-600 font-semibold' : ''}`}
              >
                <Sparkles className="w-4 h-4 text-teal-600" />
                AI Assistant
              </Link>
            </>
          )}

          {user?.role === 'TECHNICIAN' && (
            <>
              <Link
                href="/technician"
                className={`hover:text-teal-600 transition-colors ${pathname === '/technician' ? 'text-teal-600 font-semibold' : ''}`}
              >
                Technician Dashboard
              </Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 hover:text-teal-600 transition-colors ${pathname === '/admin' ? 'text-teal-600 font-semibold' : ''}`}
              >
                <Shield className="w-4 h-4 text-emerald-600" />
                Admin Portal
              </Link>
            </>
          )}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative p-2 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold bg-rose-600 text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-teal-700">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-teal-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 rounded-lg shadow-sm shadow-teal-600/20 transition-colors"
              >
                Join QuickFix
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
