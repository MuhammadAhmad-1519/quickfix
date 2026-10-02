'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Sparkles, Bell, User, Briefcase, Shield } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  if (!user) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-2 flex items-center justify-around shadow-lg">
      {user.role === 'CUSTOMER' && (
        <>
          <Link
            href="/customer"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
              pathname === '/customer' ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Services</span>
          </Link>

          <Link
            href="/customer/bookings"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
              pathname.startsWith('/customer/bookings') ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Bookings</span>
          </Link>

          <Link
            href="/customer/ai-chat"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
              pathname === '/customer/ai-chat' ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px]">AI Help</span>
          </Link>

          <Link
            href="/notifications"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
              pathname === '/notifications' ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px]">Alerts</span>
          </Link>
        </>
      )}

      {user.role === 'TECHNICIAN' && (
        <>
          <Link
            href="/technician"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
              pathname === '/technician' ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px]">Jobs</span>
          </Link>

          <Link
            href="/notifications"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
              pathname === '/notifications' ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px]">Alerts</span>
          </Link>
        </>
      )}

      {user.role === 'ADMIN' && (
        <>
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
              pathname === '/admin' ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px]">Portal</span>
          </Link>
          <Link
            href="/notifications"
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
              pathname === '/notifications' ? 'text-teal-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px]">Alerts</span>
          </Link>
        </>
      )}
    </div>
  );
}
