'use client'

import { useState } from 'react'
import ParkingMap from '@/components/ParkingMap'
import ParkingList from '@/components/ParkingList'

export default function ParkingPage() {
  const [selectedParking, setSelectedParking] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Parcheggi Ventimiglia</h1>
        <p className="text-gray-600">
          Trova parcheggi disponibili a Ventimiglia, visualizza tariffe e percorsi accessibili
        </p>
      </div>

      {/* Layout mappa e lista affiancate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mappa - occupa 2/3 dello spazio su desktop */}
        <div className="lg:col-span-2">
          <ParkingMap onSelectParking={setSelectedParking} />
        </div>

        {/* Lista - occupa 1/3 dello spazio su desktop */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <ParkingList onSelectParking={setSelectedParking} />
          </div>
        </div>
      </div>
    </div>
  )
}

