// Skeleton della bacheca eventi: intestazione + card evento.
export default function Loading() {
  return (
    <div className="bg-paper">
      <div className="container mx-auto px-4 md:px-6 py-10 max-w-5xl space-y-6">
        <div className="space-y-3">
          <div className="imk-skel h-3 w-32" />
          <div className="imk-skel h-9 w-64 max-w-full" />
          <div className="imk-skel h-4 w-96 max-w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="imk-skel h-48 rounded-3xl" />
          ))}
        </div>
      </div>
      <span className="sr-only">Caricamento eventi…</span>
    </div>
  )
}
