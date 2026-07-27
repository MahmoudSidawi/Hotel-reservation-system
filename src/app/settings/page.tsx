"use client";

import { useState } from "react";
import Link from "next/link";

// ---------------------------------------------
// Inline icons (kept consistent with the Customer dashboard)
// ---------------------------------------------
const IconBuilding = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M4 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M13 21h7a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-7M7 7h1M7 11h1M7 15h1M10 7h1M10 11h1M10 15h1M16 12h1M16 16h1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconMenu = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const IconClose = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const IconCheck = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUser = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconBell = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconLock = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const navLinks: { label: string; href: string }[] = [
  { label: "Overview", href: "/Customer" },
  { label: "Rooms", href: "/rooms" },
  { label: "Reservations", href: "/reservations" },
];

type SectionKey = "profile" | "notifications" | "security";

export default function SettingsPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");

  // Profile form
  const [name, setName] = useState("Eleanor Whitfield");
  const [email, setEmail] = useState("eleanor@example.com");
  const [phone, setPhone] = useState("+961 70 123 456");
  const [profileSaved, setProfileSaved] = useState(false);

  // Notification preferences
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [offersAndPromos, setOffersAndPromos] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const sections: { key: SectionKey; label: string; icon: typeof IconUser }[] = [
    { key: "profile", label: "Profile", icon: IconUser },
    { key: "notifications", label: "Notifications", icon: IconBell },
    { key: "security", label: "Security", icon: IconLock },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationsSaved(true);
    setTimeout(() => setNotificationsSaved(false), 2500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }
    setPasswordError("");
    setPasswordSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f5f4f2] font-serif text-[#1c1b19]">
      {/* -------------------- Header -------------------- */}
      <header className="sticky top-0 z-30 bg-[#141312] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/Customer" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
              <IconBuilding className="h-4 w-4 text-white" />
            </span>
            <span className="text-lg tracking-wide">Velora</span>
          </Link>

          <nav className="hidden items-center gap-10 text-xs font-sans font-medium tracking-widest text-white/80 md:flex">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="uppercase transition-colors hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-sans">Eleanor</span>
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
                alt="Eleanor avatar"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-[#c9a15f]"
              />
            </div>
            <button
              onClick={() => setMobileNavOpen((v) => !v)}
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-md text-white md:hidden"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="border-t border-white/10 bg-[#141312] px-5 py-3 font-sans text-sm md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="uppercase tracking-widest text-white/80"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20 pt-8 sm:px-8">
        <div className="mb-8">
          <h1 className="text-4xl leading-tight sm:text-5xl">Settings</h1>
          <p className="mt-2 font-sans text-sm text-neutral-500">
            Manage your profile, notifications, and account security.
          </p>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Section nav */}
          <nav className="flex gap-2 overflow-x-auto font-sans text-sm md:w-56 md:flex-none md:flex-col md:overflow-visible">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-left transition-colors ${
                  activeSection === section.key
                    ? "bg-[#1c1b19] text-white"
                    : "bg-white text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </nav>

          {/* Section content */}
          <div className="flex-1">
            {activeSection === "profile" && (
              <form
                onSubmit={handleSaveProfile}
                className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
              >
                <h2 className="mb-1 text-xl font-semibold">Profile Information</h2>
                <p className="mb-6 font-sans text-sm text-neutral-500">
                  Update your personal details.
                </p>

                <label className="mb-1 block font-sans text-xs font-medium tracking-widest text-neutral-500">
                  FULL NAME
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-4 w-full rounded-md border border-neutral-200 px-3 py-2 font-sans text-sm outline-none focus:border-[#c9a15f]"
                />

                <label className="mb-1 block font-sans text-xs font-medium tracking-widest text-neutral-500">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-4 w-full rounded-md border border-neutral-200 px-3 py-2 font-sans text-sm outline-none focus:border-[#c9a15f]"
                />

                <label className="mb-1 block font-sans text-xs font-medium tracking-widest text-neutral-500">
                  PHONE
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mb-6 w-full rounded-md border border-neutral-200 px-3 py-2 font-sans text-sm outline-none focus:border-[#c9a15f]"
                />

                <button
                  type="submit"
                  className="w-full rounded-md bg-[#1c1b19] px-6 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-black sm:w-auto"
                >
                  Save Changes
                </button>

                {profileSaved && (
                  <p className="mt-3 flex items-center gap-2 font-sans text-sm text-emerald-600">
                    <IconCheck className="h-4 w-4" /> Profile updated.
                  </p>
                )}
              </form>
            )}

            {activeSection === "notifications" && (
              <form
                onSubmit={handleSaveNotifications}
                className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
              >
                <h2 className="mb-1 text-xl font-semibold">Notification Preferences</h2>
                <p className="mb-6 font-sans text-sm text-neutral-500">
                  Choose what you'd like to hear from us.
                </p>

                <div className="space-y-4">
                  <label className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 px-4 py-3">
                    <div>
                      <p className="font-sans text-sm font-medium">Booking updates</p>
                      <p className="font-sans text-xs text-neutral-500">
                        Confirmations, changes, and reminders about your stays.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={bookingUpdates}
                      onChange={(e) => setBookingUpdates(e.target.checked)}
                      className="h-5 w-5 shrink-0 accent-[#c9a15f]"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 px-4 py-3">
                    <div>
                      <p className="font-sans text-sm font-medium">Offers and promotions</p>
                      <p className="font-sans text-xs text-neutral-500">
                        Seasonal rates, member offers, and exclusive events.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={offersAndPromos}
                      onChange={(e) => setOffersAndPromos(e.target.checked)}
                      className="h-5 w-5 shrink-0 accent-[#c9a15f]"
                    />
                  </label>

                  <label className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 px-4 py-3">
                    <div>
                      <p className="font-sans text-sm font-medium">SMS alerts</p>
                      <p className="font-sans text-xs text-neutral-500">
                        Text messages for time-sensitive updates only.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="h-5 w-5 shrink-0 accent-[#c9a15f]"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-md bg-[#1c1b19] px-6 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-black sm:w-auto"
                >
                  Save Preferences
                </button>

                {notificationsSaved && (
                  <p className="mt-3 flex items-center gap-2 font-sans text-sm text-emerald-600">
                    <IconCheck className="h-4 w-4" /> Preferences saved.
                  </p>
                )}
              </form>
            )}

            {activeSection === "security" && (
              <form
                onSubmit={handleSavePassword}
                className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
              >
                <h2 className="mb-1 text-xl font-semibold">Password &amp; Security</h2>
                <p className="mb-6 font-sans text-sm text-neutral-500">
                  Update your password to keep your account secure.
                </p>

                <label className="mb-1 block font-sans text-xs font-medium tracking-widest text-neutral-500">
                  CURRENT PASSWORD
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mb-4 w-full rounded-md border border-neutral-200 px-3 py-2 font-sans text-sm outline-none focus:border-[#c9a15f]"
                />

                <label className="mb-1 block font-sans text-xs font-medium tracking-widest text-neutral-500">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mb-4 w-full rounded-md border border-neutral-200 px-3 py-2 font-sans text-sm outline-none focus:border-[#c9a15f]"
                />

                <label className="mb-1 block font-sans text-xs font-medium tracking-widest text-neutral-500">
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mb-6 w-full rounded-md border border-neutral-200 px-3 py-2 font-sans text-sm outline-none focus:border-[#c9a15f]"
                />

                <button
                  type="submit"
                  className="w-full rounded-md bg-[#1c1b19] px-6 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-black sm:w-auto"
                >
                  Update Password
                </button>

                {passwordError && (
                  <p className="mt-3 font-sans text-sm text-red-600">{passwordError}</p>
                )}
                {passwordSaved && (
                  <p className="mt-3 flex items-center gap-2 font-sans text-sm text-emerald-600">
                    <IconCheck className="h-4 w-4" /> Password updated.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200 py-6">
        <p className="text-center font-sans text-xs text-neutral-400">© 2024 Velora Hospitality Group.</p>
      </footer>
    </div>
  );
}