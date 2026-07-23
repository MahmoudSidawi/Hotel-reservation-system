import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  iconClassName = "text-zinc-400",
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
  iconClassName?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-2">
      <div className="flex justify-between items-center text-zinc-500">
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        <Icon className={`w-5 h-5 ${iconClassName}`} />
      </div>
      <p className="text-3xl font-bold text-zinc-900">{value}</p>
      {helper && <p className="text-xs text-zinc-500">{helper}</p>}
    </div>
  );
}
