// Skeleton della pagina mercato: hero foto + mappa + card.
export default function Loading() {
  return (
    <div className="bg-carta">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl space-y-6">
        <div className="imk-skel h-4 w-40" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="imk-skel aspect-[4/5] max-h-[420px] rounded-3xl" />
          <div className="space-y-4">
            <div className="imk-skel h-10 w-3/4" />
            <div className="imk-skel h-4 w-1/2" />
            <div className="imk-skel h-24 w-full" />
            <div className="imk-skel h-[220px] w-full rounded-2xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="imk-skel h-24" />
          <div className="imk-skel h-24" />
          <div className="imk-skel h-24" />
          <div className="imk-skel h-24" />
        </div>
      </div>
      <span className="sr-only">Caricamento…</span>
    </div>
  )
}
