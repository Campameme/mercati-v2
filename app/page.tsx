import { loadPins } from '@/lib/markets/loadPins'
import MapHome from '@/components/home/MapHome'
import PageviewTracker from '@/components/analytics/PageviewTracker'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const pins = await loadPins()
  return (
    <>
      <PageviewTracker type="view_homepage" />
      <MapHome pins={pins} />
    </>
  )
}
