'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles, X, Send, Loader2, Bot, User as UserIcon,
  ChevronRight, Calendar, Users, Building2, CheckCircle2,
  Clock, Info, ArrowRight, RefreshCw, ShieldCheck
} from 'lucide-react';
import {
  ConciergeCardRoom, ConciergeCardReservation, ConciergeResponse
} from '@/backend/controllers/conciergeController';

type ChatMessage = {
  id: string;
  sender: 'user' | 'concierge';
  text: string;
  timestamp: string;
  suggestedReplies?: string[];
  cardsType?: 'rooms' | 'reservations' | 'amenities' | null;
  rooms?: ConciergeCardRoom[];
  reservations?: ConciergeCardReservation[];
};

const DEFAULT_QUICK_REPLIES = [
  "Show my reservations",
  "I need a room for 2",
  "Executive Suite details",
  "Hotel Amenities & Pool",
];

export default function ConciergeWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when user changes or opens
  useEffect(() => {
    if (messages.length === 0) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const guestFirstName = user?.name ? user.name.split(' ')[0] : null;

      const welcomeText = guestFirstName
        ? `Good day, ${guestFirstName}. Welcome back to Velora Hotel. I am your Virtual Concierge. How may I assist with your stay today?`
        : `Welcome to Velora Hotel. I am your Virtual Concierge. I can assist you with room reservations, hotel amenities, or existing bookings. How may I help you today?`;

      setMessages([
        {
          id: 'welcome-1',
          sender: 'concierge',
          text: welcomeText,
          timestamp: timeStr,
          suggestedReplies: DEFAULT_QUICK_REPLIES,
        },
      ]);
    }
  }, [user, messages.length]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = `usr-${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: queryText,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);
    setHasInteracted(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/concierge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText, history: historyPayload }),
      });

      const data: ConciergeResponse = await res.json();

      const conciergeMsg: ChatMessage = {
        id: `cnc-${Date.now()}`,
        sender: 'concierge',
        text: data.reply || "I'm here to assist you. What else would you like to explore?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedReplies: data.suggestedReplies ?? DEFAULT_QUICK_REPLIES,
        cardsType: data.cardsType,
        rooms: data.rooms,
        reservations: data.reservations,
      };

      setMessages((prev) => [...prev, conciergeMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'concierge',
          text: "I'm sorry, I couldn't process that right now. Please try again in a moment or contact our front desk.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedReplies: DEFAULT_QUICK_REPLIES,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FLOATING TOGGLE BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-[#1A1918] hover:bg-[#2C2A29] text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl border border-[#C5A46D]/40 transition-all duration-300 hover:scale-105 hover:border-[#C5A46D]"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#A08149] to-[#D4AF37] text-white shadow">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1A1918]" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] block leading-none mb-0.5">
                VELORA AI
              </span>
              <span className="text-xs font-serif text-white tracking-wide">Concierge</span>
            </div>
          </button>
        )}
      </div>

      {/* CHAT WINDOW MODAL / DRAWER */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#FAF8F5] rounded-2xl border border-[#EBE6DD] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          
          {/* HEADER */}
          <div className="bg-[#1A1918] text-white p-4 flex items-center justify-between border-b border-[#C5A46D]/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#A08149] to-[#D4AF37] flex items-center justify-center text-white shadow-md border border-white/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-base font-normal tracking-wide text-white">
                    Virtual Concierge
                  </h3>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-[#C5A46D] font-light">
                  Velora Luxury Guest Service
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MESSAGES BODY */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF8F5]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 px-1 text-[10px] text-zinc-400">
                  {msg.sender === 'concierge' ? (
                    <span className="font-bold text-[#A08149]">Velora Concierge</span>
                  ) : (
                    <span className="font-bold text-zinc-600">You</span>
                  )}
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* TEXT BUBBLE */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1A1918] text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-[#1A1918] rounded-tl-none border border-[#ECE7DF] shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* ROOM CARDS ATTACHMENT */}
                {msg.cardsType === 'rooms' && msg.rooms && msg.rooms.length > 0 && (
                  <div className="w-full space-y-3 pt-2">
                    {msg.rooms.map((room) => (
                      <div
                        key={room._id}
                        className="bg-white rounded-xl border border-[#ECE7DF] overflow-hidden shadow-sm hover:shadow-md transition space-y-2 p-3"
                      >
                        <div className="relative h-28 rounded-lg overflow-hidden bg-neutral-100">
                          <img
                            src={room.imageUrl}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-[#1A1918] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-white/20">
                            #{room.roomNumber}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-serif font-bold text-sm text-[#1A1918]">
                              {room.name}
                            </h4>
                            <span className="font-serif text-sm font-bold text-[#A08149]">
                              ${room.basePrice}<span className="text-[10px] text-zinc-400 font-normal">/night</span>
                            </span>
                          </div>

                          {room.recommendationReason && (
                            <p className="text-[11px] text-[#8C6D34] bg-[#FAF5E6] p-2 rounded border border-[#EAE0C8] font-medium leading-tight">
                              {room.recommendationReason}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-1">
                            <span>👥 Up to {room.capacity} Guests</span>
                            <span>🏢 Floor {room.floor}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#F2EEE8] flex justify-end">
                          <Link
                            href={`/rooms/${room.typeId}`}
                            onClick={() => setIsOpen(false)}
                            className="w-full bg-[#1A1918] hover:bg-[#2C2A29] text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded text-center transition flex items-center justify-center gap-1.5"
                          >
                            <span>Reserve Room #{room.roomNumber}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* RESERVATIONS CARDS ATTACHMENT */}
                {msg.cardsType === 'reservations' && msg.reservations && msg.reservations.length > 0 && (
                  <div className="w-full space-y-3 pt-2">
                    {msg.reservations.map((res) => (
                      <div
                        key={res._id}
                        className="bg-white rounded-xl border border-[#ECE7DF] p-3.5 space-y-2 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-[#F2EEE8] pb-2">
                          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                            REF: {res._id.slice(-8).toUpperCase()}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                            {res.status}
                          </span>
                        </div>

                        <div className="text-xs space-y-1 text-[#1A1918]">
                          <p className="font-bold text-sm">{res.roomTypeName}</p>
                          <p className="text-zinc-500 text-[11px]">Assigned Room: <span className="font-semibold text-[#1A1918]">#{res.roomNumber}</span></p>
                          <p className="text-zinc-500 text-[11px]">Dates: <span className="font-medium text-[#1A1918]">{res.checkIn} → {res.checkOut}</span></p>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[10px] text-zinc-400">{res.guests} Guests</span>
                            <span className="font-serif font-bold text-sm text-[#1A1918]">${res.totalPrice}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SUGGESTED REPLIES PILLS */}
                {msg.suggestedReplies && msg.suggestedReplies.length > 0 && msg === messages[messages.length - 1] && (
                  <div className="flex flex-wrap gap-1.5 pt-2 max-w-[95%]">
                    {msg.suggestedReplies.map((pill) => (
                      <button
                        key={pill}
                        onClick={() => sendMessage(pill)}
                        className="text-[11px] bg-white hover:bg-[#1A1918] text-[#1A1918] hover:text-white border border-[#E2DDD5] px-3 py-1.5 rounded-full transition-all shadow-sm font-medium"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* TYPING INDICATOR */}
            {loading && (
              <div className="flex items-center gap-2 text-zinc-400 bg-white p-3 rounded-2xl border border-[#ECE7DF] w-fit">
                <Loader2 className="w-4 h-4 animate-spin text-[#A08149]" />
                <span className="text-xs font-medium text-[#A08149]">Velora Concierge is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-white border-t border-[#ECE7DF] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your concierge..."
              className="flex-1 bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#1A1918] hover:bg-[#2C2A29] text-white p-2.5 rounded-xl disabled:opacity-40 transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
