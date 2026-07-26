"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const DETAILS = [
  {
    icon: MapPin,
    label: "Visit Us",
    lines: ["123 Coastal Way", "Seafront, CA 90210"],
  },
  {
    icon: Phone,
    label: "Call Us",
    lines: ["+1 (555) 012-3456", "Reservations & Concierge"],
    href: "tel:+15550123456",
  },
  {
    icon: Mail,
    label: "Email Us",
    lines: ["hello@velora.com", "We reply within 24 hours"],
    href: "mailto:hello@velora.com",
  },
  {
    icon: Clock,
    label: "Front Desk",
    lines: ["Open 24 hours", "Check-in from 3:00 PM"],
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // No message backend yet — simulate a send and show confirmation.
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 700);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1918] font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow">
        {/* HERO */}
        <section
          className="relative h-[240px] md:h-[320px] bg-cover bg-center flex items-center justify-center text-center px-4 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(15,15,15,0.5), rgba(15,15,15,0.7)),
              url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2000')`,
          }}
        >
          <div className="max-w-2xl mx-auto space-y-3 z-10 text-white">
            <span className="text-[10px] md:text-xs uppercase font-medium tracking-[0.25em] text-[#E0D5BE] block">
              WE ARE HERE FOR YOU
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight">Get in Touch</h1>
            <div className="w-12 h-px bg-[#C5A46D] mx-auto my-3" />
            <p className="text-sm font-light text-[#ECE7DE] tracking-wide">
              Questions, special requests, or reservations — our concierge is a message away.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

            {/* CONTACT DETAILS */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08149] font-bold">
                  CONTACT DETAILS
                </span>
                <h2 className="font-serif text-2xl font-normal text-[#1A1918]">
                  Reach the Velora Concierge
                </h2>
                <p className="text-xs text-[#736F68] font-light leading-relaxed pt-1">
                  Whether you are planning a stay or already a guest, we are always happy to help.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DETAILS.map(({ icon: Icon, label, lines, href }) => {
                  const body = (
                    <div className="bg-white border border-[#ECE7DF] rounded-lg p-5 h-full hover:shadow-md transition-shadow">
                      <div className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#ECE7DF] flex items-center justify-center text-[#A08149] mb-3">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#1A1918] mb-1">
                        {label}
                      </h3>
                      {lines.map((line, i) => (
                        <p key={i} className={`text-xs ${i === 0 ? "text-[#1A1918] font-medium" : "text-[#8C8880]"}`}>
                          {line}
                        </p>
                      ))}
                    </div>
                  );
                  return href ? (
                    <a key={label} href={href} className="block">
                      {body}
                    </a>
                  ) : (
                    <div key={label}>{body}</div>
                  );
                })}
              </div>
            </div>

            {/* CONTACT FORM */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-[#ECE7DF] rounded-xl shadow-sm p-6 md:p-8">
                {sent ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-14 h-14 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-2xl font-normal text-[#1A1918]">Message Sent</h3>
                    <p className="text-xs text-[#736F68] max-w-sm mx-auto leading-relaxed">
                      Thank you, {name || "guest"}. Our concierge team has received your message and will be in
                      touch shortly at {email || "your email"}.
                    </p>
                    <button
                      onClick={() => {
                        setSent(false);
                        setName("");
                        setEmail("");
                        setSubject("");
                        setMessage("");
                      }}
                      className="inline-block bg-[#1A1918] hover:bg-[#2C2A29] text-white text-xs font-bold uppercase tracking-[0.18em] px-6 py-3 rounded transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08149] font-bold">
                        SEND A MESSAGE
                      </span>
                      <h2 className="font-serif text-2xl font-normal text-[#1A1918] mt-1">
                        How can we help?
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">
                          Full Name <span className="text-red-500">*</span>
                        </span>
                        <input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Alexander Dupont"
                          className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                        />
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">
                          Email <span className="text-red-500">*</span>
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="alexander@luxury.com"
                          className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                        />
                      </label>
                    </div>

                    <label className="block space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">
                        Subject
                      </span>
                      <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Reservation enquiry, special request..."
                        className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D]"
                      />
                    </label>

                    <label className="block space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">
                        Message <span className="text-red-500">*</span>
                      </span>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us how we can make your stay perfect..."
                        className="w-full bg-[#FAF8F5] border border-[#E2DDD5] rounded px-3 py-2.5 text-xs text-[#1A1918] focus:outline-none focus:border-[#C5A46D] resize-y"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#1A1918] hover:bg-[#2C2A29] text-white font-bold tracking-[0.2em] text-xs uppercase py-3.5 rounded transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 text-[#C5A46D]" />
                      )}
                      <span>{submitting ? "SENDING..." : "SEND MESSAGE"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
