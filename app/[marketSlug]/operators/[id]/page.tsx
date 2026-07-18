import { redirect } from 'next/navigation'

// Il profilo del banco ha un URL canonico SENZA zona (/operatori/[id]): un
// operatore sta su più mercati, la zona nel link era fuorviante. I vecchi link
// /[zona]/operators/[id] restano validi con un redirect permanente.
export default function LegacyOperatorRedirect({ params }: { params: { marketSlug: string; id: string } }) {
  redirect(`/operatori/${params.id}`)
}
