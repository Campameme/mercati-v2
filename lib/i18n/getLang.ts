import 'server-only'
import { cookies } from 'next/headers'
import { LANGS, type Lang } from './home'

/**
 * Lingua corrente lato server, dal cookie `imk_lang` (scritto dal
 * LangSwitcher client). Default: italiano. Le pagine che la usano sono già
 * force-dynamic, quindi il cookie è sempre fresco.
 */
export function getLang(): Lang {
  const v = cookies().get('imk_lang')?.value as Lang | undefined
  return v && LANGS.includes(v) ? v : 'it'
}
