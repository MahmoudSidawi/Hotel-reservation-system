const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  checked_in: "bg-emerald-50 text-emerald-700 border-emerald-200",
  checked_out: "bg-zinc-100 text-zinc-600 border-zinc-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  no_show: "bg-orange-50 text-orange-700 border-orange-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  checked_out: "Checked Out",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-zinc-100 text-zinc-600 border-zinc-200";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style}`}
    >
      {label}
    </span>
  );
}
