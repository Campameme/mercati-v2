'use client'

import { Operator } from '@/types/operator'
import { MapPin, Globe, CreditCard, Banknote, Smartphone, Navigation, Star, BadgeCheck, MessageCircle } from 'lucide-react'
import { BancoPlaceholder } from '@/components/BancoAvatar'

interface OperatorCardProps {
  operator: Operator
  onNavigate: (operator: Operator) => void
}

const CAT_LABEL: Record<string, string> = {
  food: 'Alimentare',
  clothing: 'Abbigliamento',
  accessories: 'Accessori',
  electronics: 'Elettronica',
  home: 'Casa',
  books: 'Libri',
  flowers: 'Fiori',
  other: 'Altro',
  fruit_vegetables: 'Frutta e verdura',
  bakery: 'Panificio',
  meat_fish: 'Carne e pesce',
  dairy: 'Latticini',
}

function waHref(value: string): string {
  if (/^https?:\/\//i.test(value)) return value
  return `https://wa.me/${value.replace(/[^0-9]/g, '')}`
}

export default function OperatorCard({ operator, onNavigate }: OperatorCardProps) {
  const paymentIcons = {
    cash: Banknote,
    card: CreditCard,
    digital: Smartphone,
  }

  const whatsapp = operator.socialLinks?.whatsapp
  // Badge "Verificato": mostrato solo se il dato è presente (campo opzionale).
  const verified = (operator as { verified?: boolean }).verified === true

  return (
    <div className="imk-lift bg-white border-2 border-ink/10 rounded-xl overflow-hidden flex flex-col">
      {/* Testata: foto o placeholder duotone mare→sole */}
      <div className="relative">
        {operator.photos?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={operator.photos[0]} alt={operator.name} className="w-full h-44 object-cover" />
        ) : (
          <BancoPlaceholder name={operator.name} className="w-full h-44" />
        )}
        {/* Badge sovrapposti */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sole text-ink rounded-full font-alt text-[10px] font-semibold uppercase tracking-wider shadow-sm">
              <BadgeCheck className="w-3.5 h-3.5" /> Verificato
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Nome + categoria */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-lg text-ink leading-tight">{operator.name}</h3>
          <span className="flex-shrink-0 font-alt text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-sole/30 text-ink rounded-full">
            {CAT_LABEL[operator.category] ?? operator.category}
          </span>
        </div>

        {/* Banco + rating */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted mb-3">
          {operator.location.stallNumber && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Banco {operator.location.stallNumber}
            </span>
          )}
          {operator.rating && (
            <span className="inline-flex items-center gap-1 text-ink-soft font-semibold">
              <Star className="w-3.5 h-3.5 text-sole fill-sole" /> {operator.rating}
            </span>
          )}
        </div>

        {operator.description && (
          <p className="text-sm text-ink-soft mb-4">{operator.description}</p>
        )}

        {/* Lingue */}
        {operator.languages.length > 0 && (
          <div className="mb-3">
            <p className="font-alt text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">Lingue parlate</p>
            <div className="flex flex-wrap gap-1.5">
              {operator.languages.map((lang) => (
                <span key={lang} className="px-2 py-0.5 bg-marel text-mare-700 text-xs rounded-full">
                  {lang.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pagamenti */}
        {operator.paymentMethods.length > 0 && (
          <div className="mb-4">
            <p className="font-alt text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-1.5">Pagamenti</p>
            <div className="flex flex-wrap gap-1.5">
              {operator.paymentMethods.map((method) => {
                const Icon = paymentIcons[method]
                return (
                  <span key={method} className="inline-flex items-center gap-1 px-2 py-0.5 bg-carta border border-ink/10 text-ink-soft text-xs rounded-full">
                    <Icon className="w-3 h-3" />
                    {method === 'cash' ? 'Contanti' : method === 'card' ? 'Carta' : 'Digitale'}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Social */}
        {operator.socialLinks && (operator.socialLinks.facebook || operator.socialLinks.instagram || operator.socialLinks.website) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 text-sm">
            {operator.socialLinks.facebook && (
              <a
                href={`https://facebook.com/${operator.socialLinks.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mare hover:text-mare-600"
              >
                Facebook
              </a>
            )}
            {operator.socialLinks.instagram && (
              <a
                href={`https://instagram.com/${operator.socialLinks.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fiore hover:text-fiore-600"
              >
                Instagram
              </a>
            )}
            {operator.socialLinks.website && (
              <a
                href={operator.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-ink-soft hover:text-ink"
              >
                <Globe className="w-4 h-4" /> Sito web
              </a>
            )}
          </div>
        )}

        {/* Azioni: WhatsApp + Portami al banco */}
        <div className="mt-auto flex items-center gap-2">
          {whatsapp && (
            <a
              href={waHref(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp — ${operator.name}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-3 bg-[#25D366] text-white rounded-xl text-sm font-alt font-semibold hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          )}
          <button
            onClick={() => onNavigate(operator)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-mare text-white rounded-xl font-alt font-semibold hover:bg-mare-600 transition-colors"
          >
            <Navigation className="w-5 h-5" />
            <span>Portami al banco</span>
          </button>
        </div>
      </div>
    </div>
  )
}
