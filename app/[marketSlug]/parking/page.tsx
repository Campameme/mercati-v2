import { redirect } from 'next/navigation'

// /[zona]/parking → /[zona]  (mappa con parcheggi ora integrata nella home zona)
export default function MarketParkingRedirect({ params }: { params: { marketSlug: string } }) {
  redirect(`/${params.marketSlug}`)
}
