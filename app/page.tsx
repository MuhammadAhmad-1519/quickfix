import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  Zap,
  Wind,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Star,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export default function HomePage() {
  const services = [
    {
      id: 'plumbing',
      title: 'Plumbing & Drainage',
      icon: Wrench,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      tag: 'Plumbers in Lahore',
      examples: ['Water pipe leak', 'Blocked drain', 'Broken tap', 'Geyser repair'],
      estimate: 'Rs. 1,500 – 3,000',
      href: '/customer?category=plumbing',
    },
    {
      id: 'electrical',
      title: 'Electrical & DB Wiring',
      icon: Zap,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      tag: 'Electricians in Lahore',
      examples: ['Power fault', 'Switch/socket spark', 'Breaker tripping', 'UPS wiring'],
      estimate: 'Rs. 800 – 2,500',
      href: '/customer?category=electrical',
    },
    {
      id: 'ac_repair',
      title: 'Inverter AC & Cooling',
      icon: Wind,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      tag: 'HVAC Techs in Lahore',
      examples: ['AC not cooling', 'Gas leak refill', 'Master chemical wash', 'PCB error'],
      estimate: 'Rs. 2,000 – 4,500',
      href: '/customer?category=ac_repair',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-slate-50 to-white pt-12 pb-20 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 text-teal-800 text-xs font-semibold border border-teal-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Live in Lahore: Gulberg • DHA • Model Town • Johar Town • Cantt</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Home problems? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                Get them fixed fast.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              QuickFix connects you with verified plumbers, electricians, and AC technicians across Lahore.
              Compare ratings, review transparent quotes, and{' '}
              <strong className="text-slate-800 font-semibold">you choose the professional</strong> who visits your home.
            </p>

            {/* Main CTA */}
            <div className="w-full max-w-md pt-2">
              <Link
                href="/customer"
                className="w-full flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base sm:text-lg py-4 px-8 rounded-2xl shadow-xl shadow-teal-600/25 hover:shadow-teal-600/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>What needs fixing today?</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-3 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> CNIC Verified Pros
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> You Pick The Tech
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> Transparent Pricing
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">What service do you need?</h2>
          <p className="text-sm text-slate-600 mt-2">
            Select a category below to see verified local technicians and price estimates for Lahore.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                className="group relative bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${svc.color} border flex items-center justify-center shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      {svc.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                    {svc.title}
                  </h3>

                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                    {svc.examples.map((ex, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Est. Range in Lahore</span>
                    <span className="text-xs font-bold text-slate-800">{svc.estimate}</span>
                  </div>
                  <Link
                    href={svc.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Principle: Customer Choice */}
      <section className="bg-slate-900 text-white py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/60 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Our Core Promise</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                The Customer Chooses <br />
                <span className="text-teal-400">The Technician.</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Other apps assign random unvetted workers. At QuickFix, when you tell us your problem, our system matches you with <strong>3 to 5 verified local professionals</strong> nearby.
              </p>
              <div className="space-y-2.5 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Inspect public ratings and verified reviews from Lahore neighbors</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>See arrival ETA and years of certified experience</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Compare preliminary price ranges before booking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>You approve the final inspection quote before any repair begins</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/customer"
                  className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-teal-500/20"
                >
                  <span>Experience Customer Choice</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Flow Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                Simple 4-Step QuickFix Flow
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-700/50 rounded-xl border border-slate-600/50 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-200">Describe Your Problem</h4>
                    <p className="text-slate-400 mt-0.5">Choose issue, attach optional photo, and select your Lahore area (e.g. Gulberg, DHA).</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-xl border border-slate-600/50 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-200">Compare 3–5 Verified Technicians</h4>
                    <p className="text-slate-400 mt-0.5">QuickFix shows top-scored verified professionals. You pick the one you trust.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-xl border border-slate-600/50 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-200">On-Site Inspection & Price Quote</h4>
                    <p className="text-slate-400 mt-0.5">Technician arrives and quotes exact final price. You approve before work starts.</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-700/50 rounded-xl border border-slate-600/50 flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold text-slate-200">Pay Cash & Rate</h4>
                    <p className="text-slate-400 mt-0.5">Inspect work, pay in cash, and leave your 1-5 star review to help Lahore neighbors.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Callout */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700/50 border border-teal-400/30 text-teal-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Powered by Google Gemini</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Not sure what the problem is? <br />
              Ask the QuickFix AI Assistant.
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
              Describe the sound, leak, or electrical symptom in plain words. Our AI assistant helps you diagnose the issue, suggests safety precautions, and directs you to the right Lahore specialist.
            </p>
            <div className="pt-2">
              <Link
                href="/customer/ai-chat"
                className="inline-flex items-center gap-2 bg-white text-teal-950 hover:bg-teal-50 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow transition-colors"
              >
                <span>Chat with AI Assistant</span>
                <Sparkles className="w-4 h-4 text-teal-700" />
              </Link>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 max-w-sm w-full space-y-3 text-xs">
            <div className="flex items-center gap-2 text-teal-200 font-semibold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              Sample AI Consultation
            </div>
            <div className="bg-white/20 p-3 rounded-xl text-slate-100 italic">
              &quot;My inverter AC is blowing room temperature air and the outdoor fan is spinning very fast. What could be wrong?&quot;
            </div>
            <div className="bg-teal-950/70 p-3 rounded-xl text-teal-100 border border-teal-500/20">
              <p className="font-semibold text-teal-300">QuickFix AI:</p>
              <p className="mt-1 text-[11px] leading-relaxed">
                Likely a refrigerant gas leak (R410) or capacitor sensor issue. A verified AC technician should test pressure with gauges. Estimated fix: Rs. 2,500 – 4,500.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lahore Service Locations */}
      <section className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Serving Homeowners Across Lahore</h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto">
          Fast response times within 25–45 minutes in our core initial launch zones.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {[
            'Gulberg I, II, III',
            'DHA Phase 1–6',
            'Model Town',
            'Johar Town',
            'Lahore Cantt',
            'Faisal Town',
            'Garden Town',
            'Wapda Town',
            'Bahria Town',
            'Shadman & Jail Road',
            'Mall Road / Anarkali',
            'Cavalry Ground',
          ].map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 text-xs font-medium border border-slate-200 transition-colors"
            >
              <MapPin className="w-3 h-3 text-teal-600" />
              {loc}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
