// Skeleton degli ambulanti: intestazione + griglia di card.
export default function Loading() {
  return (
    <div className="bg-paper">
      <div className="container mx-auto px-4 md:px-6 py-10 max-w-6xl space-y-6">
        <div className="space-y-3">
          <div className="imk-skel h-3 w-36" />
          <div className="imk-skel h-9 w-72 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="imk-skel h-9 w-28 rounded-full" />
          <div className="imk-skel h-9 w-24 rounded-full" />
          <div className="imk-skel h-9 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="imk-skel h-44 rounded-3xl" />
          ))}
        </div>
      </div>
      <span className="sr-only">Caricamento ambulanti…</span>
    </div>
  )
}
