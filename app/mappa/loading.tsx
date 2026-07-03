// Skeleton della mappa: barra di ricerca + filtri + riquadro mappa.
export default function Loading() {
  return (
    <div className="bg-carta min-h-[calc(100svh-4rem)]">
      <div className="container mx-auto px-4 md:px-6 pt-3 pb-2 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <div className="imk-skel h-12 flex-1" />
          <div className="imk-skel h-12 w-32 hidden sm:block" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="imk-skel h-8 w-28 rounded-full" />
          <div className="imk-skel h-8 w-24 rounded-full" />
          <div className="imk-skel h-8 w-24 rounded-full" />
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 pb-4">
        <div className="imk-skel h-[58vh] w-full rounded-2xl" />
      </div>
      <span className="sr-only">Caricamento mappa…</span>
    </div>
  )
}
