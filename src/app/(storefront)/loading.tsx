export default function StorefrontLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse space-y-4 px-4 py-6" aria-busy="true">
      <div className="h-8 w-1/3 rounded-lg bg-black/10 dark:bg-white/10" />
      <div className="h-48 w-full rounded-2xl bg-black/10 dark:bg-white/10" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-black/10 dark:bg-white/10" />
        ))}
      </div>
    </div>
  );
}
