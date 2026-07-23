"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function RegisterPage() {
  const router = useRouter();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Registration failed.");
      }

      // Show success screen instead of immediate redirect
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-100">
      {/* Top Navbar */}
      <Navbar />

      {/* Hero Background with Glass Container */}
      <main
        className="relative flex-1 flex flex-col items-center justify-center py-12 px-4 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `url('/login-back.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

        <div className="relative z-10 w-full max-w-xl bg-[#eae6df]/95 backdrop-blur-md p-8 md:p-12 shadow-2xl rounded-xs text-neutral-800 border border-white/20 my-8">
          
          {isSuccess ? (
            /* SUCCESS STATE UI */
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              {/* Green Tick Icon */}
              <div className="mx-auto w-16 h-16 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center text-3xl shadow-inner">
                ✓
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-emerald-800 block">
                  REGISTRATION COMPLETE
                </span>
                <h1 className="text-3xl font-serif text-neutral-900">
                  Welcome to Velora!
                </h1>
                <p className="text-xs text-neutral-600 font-light max-w-sm mx-auto leading-relaxed">
                  Your account has been successfully created. You can now sign in to access your personal sanctuary and view available retreats.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-[#1c1c1c] text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>GO TO SIGN IN</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM UI */
            <>
              <div className="text-center mb-8">
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-amber-800 block mb-1">
                  JOIN THE COLLECTION
                </span>
                <h1 className="text-3xl md:text-4xl font-serif text-neutral-900 mb-3">
                  Create Your Account
                </h1>
                <p className="text-xs text-neutral-600 font-light max-w-sm mx-auto leading-relaxed">
                  Begin your journey with Velora for exclusive benefits and personalized coastal experiences.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Field */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    FULL NAME
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-neutral-400 text-xs">👤</span>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alexander Dupont"
                      className="w-full bg-[#f4f1ea] border border-stone-300 text-xs px-9 py-3 text-neutral-800 focus:outline-none focus:border-neutral-800 transition-colors placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    EMAIL ADDRESS
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-neutral-400 text-xs">✉</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexander@luxury.com"
                      className="w-full bg-[#f4f1ea] border border-stone-300 text-xs px-9 py-3 text-neutral-800 focus:outline-none focus:border-neutral-800 transition-colors placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                {/* Phone Number Field */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    PHONE NUMBER
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-neutral-400 text-xs">📞</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#f4f1ea] border border-stone-300 text-xs px-9 py-3 text-neutral-800 focus:outline-none focus:border-neutral-800 transition-colors placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                {/* Passwords (Side by Side) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                      PASSWORD
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-neutral-400 text-xs">🔒</span>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f4f1ea] border border-stone-300 text-xs px-9 py-3 text-neutral-800 focus:outline-none focus:border-neutral-800 transition-colors placeholder:text-neutral-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-neutral-500 hover:text-neutral-800 text-xs cursor-pointer"
                      >
                        👁
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                      CONFIRM
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-neutral-400 text-xs">🔒</span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#f4f1ea] border border-stone-300 text-xs px-9 py-3 text-neutral-800 focus:outline-none focus:border-neutral-800 transition-colors placeholder:text-neutral-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-neutral-500 hover:text-neutral-800 text-xs cursor-pointer"
                      >
                        👁
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded-none accent-neutral-900 border-stone-400 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-[11px] text-neutral-600 leading-snug cursor-pointer">
                    I agree to the{" "}
                    <Link href="/terms" className="font-bold text-neutral-800 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-bold text-neutral-800 hover:underline">
                      Privacy Policy
                    </Link>
                    , including marketing communications.
                  </label>
                </div>

                {/* Error Message Display */}
                {error && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
                    {error}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1c1c1c] text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md mt-4 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</span>
                  {!loading && <span>→</span>}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-8 text-center text-xs text-neutral-600">
                <p className="mb-1">Already a member of the Velora family?</p>
                <Link
                  href="/login"
                  className="text-[11px] font-bold uppercase tracking-widest text-amber-800 hover:underline"
                >
                  SIGN IN TO YOUR ACCOUNT
                </Link>
              </div>
            </>
          )}

        </div>

        {/* Perks Badges */}
        <div className="relative z-10 flex flex-wrap justify-center items-center gap-8 md:gap-16 text-white/90 mt-2 text-center">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center text-[10px]">✓</span>
            <span className="text-[9px] uppercase tracking-widest font-semibold">MEMBER RATES</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center text-[10px]">✓</span>
            <span className="text-[9px] uppercase tracking-widest font-semibold">PRIORITY UPGRADES</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center text-[10px]">✓</span>
            <span className="text-[9px] uppercase tracking-widest font-semibold">LATE CHECKOUT</span>
          </div>
        </div>
      </main>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
}