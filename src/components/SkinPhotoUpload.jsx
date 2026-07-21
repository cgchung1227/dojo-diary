import { useState } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function SkinPhotoUpload({ date, photoUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')

    const ext = file.name.split('.').pop()
    const path = `${date}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from('skin-photos')
      .upload(path, file, { upsert: true })

    if (upErr) {
      setError('上傳失敗：' + upErr.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('skin-photos').getPublicUrl(path)
    onUploaded(data.publicUrl)
    setUploading(false)
  }

  async function handleRemove() {
    onUploaded(null)
  }

  return (
    <div>
      {photoUrl ? (
        <div className="relative">
          <img
            src={photoUrl}
            alt="皮膚狀況"
            className="w-full h-48 object-cover rounded-xl border border-stone-200"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
          >
            <X size={14} color="white" />
          </button>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center gap-2 h-28 rounded-xl border-2 border-dashed
          border-stone-200 text-stone-400 text-sm cursor-pointer hover:border-dojo-blue/50 transition-colors
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading
            ? <><Loader2 size={20} className="animate-spin" /><span>上傳中...</span></>
            : <><Camera size={20} /><span>拍照或從相簿選取</span></>
          }
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
