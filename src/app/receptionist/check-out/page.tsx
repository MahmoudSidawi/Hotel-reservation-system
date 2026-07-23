import CheckOutWorkflow from "@/components/receptionist/CheckOutWorkflow";

export default function CheckOutPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-zinc-900">Check Out</h2>
        <p className="text-xs text-zinc-500">Find a current guest and complete their check-out.</p>
      </div>
      <CheckOutWorkflow />
    </div>
  );
}
