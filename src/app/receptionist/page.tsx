import { getCurrentUser } from "@/lib/session";
import { getDashboardData } from "@/backend/controllers/dashboardController";
import ReceptionistDashboardClient from "@/components/receptionist/ReceptionistDashboardClient";

export default async function ReceptionistDashboardPage() {
  const [user, data] = await Promise.all([getCurrentUser(), getDashboardData()]);
  const serializableData = JSON.parse(JSON.stringify(data));

  return (
    <ReceptionistDashboardClient
      initialData={serializableData}
      userName={user?.name ?? "Receptionist"}
    />
  );
}
