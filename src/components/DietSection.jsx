import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'

const MEAL_TYPES = [
  { key: 'morning',    label: '早餐' },
  { key: 'noon',       label: '午餐' },
  { key: 'evening',    label: '晚餐' },
  { key: 'snack',      label: '點心/零食' },
  { key: 'supplement', label: '補充品' },
]

const COMMON_FOODS = ['鮮食', '乾糧', '水煮雞胸', '地瓜', '南瓜', '益生菌', '魚油', '羊肉']

const MEAL_LABEL = Object.fromEntries(MEAL_TYPES.map(m => [m.key, m.label]))

export default function DietSection({ logId, entries, onRefresh }) {
  const [open, setOpen] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ meal_type: 'morning', food_name: '', amount: '', notes: '' })
  const [saving, setSaving] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.food_name.trim() || !logId) return
    setSaving(true)
    await supabase.from('diet_entries').insert([{ log_id: logId, ...form }])
    setForm({ meal_type: 'morning', food_name: '', amount: '', notes: '' })
    setShowForm(false)
    setSaving(false)
    onRefresh()
  }

  async function handleDelete(id) {
    await supabase.from('diet_entries').delete().eq('id', id)
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
          <span className="text-lg">🍗</span>
          <span className="font-bold text-stone-800">飲食</span>
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
                <span className="text-xs font-semibold text-dojo-blue bg-dojo-blue-light px-2 py-0.5 rounded-full mr-2">
                  {MEAL_LABEL[e.meal_type] || e.meal_type}
                </span>
                <span className="text-sm text-stone-800 font-medium">{e.food_name}</span>
                {e.amount && <span className="text-xs text-stone-400 ml-1">({e.amount})</span>}
                {e.notes && <p className="text-xs text-stone-400 mt-0.5">{e.notes}</p>}
              </div>
              <button onClick={() => handleDelete(e.id)} className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {showForm ? (
            <form onSubmit={handleAdd} className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {MEAL_TYPES.map(m => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, meal_type: m.key }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      form.meal_type === m.key
                        ? 'bg-dojo-blue text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-stone-400 mb-1">常見食物：</p>
              <div className="flex flex-wrap gap-1.5 mb-1">
                {COMMON_FOODS.map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, food_name: f }))}
                    className="px-2.5 py-1 rounded-lg text-xs bg-dojo-yellow-light text-stone-700 font-medium"
                  >
                    {f}
                  </button>
                ))}
              </div>

              <input
                className="inp"
                placeholder="食物名稱 *"
                value={form.food_name}
                onChange={e => setForm(f => ({ ...f, food_name: e.target.value }))}
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="inp"
                  placeholder="份量（如 100g）"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                />
                <input
                  className="inp"
                  placeholder="備注"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

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
              onClick={() => { setShowForm(true); if (!logId) alert('請先儲存今天的基本資料') }}
              className="flex items-center gap-1.5 text-dojo-blue text-sm font-semibold w-full justify-center py-2 rounded-xl border border-dashed border-dojo-blue/30 active:scale-95 transition-transform"
            >
              <Plus size={15} /> 新增飲食記錄
            </button>
          )}
        </div>
      )}
    </div>
  )
}
