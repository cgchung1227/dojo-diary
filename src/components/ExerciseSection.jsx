import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
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

export default function ExerciseSection({ logId, entries, onRefresh }) {
  const [open, setOpen] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: '散步',
    duration_min: '',
    location: '',
    paw_wiped: false,
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    if (!logId) return
    setSaving(true)
    const notes = [
      form.location ? `地點：${LOCATIONS.find(l => l.key === form.location)?.label || form.location}` : '',
      form.paw_wiped ? '✓ 回家擦腳' : '',
      form.notes,
    ].filter(Boolean).join('，')

    await supabase.from('exercise_entries').insert([{
      log_id: logId,
      type: form.type,
      duration_min: form.duration_min ? Number(form.duration_min) : null,
      notes: notes || null,
    }])
    setForm({ type: '散步', duration_min: '', location: '', paw_wiped: false, notes: '' })
    setShowForm(false)
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
              <button onClick={() => handleDelete(e.id)} className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {showForm ? (
            <form onSubmit={handleAdd} className="space-y-2.5 pt-1">
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
                placeholder="備注"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />

              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn-blue flex-1">
                  {saving ? '儲存中...' : '新增'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                  取消
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 text-dojo-blue text-sm font-semibold w-full justify-center py-2 rounded-xl border border-dashed border-dojo-blue/30 active:scale-95 transition-transform"
            >
              <Plus size={15} /> 新增運動記錄
            </button>
          )}
        </div>
      )}
    </div>
  )
}
