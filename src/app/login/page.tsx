"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your sign-in logic here
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-100">
    

      {/* Hero Background with Centered Glass Card */}
      <main className="relative flex-1 flex items-center justify-center py-16 px-4 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url('/login-back.png')`,
        }}
      >
        {/* Dark Soft Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

        {/* Login Card Container */}
        <div className="relative z-10 w-full max-w-lg bg-[#eae6df]/95 backdrop-blur-md p-8 md:p-12 shadow-2xl rounded-xs text-neutral-800 border border-white/20">
          
          {/* Top Gold Badge */}
          <div className="absolute top-0 right-0 bg-[#c59d5f] text-neutral-950 text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 shadow-sm">
            PREFERRED PARTNER
          </div>

          {/* Header Text */}
          <div className="text-center mb-8 pt-2">
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-neutral-500 block mb-1">
              WELCOME BACK
            </span>
            <h1 className="text-3xl md:text-4xl font-serif text-neutral-900 mb-2">
              Sign In to Velora
            </h1>
            <p className="text-xs text-neutral-600 font-light max-w-xs mx-auto leading-relaxed">
              Access your personal sanctuary and manage your upcoming coastal retreats.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                EMAIL ADDRESS
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-neutral-400 text-sm">✉</span>
                <input
                  type="email"
                  required
                  placeholder="e.g. julian@luxury.com"
                  className="w-full bg-[#f4f1ea] border border-stone-300 text-xs px-9 py-3 text-neutral-800 focus:outline-none focus:border-neutral-800 transition-colors placeholder:text-neutral-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                  PASSWORD
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[10px] uppercase tracking-wider font-semibold text-amber-800 hover:underline"
                >
                  FORGOT?
                </Link>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-neutral-400 text-sm">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#f4f1ea] border border-stone-300 text-xs px-9 py-3 text-neutral-800 focus:outline-none focus:border-neutral-800 transition-colors placeholder:text-neutral-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-neutral-500 hover:text-neutral-800 text-xs"
                >
                  👁
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#1c1c1c] text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md mt-2"
            >
              SIGN IN
            </button>
          </form>

   

          {/* Bottom Links */}
          <div className="mt-8 text-center space-y-2 text-xs text-neutral-600">
            <p>
              New to Velora?{" "}
              <Link href="/register" className="font-bold text-neutral-900 hover:underline">
                Create an account
              </Link>
            </p>
            <div>
              <Link
                href="/#rooms"
                className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 hover:underline inline-flex items-center gap-1"
              >
                EXPLORE ROOMS FIRST →
              </Link>
            </div>
          </div>

        </div>
      </main>

      
    </div>
  );
}