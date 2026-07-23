import CheckInWorkflow from "@/components/receptionist/CheckInWorkflow";

export default function CheckInPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-zinc-900">Check In</h2>
        <p className="text-xs text-zinc-500">Find a reservation and check the guest in.</p>
      </div>
      <CheckInWorkflow />
    </div>
  );
}
