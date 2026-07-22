import { useState } from 'react'
import { Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BodyMap from './BodyMap'
import SkinPhotoUpload from './SkinPhotoUpload'

const ODORS = [
  { key: 'none',  label: '無異味' },
  { key: 'sour',  label: '酸臭味' },
  { key: 'fishy', label: '腥味' },
  { key: 'yeast', label: '酵母/麵包味' },
]

const DISCHARGE = [
  { key: 'none',  label: '正常乾燥' },
  { key: 'flaky', label: '脫皮/皮屑' },
  { key: 'fluid', label: '組織液滲出' },
  { key: 'pus',   label: '膿胞' },
  { key: 'wound', label: '舔咬傷口/流血' },
]

const ODOR_LABEL   = Object.fromEntries(ODORS.map(o => [o.key, o.label]))
const DISC_LABEL   = Object.fromEntries(DISCHARGE.map(d => [d.key, d.label]))

const AREAS = [
  { key: 'head',        label: '頭部' },
  { key: 'right_ear',   label: '右耳' },
  { key: 'left_ear',    label: '左耳' },
  { key: 'neck',        label: '頸部' },
  { key: 'back',        label: '背部' },
  { key: 'chest',       label: '胸部' },
  { key: 'belly',       label: '腹部' },
  { key: 'right_front', label: '右前爪' },
  { key: 'left_front',  label: '左前爪' },
  { key: 'right_rear',  label: '右後爪' },
  { key: 'left_rear',   label: '左後爪' },
  { key: 'tail',        label: '尾巴' },
  { key: 'groin',       label: '鼠蹊部' },
  { key: 'armpit',      label: '腋下' },
]

const AREA_LABEL = Object.fromEntries(AREAS.map(a => [a.key, a.label]))

const EMPTY_FORM = { areas: [], odor: null, discharge: null, notes: '', photo_url: null }

export default function SkinAreaSection({ logId, date, entries, onRefresh }) {
  const [open, setOpen] = useState(true)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function openEdit(entry) {
    setEditId(entry.id)
    setForm({
      areas: entry.areas || [],
      odor: entry.odor,
      discharge: entry.discharge,
      notes: entry.notes || '',
      photo_url: entry.photo_url,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!logId || form.areas.length === 0) return
    setSaving(true)
    const payload = {
      areas: form.areas,
      odor: form.odor,
      discharge: form.discharge,
      notes: form.notes || null,
      photo_url: form.photo_url,
    }
    if (editId) {
      await supabase.from('skin_area_entries').update(payload).eq('id', editId)
    } else {
      await supabase.from('skin_area_entries').insert([{ log_id: logId, ...payload }])
    }
    setForm(EMPTY_FORM)
    setEditId(null)
    setSaving(false)
    onRefresh()
  }

  async function handleDelete(id) {
    await supabase.from('skin_area_entries').delete().eq('id', id)
    onRefresh()
  }

  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🐾</span>
          <span className="font-bold text-stone-800">患部狀況</span>
          {entries.length > 0 && (
            <span className="text-xs bg-dojo-yellow-light text-dojo-yellow-dark font-bold px-2 py-0.5 rounded-full">
              {entries.length} 筆
            </span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="bg-stone-50 rounded-xl px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap gap-1">
                    {(entry.areas || []).map(k => (
                      <span key={k} className="text-xs font-semibold bg-dojo-blue-light text-dojo-blue px-2 py-0.5 rounded-full">
                        {AREA_LABEL[k] || k}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                    {entry.odor && entry.odor !== 'none' && <span>{ODOR_LABEL[entry.odor]}</span>}
                    {entry.discharge && entry.discharge !== 'none' && <span>{DISC_LABEL[entry.discharge]}</span>}
                  </div>
                  {entry.notes && <p className="text-xs text-stone-400">{entry.notes}</p>}
                  {entry.photo_url && (
                    <img src={entry.photo_url} alt="患部照片" className="mt-1 w-full max-w-xs h-24 object-cover rounded-lg" />
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(entry)} className="text-stone-300 hover:text-dojo-blue transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(entry.id)} className="text-stone-300 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            {editId && <p className="text-xs text-dojo-blue font-semibold">✏️ 修改患部記錄</p>}

            <div>
              <p className="section-label">選取患部 *</p>
              <BodyMap
                selected={form.areas}
                onChange={v => setForm(f => ({ ...f, areas: v }))}
              />
            </div>

            <div>
              <p className="section-label">異味</p>
              <div className="flex flex-wrap gap-1.5">
                {ODORS.map(o => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, odor: f.odor === o.key ? null : o.key }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      form.odor === o.key
                        ? 'bg-dojo-navy text-white border-dojo-navy'
                        : 'bg-white text-stone-500 border-stone-200'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label">分泌物狀態</p>
              <div className="flex flex-wrap gap-1.5">
                {DISCHARGE.map(d => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, discharge: f.discharge === d.key ? null : d.key }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      form.discharge === d.key
                        ? 'bg-dojo-navy text-white border-dojo-navy'
                        : 'bg-white text-stone-500 border-stone-200'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="section-label">患部照片</p>
              <SkinPhotoUpload
                date={date}
                photoUrl={form.photo_url}
                onUploaded={url => setForm(f => ({ ...f, photo_url: url }))}
              />
            </div>

            <div>
              <p className="section-label">備註</p>
              <textarea
                className="inp"
                rows={2}
                placeholder="這個部位的觀察細節..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || form.areas.length === 0}
                className="btn-blue flex-1"
              >
                {saving ? '儲存中...' : editId ? '儲存修改' : '新增患部記錄'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => { setEditId(null); setForm(EMPTY_FORM) }}
                  className="btn-outline"
                >
                  取消
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
