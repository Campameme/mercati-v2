import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ZoneMeta } from '@/lib/markets/zones'
import { curatedPhoto, zoneHeroKey } from '@/lib/zonePhotos'

// Card zona: foto emblematica curata + nome + carattere, apre /[slug].
// Color-block: fondo notte sotto la foto, sfumatura scura per leggibilità.
export function ZoneCard({ zone }: { zone: ZoneMeta }) {
  const photo = curatedPhoto(zoneHeroKey(zone.slug))
  return (
    <Link
      href={`/${zone.slug}`}
      className="group relative block overflow-hidden imk-edge border-2 border-ink/10 aspect-[4/5] bg-notte"
    >
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-notte via-notte/45 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <h3 className="font-display text-2xl md:text-[1.7rem] text-carta leading-tight">{zone.name}</h3>
        <p className="mt-1 text-sm text-carta/85 leading-snug line-clamp-2">{zone.carattere}</p>
        <span className="mt-2 inline-flex items-center gap-1 font-alt text-[11px] font-bold uppercase tracking-[0.1em] text-sole opacity-0 group-hover:opacity-100 transition-opacity">
          Scopri <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}

// Griglia statica (usata in home per la best-of). Su /zone si usa la versione
// filtrabile animata (ZoneIndex).
export default function ZoneGrid({ zones, className = '' }: { zones: ZoneMeta[]; className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 ${className}`}>
      {zones.map((z) => (
        <ZoneCard key={z.slug} zone={z} />
      ))}
    </div>
  )
}
