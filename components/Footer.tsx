import React from 'react';
import Link from 'next/link';
import { Wrench, ShieldCheck, Clock, MapPin, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 pb-20 md:pb-8 pt-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span>QuickFix</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lahore&apos;s verified home services marketplace. Your problem, your choice, fixed fast.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Initial Launch: Lahore, Pakistan</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Home Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/customer?cat=plumbing" className="hover:text-teal-400 transition-colors">Plumbing & Leaks</Link></li>
              <li><Link href="/customer?cat=electrical" className="hover:text-teal-400 transition-colors">Electrical & DB Breakers</Link></li>
              <li><Link href="/customer?cat=ac_repair" className="hover:text-teal-400 transition-colors">Inverter AC Repair & Gas Refill</Link></li>
              <li className="text-slate-500">Carpentry & Paint (Coming Soon)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Lahore Coverage</h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['Gulberg', 'DHA Phase 1-6', 'Model Town', 'Johar Town', 'Cantt', 'Faisal Town', 'Wapda Town', 'Bahria Town'].map((area) => (
                <span key={area} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Trust & Principles</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Customer Chooses The Technician
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-teal-400" />
                Transparent Inspection Price Quote
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Gemini AI Problem Triage
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} QuickFix Technologies (Pvt) Ltd. All rights reserved.</p>
          <p className="text-[11px]">
            Notice: AI problem triage is educational assistance and does not constitute a certified hands-on physical inspection.
          </p>
        </div>
      </div>
    </footer>
  );
}
