import { useState } from 'react'
import { Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'

const TYPES = ['散步', '跑步', '玩球', '游泳', '其他']

const LOCATIONS = [
  { key: 'grass',    label: '草地' },
  { key: 'concrete', label: '水泥地' },
  { key: 'park',     label: '公園' },
  { key: 'beach',    label: '海邊/沙灘' },
  { key: 'trail',    label: '山路/步道' },
  { key: 'indoor',   label: '室內' },
]

const EMPTY_FORM = { type: '散步', duration_min: '', location: '', paw_wiped: false, notes: '' }

export default function ExerciseSection({ logId, entries, onRefresh }) {
  const [open, setOpen] = useState(true)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function openEdit(entry) {
    setEditId(entry.id)
    setForm({ type: entry.type, duration_min: entry.duration_min || '', location: '', paw_wiped: false, notes: entry.notes || '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!logId) return
    setSaving(true)
    const notes = [
      form.location ? `地點：${LOCATIONS.find(l => l.key === form.location)?.label || form.location}` : '',
      form.paw_wiped ? '✓ 回家擦腳' : '',
      form.notes,
    ].filter(Boolean).join('，')

    const payload = {
      type: form.type,
      duration_min: form.duration_min ? Number(form.duration_min) : null,
      notes: notes || null,
    }
    if (editId) {
      await supabase.from('exercise_entries').update(payload).eq('id', editId)
    } else {
      await supabase.from('exercise_entries').insert([{ log_id: logId, ...payload }])
    }
    setForm(EMPTY_FORM)
    setEditId(null)
    setSaving(false)
    onRefresh()
  }

  async function handleDelete(id) {
    await supabase.from('exercise_entries').delete().eq('id', id)
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
          <span className="text-lg">🏃</span>
          <span className="font-bold text-stone-800">運動</span>
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
          {entries.map(e => (
            <div key={e.id} className="flex items-start justify-between bg-stone-50 rounded-xl px-3 py-2.5 gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-stone-800">{e.type}</span>
                {e.duration_min && (
                  <span className="text-xs text-stone-400 ml-2">{e.duration_min} 分鐘</span>
                )}
                {e.notes && <p className="text-xs text-stone-400 mt-0.5">{e.notes}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => openEdit(e)} className="text-stone-300 hover:text-dojo-blue transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(e.id)} className="text-stone-300 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmit} className="space-y-2.5 pt-1">
              {editId && <p className="text-xs text-dojo-blue font-semibold">✏️ 修改記錄</p>}
              <div>
                <p className="text-xs text-stone-400 mb-1.5">運動類型</p>
                <div className="flex flex-wrap gap-1.5">
                  {TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        form.type === t ? 'bg-dojo-blue text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="number"
                className="inp"
                placeholder="時間（分鐘）"
                value={form.duration_min}
                onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
                min={1}
              />

              <div>
                <p className="text-xs text-stone-400 mb-1.5">散步地點</p>
                <div className="flex flex-wrap gap-1.5">
                  {LOCATIONS.map(l => (
                    <button
                      key={l.key}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, location: f.location === l.key ? '' : l.key }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        form.location === l.key ? 'bg-dojo-navy text-white' : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.paw_wiped}
                  onChange={e => setForm(f => ({ ...f, paw_wiped: e.target.checked }))}
                  className="w-4 h-4 rounded accent-dojo-blue"
                />
                <span className="text-sm text-stone-700 font-medium">回家後已擦腳（濕布/清潔液）</span>
              </label>

              <input
                className="inp"
                placeholder="備註"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />

              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn-blue flex-1">
                  {saving ? '儲存中...' : editId ? '儲存修改' : '新增'}
                </button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setForm(EMPTY_FORM) }} className="btn-outline">
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
