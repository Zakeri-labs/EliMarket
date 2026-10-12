export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-4 p-4" aria-busy="true">
      <div className="h-8 w-1/4 rounded-lg bg-[#e4e4e7]" />
      <div className="h-10 w-full rounded-lg bg-[#e4e4e7]" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 w-full rounded-lg bg-[#f4f4f5]" />
      ))}
    </div>
  );
}
