'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Wrench, ShieldAlert, Bot, User, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your QuickFix AI Assistant for Lahore homeowners. I can help you understand plumbing, electrical, and AC issues, estimate preliminary repair ranges, and guide you on booking verified Lahore technicians. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'My inverter AC is blowing warm air',
    'Water pipe leaking under kitchen sink',
    'Circuit breaker keeps tripping in DB box',
    'What does AC master chemical wash cost in Lahore?',
  ];

  const handleSend = async (textToSend?: string) => {
    const message = textToSend || input;
    if (!message.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: messages,
        }),
      });

      const data = await res.json();
      const aiReply: Message = {
        role: 'assistant',
        content: data.reply || 'I am ready to assist with your home repair questions in Lahore.',
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I encountered a brief connection issue. However, you can book verified Lahore plumbers, electricians, and AC technicians directly from the dashboard.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>QuickFix AI Assistant</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Gemini 3.6 Flash
              </span>
            </h1>
            <p className="text-xs text-slate-500">Problem triage, price explanations & safety guidance for Lahore</p>
          </div>
        </div>

        <Link
          href="/customer"
          className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
        >
          Book a Pro
        </Link>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Important Disclaimer:</strong> QuickFix AI provides preliminary guidance, not an official licensed on-site diagnosis. If you detect burning wires, sparks, or gas smells, turn off main utilities and contact emergency services (Rescue 1122 in Lahore).
        </span>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="text-[11px] font-medium bg-white hover:bg-teal-50 hover:text-teal-700 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm min-h-[380px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-teal-600 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-100/90 text-slate-800 rounded-bl-none border border-slate-200/60'
              }`}
            >
              {m.content}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-500 italic">
              QuickFix AI is analyzing symptoms...
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your plumbing, electrical, or AC issue in Lahore..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 rounded-xl shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
