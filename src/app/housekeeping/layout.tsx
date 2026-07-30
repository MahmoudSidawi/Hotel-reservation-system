import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function HousekeepingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "housekeeping" && user.role !== "admin")) {
    redirect("/login?callbackUrl=/housekeeping");
  }
  return <>{children}</>;
}
