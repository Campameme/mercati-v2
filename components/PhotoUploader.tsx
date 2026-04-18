'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  bucket: 'operator-photos' | 'product-photos'
  folder: string // e.g. operator uuid
  value: string[] // public URLs
  onChange: (urls: string[]) => void
  max?: number
}

export default function PhotoUploader({ bucket, folder, value, onChange, max = 8 }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null); setUploading(true)
    const supabase = createClient()
    const urls = [...value]
    try {
      for (const file of Array.from(files)) {
        if (urls.length >= max) break
        const ext = file.name.split('.').pop() ?? 'jpg'
        const name = `${folder}/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage.from(bucket).upload(name, file, { cacheControl: '3600' })
        if (upErr) throw upErr
        const { data } = supabase.storage.from(bucket).getPublicUrl(name)
        urls.push(data.publicUrl)
      }
      onChange(urls)
    } catch (e: any) {
      setError(e.message ?? 'Errore upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(url: string) {
    // Remove from list; also try to remove from storage (best-effort)
    const supabase = createClient()
    const path = url.split(`/${bucket}/`)[1]
    if (path) {
      try { await supabase.storage.from(bucket).remove([path]) } catch { /* ignore */ }
    }
    onChange(value.filter((u) => u !== url))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url) => (
          <div key={url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-24 h-24 object-cover rounded-md border" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
              title="Rimuovi"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 text-gray-500 hover:text-primary-600 transition-colors">
            <Upload className="w-6 h-6" />
            <span className="text-xs mt-1">{uploading ? '…' : 'Carica'}</span>
            <input type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
          </label>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
