"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { useAuth } from "@/context/AuthContext";

// ---------------------------------------------
// Inline icons
// ---------------------------------------------
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

type SectionKey = "profile" | "notifications" | "security";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionKey>("profile");

  // Profile form — prefilled from the real logged-in account.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Notification preferences
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [offersAndPromos, setOffersAndPromos] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [notificationsSaved, setNotificationsSaved] = useState(false);
  const [notifError, setNotifError] = useState("");
  const [notifSaving, setNotifSaving] = useState(false);

  // Security
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Prefill every field from the real account once it's loaded.
  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      setBookingUpdates(user.notificationPrefs?.bookingUpdates ?? true);
      setOffersAndPromos(user.notificationPrefs?.offersAndPromos ?? true);
      setSmsAlerts(user.notificationPrefs?.smsAlerts ?? false);
    }
  }, [user]);

  const sections: { key: SectionKey; label: string; icon: typeof IconUser }[] = [
    { key: "profile", label: "Profile", icon: IconUser },
    { key: "notifications", label: "Notifications", icon: IconBell },
    { key: "security", label: "Security", icon: IconLock },
  ];

  const patchUser = async (body: Record<string, unknown>) => {
    if (!user) throw new Error("You must be logged in.");
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
    return data;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSaving(true);
    try {
      await patchUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
      });
      await refreshUser();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifError("");
    setNotifSaving(true);
    try {
      await patchUser({ notificationPrefs: { bookingUpdates, offersAndPromos, smsAlerts } });
      await refreshUser();
      setNotificationsSaved(true);
      setTimeout(() => setNotificationsSaved(false), 2500);
    } catch (err) {
      setNotifError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setNotifSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }
    setPasswordError("");
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Update failed.");
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f4f2] font-serif text-[#1c1b19] flex flex-col">
      {/* Shared site navigation — same navbar as the rest of the site */}
      <Navbar />

      <main className="mx-auto w-full max-w-5xl flex-grow px-5 pb-20 pt-8 sm:px-8">
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
                  disabled={profileSaving}
                  className="w-full rounded-md bg-[#1c1b19] px-6 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50 sm:w-auto"
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>

                {profileError && (
                  <p className="mt-3 font-sans text-sm text-red-600">{profileError}</p>
                )}
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
                  disabled={notifSaving}
                  className="mt-6 w-full rounded-md bg-[#1c1b19] px-6 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50 sm:w-auto"
                >
                  {notifSaving ? "Saving..." : "Save Preferences"}
                </button>

                {notifError && (
                  <p className="mt-3 font-sans text-sm text-red-600">{notifError}</p>
                )}
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
                  disabled={passwordSaving}
                  className="w-full rounded-md bg-[#1c1b19] px-6 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-50 sm:w-auto"
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
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

      {/* Shared site footer */}
      <Footer />
    </div>
  );
}