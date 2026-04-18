'use client'

import dynamic from 'next/dynamic'

const ProvinceMap = dynamic(() => import('@/components/ProvinceMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] md:h-[520px] w-full rounded-xl bg-gray-100 flex items-center justify-center shadow-md border border-gray-200">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
    </div>
  ),
})

interface Session {
  market_id: string
  market_slug: string
  market_name: string
  comune: string
  giorno: string
  orario: string | null
  luogo: string | null
  lat: number | null
  lng: number | null
}

export default function ProvinceMapWrapper({ sessions }: { sessions: Session[] }) {
  return <ProvinceMap sessions={sessions} />
}
