import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import ReceptionistSidebar from "@/components/receptionist/Sidebar";

export default async function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // middleware.ts already enforces this for the matched paths; this is a
  // defense-in-depth check in case the layout is ever reached another way.
  if (!user || !["admin", "receptionist"].includes(user.role)) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      <ReceptionistSidebar userName={user.name} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
