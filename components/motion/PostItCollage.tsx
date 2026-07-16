import type { StackPhoto } from './PhotoStack'

/**
 * Collage di foto in stile "post-it": bigliettini bianchi (cornice polaroid)
 * inclinati e sovrapposti, con un pezzetto di nastro e la didascalia sotto.
 * Statico, leggero, sistema Nodo × Mezzogiorno. Usa le prime 3 foto.
 */
function Note({
  photo,
  wrap,
  tape,
}: {
  photo: StackPhoto
  wrap: string
  tape: string
}) {
  return (
    <figure className={`m-0 bg-white p-2 pb-2.5 rounded-[2px] shadow-[0_16px_32px_-16px_rgba(38,36,30,0.6)] ${wrap}`}>
      <span aria-hidden="true" className={`absolute -top-2.5 h-5 w-14 rounded-[1px] bg-limone/55 shadow-sm ${tape}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={photo.alt} loading="lazy" className="w-full aspect-[4/5] object-cover" />
      {photo.caption && (
        <figcaption className="mt-1.5 px-0.5 font-alt italic text-[13px] text-ink-soft leading-tight">{photo.caption}</figcaption>
      )}
    </figure>
  )
}

/**
 * Un post-it singolo da appoggiare dove serve (bordo di una sezione, angolo
 * di un header). Con `float` galleggia piano (.imk-float, reduced-motion
 * safe); `tilt` è l'inclinazione in gradi, conservata anche mentre fluttua.
 */
export function PostItNote({
  photo,
  className = '',
  tilt = -3,
  float = true,
  aspect = 'aspect-[4/5]',
}: {
  photo: StackPhoto
  className?: string
  tilt?: number
  float?: boolean
  aspect?: string
}) {
  return (
    <figure
      className={`m-0 relative bg-white p-2 pb-2.5 rounded-[2px] shadow-[0_16px_32px_-16px_rgba(38,36,30,0.6)] ${float ? 'imk-float' : ''} ${className}`}
      style={{ ['--tilt' as string]: `${tilt}deg`, transform: float ? undefined : `rotate(${tilt}deg)` }}
    >
      <span aria-hidden="true" className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-14 rounded-[1px] bg-limone/55 shadow-sm" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={photo.alt} loading="lazy" className={`w-full ${aspect} object-cover`} />
      {photo.caption && (
        <figcaption className="mt-1.5 px-0.5 font-alt italic text-[13px] text-ink-soft leading-tight">{photo.caption}</figcaption>
      )}
    </figure>
  )
}

export default function PostItCollage({
  photos,
  className = '',
}: {
  photos: StackPhoto[]
  className?: string
}) {
  const notes = photos.slice(0, 3)
  return (
    <div className={`relative mx-auto w-full max-w-md aspect-[4/5] ${className}`}>
      {notes[0] && (
        <Note photo={notes[0]} wrap="absolute left-[5%] top-[6%] w-[60%] -rotate-2 z-20" tape="left-1/2 -translate-x-1/2 -rotate-2" />
      )}
      {notes[1] && (
        <Note photo={notes[1]} wrap="absolute right-[1%] top-0 w-[44%] rotate-3 z-30" tape="left-1/2 -translate-x-1/2 rotate-6" />
      )}
      {notes[2] && (
        <Note photo={notes[2]} wrap="absolute left-0 bottom-[2%] w-[46%] -rotate-3 z-10" tape="left-5 -rotate-12" />
      )}
    </div>
  )
}
