// Parcheggi reali vicino ai mercati — estratti da OpenStreetMap (Overpass) sulle
// posizioni precise dei mercati. Statici e versionati: nessuna dipendenza da
// Google Places. `nearestParkings` ordina per distanza dal punto del mercato.
import { haversineMeters } from '@/lib/markets/geo'

export interface ParkingSpot {
  name: string
  lat: number
  lng: number
  /** true = a pagamento, false = gratuito, null = non noto */
  fee: boolean | null
}

export interface ComuneParkings {
  comune: string
  parkings: ParkingSpot[]
}

export const PARKINGS: ComuneParkings[] = [
  {
    "comune": "Ventimiglia",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.790006,
        "lng": 7.608046,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.789885,
        "lng": 7.608181,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.791764,
        "lng": 7.606187,
        "fee": false
      },
      {
        "name": "Piazza della Libertà",
        "lat": 43.790384,
        "lng": 7.608476,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.790667,
        "lng": 7.607149,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.78948,
        "lng": 7.609056,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.792371,
        "lng": 7.608323,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.793834,
        "lng": 7.60561,
        "fee": null
      }
    ]
  },
  {
    "comune": "Camporosso",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.784572,
        "lng": 7.631638,
        "fee": null
      },
      {
        "name": "Piazza Bosio Adorni",
        "lat": 43.815059,
        "lng": 7.627877,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.814618,
        "lng": 7.627751,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.815365,
        "lng": 7.629704,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.81606,
        "lng": 7.629434,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.814103,
        "lng": 7.627497,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.814374,
        "lng": 7.630092,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.78671,
        "lng": 7.631443,
        "fee": null
      }
    ]
  },
  {
    "comune": "Vallecrosia",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.783733,
        "lng": 7.639993,
        "fee": null
      },
      {
        "name": "Parcheggio Goso",
        "lat": 43.783871,
        "lng": 7.642887,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.78484,
        "lng": 7.639925,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.783451,
        "lng": 7.638238,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.782589,
        "lng": 7.644619,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.784932,
        "lng": 7.639196,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.783483,
        "lng": 7.637913,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.78399,
        "lng": 7.637902,
        "fee": null
      }
    ]
  },
  {
    "comune": "Perinaldo",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.867249,
        "lng": 7.673147,
        "fee": null
      },
      {
        "name": "Piazza Monsignor Antonio Rossi",
        "lat": 43.867047,
        "lng": 7.673503,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.868254,
        "lng": 7.668201,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.868186,
        "lng": 7.66788,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.8671,
        "lng": 7.67453,
        "fee": null
      },
      {
        "name": "Piazzale Ernesto Che Guevara",
        "lat": 43.8667,
        "lng": 7.674676,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.866788,
        "lng": 7.674746,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.868504,
        "lng": 7.667521,
        "fee": false
      }
    ]
  },
  {
    "comune": "Bordighera",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.780412,
        "lng": 7.653321,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.780663,
        "lng": 7.653105,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.780394,
        "lng": 7.653672,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.780555,
        "lng": 7.652782,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.781043,
        "lng": 7.654136,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.781832,
        "lng": 7.65412,
        "fee": null
      },
      {
        "name": "Parcheggio interrato",
        "lat": 43.782784,
        "lng": 7.651593,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.780331,
        "lng": 7.657076,
        "fee": null
      }
    ]
  },
  {
    "comune": "Ospedaletti",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.801525,
        "lng": 7.709646,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.800183,
        "lng": 7.7207,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.801603,
        "lng": 7.713001,
        "fee": true
      },
      {
        "name": "Parcheggio interrato",
        "lat": 43.799707,
        "lng": 7.721885,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.801677,
        "lng": 7.714696,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.802113,
        "lng": 7.718324,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.803526,
        "lng": 7.705089,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.806117,
        "lng": 7.711143,
        "fee": null
      }
    ]
  },
  {
    "comune": "Sanremo",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.818144,
        "lng": 7.772953,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.809265,
        "lng": 7.762368,
        "fee": true
      },
      {
        "name": "Parcheggio interrato di Piazza Colombo",
        "lat": 43.817945,
        "lng": 7.778795,
        "fee": null
      },
      {
        "name": "Private Parking",
        "lat": 43.809963,
        "lng": 7.760832,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.826195,
        "lng": 7.8421,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.811567,
        "lng": 7.732945,
        "fee": null
      },
      {
        "name": "Parcheggio interrato",
        "lat": 43.819638,
        "lng": 7.77918,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.810679,
        "lng": 7.762425,
        "fee": null
      }
    ]
  },
  {
    "comune": "Taggia",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.831593,
        "lng": 7.851019,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.831884,
        "lng": 7.852457,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.83126,
        "lng": 7.853388,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.830574,
        "lng": 7.847663,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.833098,
        "lng": 7.853675,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.834001,
        "lng": 7.850741,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.831488,
        "lng": 7.855959,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.834016,
        "lng": 7.854364,
        "fee": null
      }
    ]
  },
  {
    "comune": "Santo Stefano al Mare",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.837928,
        "lng": 7.888866,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.837695,
        "lng": 7.887951,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.838144,
        "lng": 7.890173,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.838239,
        "lng": 7.891095,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.837758,
        "lng": 7.885226,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.838068,
        "lng": 7.884534,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.839925,
        "lng": 7.883817,
        "fee": null
      },
      {
        "name": "Piazza Ughetto",
        "lat": 43.836758,
        "lng": 7.880986,
        "fee": true
      }
    ]
  },
  {
    "comune": "Riva Ligure",
    "parkings": [
      {
        "name": "Piazza Ughetto",
        "lat": 43.836758,
        "lng": 7.880986,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.838068,
        "lng": 7.884534,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.837758,
        "lng": 7.885226,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.839925,
        "lng": 7.883817,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.837695,
        "lng": 7.887951,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.837928,
        "lng": 7.888866,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.836945,
        "lng": 7.873918,
        "fee": null
      }
    ]
  },
  {
    "comune": "San Lorenzo al Mare",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.853244,
        "lng": 7.964314,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.854111,
        "lng": 7.961736,
        "fee": null
      },
      {
        "name": "linee blu",
        "lat": 43.854329,
        "lng": 7.961101,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.853526,
        "lng": 7.965479,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.854638,
        "lng": 7.960868,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.855644,
        "lng": 7.962478,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.855747,
        "lng": 7.962375,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.85557,
        "lng": 7.961157,
        "fee": false
      }
    ]
  },
  {
    "comune": "Imperia",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.888508,
        "lng": 8.043638,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.888292,
        "lng": 8.043513,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.876987,
        "lng": 8.01588,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.878754,
        "lng": 8.0143,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.87577,
        "lng": 8.015654,
        "fee": true
      },
      {
        "name": "Piazza Duomo",
        "lat": 43.875354,
        "lng": 8.01474,
        "fee": false
      },
      {
        "name": "Senatore Aldo Amadeo",
        "lat": 43.876072,
        "lng": 8.012748,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.878905,
        "lng": 8.014304,
        "fee": false
      }
    ]
  },
  {
    "comune": "Diano Marina",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.910187,
        "lng": 8.081469,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.911181,
        "lng": 8.084508,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.910834,
        "lng": 8.085023,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.910826,
        "lng": 8.082352,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.910941,
        "lng": 8.081923,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.910991,
        "lng": 8.081964,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.911549,
        "lng": 8.085393,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.91193,
        "lng": 8.08232,
        "fee": true
      }
    ]
  },
  {
    "comune": "San Bartolomeo al Mare",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.921302,
        "lng": 8.104667,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.921448,
        "lng": 8.105169,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.921239,
        "lng": 8.105116,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.920965,
        "lng": 8.10684,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.921697,
        "lng": 8.105799,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.921644,
        "lng": 8.107462,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 43.921019,
        "lng": 8.103189,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.921528,
        "lng": 8.107941,
        "fee": true
      }
    ]
  },
  {
    "comune": "Cervo",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.925205,
        "lng": 8.113371,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.925374,
        "lng": 8.113396,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.924173,
        "lng": 8.110843,
        "fee": true
      },
      {
        "name": "Parcheggio",
        "lat": 43.926054,
        "lng": 8.113322,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.924514,
        "lng": 8.110548,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.926212,
        "lng": 8.112954,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.923802,
        "lng": 8.110725,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 43.925418,
        "lng": 8.110073,
        "fee": null
      }
    ]
  },
  {
    "comune": "Pieve di Teco",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 44.047452,
        "lng": 7.916395,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 44.047764,
        "lng": 7.916075,
        "fee": false
      },
      {
        "name": "Parcheggio",
        "lat": 44.047775,
        "lng": 7.915024,
        "fee": null
      },
      {
        "name": "Parcheggio",
        "lat": 44.047667,
        "lng": 7.913656,
        "fee": null
      }
    ]
  },
  {
    "comune": "Pontedassio",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 43.933651,
        "lng": 8.000481,
        "fee": null
      }
    ]
  },
  {
    "comune": "Pornassio",
    "parkings": [
      {
        "name": "Parcheggio",
        "lat": 44.085141,
        "lng": 7.873593,
        "fee": null
      }
    ]
  }
]

const BY_COMUNE = new Map(PARKINGS.map((c) => [c.comune.toLowerCase(), c.parkings]))

export function parkingsForComune(comune: string): ParkingSpot[] {
  return BY_COMUNE.get((comune || '').toLowerCase()) ?? []
}

/** Parcheggi del comune ordinati per distanza dal punto, con distanza in metri. */
export function nearestParkings(
  lat: number,
  lng: number,
  comune: string,
  n = 4,
): Array<ParkingSpot & { distance: number }> {
  return parkingsForComune(comune)
    .map((p) => ({ ...p, distance: Math.round(haversineMeters({ lat, lng }, { lat: p.lat, lng: p.lng })) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, n)
}
