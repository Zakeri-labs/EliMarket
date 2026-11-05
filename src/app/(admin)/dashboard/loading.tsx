import { AdminShell } from "@/app/(admin)/_components/AdminShell";

export default function DashboardLoading() {
  return (
    <AdminShell intro={false} title={<span className="block h-7 w-40 animate-pulse rounded-lg bg-[var(--skeleton)]" aria-hidden />}>
      <div className="animate-pulse space-y-3" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 w-full rounded-xl bg-[var(--skeleton)]" />
        ))}
      </div>
    </AdminShell>
  );
}
