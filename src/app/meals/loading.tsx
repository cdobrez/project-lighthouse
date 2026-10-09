export default function MealsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-busy>
      <div className="h-4 w-32 animate-pulse rounded-full bg-cream-deep" />
      <div className="mt-3 h-10 w-80 animate-pulse rounded-full bg-cream-deep" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[290px_1fr]">
        <div className="card h-[520px] animate-pulse" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-80 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
