import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import ReceptionistShell from "../../components/receptionist/ReceptionistShell";

export default async function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // middleware.ts already enforces this for the matched paths; this is a
  // defense-in-depth check in case the layout is ever reached another way.
  if (!user || !["admin", "receptionist"].includes(user.role)) {
    redirect("/login");
  }

  return <ReceptionistShell userName={user.name}>{children}</ReceptionistShell>;
}