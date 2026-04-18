import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Instagram, Facebook, Globe, CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function OperatorDetailPage({ params }: { params: { marketSlug: string; id: string } }) {
  const supabase = createClient()
  const { data: operator } = await supabase
    .from('operators')
    .select('*, markets!inner(slug, name)')
    .eq('id', params.id)
    .maybeSingle()
  if (!operator || operator.markets?.slug !== params.marketSlug) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('operator_id', operator.id)
    .eq('is_available', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  const social = (operator.social_links ?? {}) as Record<string, string>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href={`/${params.marketSlug}/operators`} className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Tutti gli operatori
      </Link>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{operator.name}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded">{operator.category}</span>
              {operator.stall_number && (
                <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />Bancarella {operator.stall_number}</span>
              )}
              {operator.is_open ? (
                <span className="flex items-center text-green-700"><CheckCircle2 className="w-4 h-4 mr-1" />Aperto</span>
              ) : (
                <span className="flex items-center text-red-700"><XCircle className="w-4 h-4 mr-1" />Chiuso</span>
              )}
            </div>
          </div>
        </div>
        {operator.description && <p className="text-gray-700">{operator.description}</p>}

        {operator.photos?.length > 0 && (
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {operator.photos.map((url: string) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="w-40 h-40 object-cover rounded-lg flex-shrink-0" />
            ))}
          </div>
        )}

        <div className="flex items-center flex-wrap gap-3 mt-4 text-sm">
          {operator.languages?.length > 0 && (
            <div className="text-gray-600">Lingue: <strong className="text-gray-900">{operator.languages.join(', ')}</strong></div>
          )}
          {operator.payment_methods?.length > 0 && (
            <div className="text-gray-600">Pagamenti: <strong className="text-gray-900">{operator.payment_methods.join(', ')}</strong></div>
          )}
        </div>

        {(social.instagram || social.facebook || social.website) && (
          <div className="flex items-center space-x-3 mt-4">
            {social.instagram && (
              <a href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-pink-600">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-blue-600">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {social.website && (
              <a href={social.website} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-primary-600">
                <Globe className="w-5 h-5" />
              </a>
            )}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">Prodotti</h2>
      {(!products || products.length === 0) ? (
        <p className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
          Nessun prodotto pubblicato.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
              {p.photos?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.photos[0]} alt={p.name} className="w-full h-40 object-cover" />
              )}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                {p.description && <p className="text-sm text-gray-600 mt-1 flex-1">{p.description}</p>}
                {p.price !== null && (
                  <p className="text-primary-700 font-semibold mt-2">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: p.currency }).format(p.price)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
