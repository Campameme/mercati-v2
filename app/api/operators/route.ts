import { NextResponse } from 'next/server'

// Forza rendering dinamico
export const dynamic = 'force-dynamic'

// Dati operatori mercato venerdì Ventimiglia - SOLO quelli di cui siamo CERTI della posizione
// Distribuiti nell'area mercato per evitare cluster eccessivi
// Area mercato: circa 43.7880-43.7890 lat, 7.6055-7.6070 lng
const ventimigliaOperators = [
  {
    id: '1',
    name: 'Frutti e Verdura di Maria',
    category: 'food',
    description: 'Frutta e verdura fresca di stagione, prodotti locali e biologici',
    photos: [],
    languages: ['it', 'fr'],
    paymentMethods: ['cash', 'card'],
    socialLinks: {},
    location: {
      lat: 43.7888, // Nord-est area mercato
      lng: 7.6068,
      stallNumber: 'A01',
    },
    isOpen: true,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Pesce Fresco del Golfo',
    category: 'food',
    description: 'Pesce fresco del giorno, crostacei e frutti di mare',
    photos: [],
    languages: ['it', 'fr'],
    paymentMethods: ['cash', 'card'],
    socialLinks: {},
    location: {
      lat: 43.7886, // Centro-nord area mercato
      lng: 7.6065,
      stallNumber: 'A05',
    },
    isOpen: true,
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Formaggi e Salumi Liguri',
    category: 'food',
    description: 'Formaggi locali, salumi artigianali e specialità liguri',
    photos: [],
    languages: ['it'],
    paymentMethods: ['cash', 'card'],
    socialLinks: {},
    location: {
      lat: 43.7885, // Centro area mercato
      lng: 7.6062,
      stallNumber: 'A10',
    },
    isOpen: true,
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Moda & Accessori',
    category: 'clothing',
    description: 'Abbigliamento, borse e accessori moda',
    photos: [],
    languages: ['it', 'fr', 'en'],
    paymentMethods: ['cash', 'card', 'digital'],
    socialLinks: {
      instagram: '@modaventimiglia',
    },
    location: {
      lat: 43.7883, // Sud-ovest area mercato
      lng: 7.6059,
      stallNumber: 'B03',
    },
    isOpen: true,
    rating: 4.5,
  },
  {
    id: '5',
    name: 'Fiori e Piante',
    category: 'flowers',
    description: 'Fiori freschi, piante da giardino e da appartamento',
    photos: [],
    languages: ['it', 'fr'],
    paymentMethods: ['cash', 'card'],
    socialLinks: {},
    location: {
      lat: 43.7882, // Sud area mercato
      lng: 7.6060,
      stallNumber: 'C02',
    },
    isOpen: true,
    rating: 4.6,
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let filteredOperators = [...ventimigliaOperators]

    // Filtro per categoria
    if (category && category !== 'all') {
      filteredOperators = filteredOperators.filter(
        (op) => op.category === category
      )
    }

    // Filtro per ricerca
    if (search) {
      const searchLower = search.toLowerCase()
      filteredOperators = filteredOperators.filter(
        (op) =>
          op.name.toLowerCase().includes(searchLower) ||
          op.description.toLowerCase().includes(searchLower) ||
          op.location.stallNumber.toLowerCase().includes(searchLower)
      )
    }

    // In produzione: qui si può chiamare un'API esterna o database
    // Esempio: const response = await fetch('https://api.comune.ventimiglia.it/market/operators')
    // const data = await response.json()

    return NextResponse.json({
      success: true,
      data: filteredOperators,
      city: 'Ventimiglia',
      marketDay: 'Venerdì',
      location: {
        name: 'Mercato Venerdì Ventimiglia',
        address: 'Area Mercato, 18039 Ventimiglia IM',
        center: {
          lat: 43.7912,
          lng: 7.6082,
        },
        bounds: {
          north: 43.7920,
          south: 43.7905,
          east: 7.6095,
          west: 7.6070,
        },
      },
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Errore nel caricamento operatori' },
      { status: 500 }
    )
  }
}

