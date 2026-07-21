import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../lib/supabase'

const ROUTES = [
  { key: 'oral',      label: '口服' },
  { key: 'topical',   label: '外用/擦藥' },
  { key: 'injection', label: '注射' },
  { key: 'spot_on',   label: '點藥（體外驅蟲）' },
]

const COMMON_MEDS = [
  '安癢快（Apoquel）',
  '一愛膚（Cytopoint）',
  '必達舒（Betasone）',
  '抗生素',
  '抗黴菌藥',
  '益生菌',
  '魚油（Omega-3）',
  '驅蟲藥',
  '抗組織胺',
  '類固醇（口服）',
]

const ROUTE_LABEL = Object.fromEntries(ROUTES.map(r => [r.key, r.label]))

export default function MedicationSection({ logId, entries, onRefresh }) {
  const [open, setOpen] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ med_name: '', dose: '', route: 'oral', notes: '' })
  const [saving, setSaving] = useState(false)

  async function handleAdd(e) {
    e.preventDefault()
    if (!form.med_name.trim() || !logId) return
    setSaving(true)
    await supabase.from('medication_entries').insert([{ log_id: logId, ...form }])
    setForm({ med_name: '', dose: '', route: 'oral', notes: '' })
    setShowForm(false)
    setSaving(false)
    onRefresh()
  }

  async function handleDelete(id) {
    await supabase.from('medication_entries').delete().eq('id', id)
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
          <span className="text-lg">💊</span>
          <span className="font-bold text-stone-800">用藥</span>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-stone-800">{e.med_name}</span>
                  {e.route && (
                    <span className="text-xs bg-dojo-blue-light text-dojo-blue font-semibold px-2 py-0.5 rounded-full">
                      {ROUTE_LABEL[e.route] || e.route}
                    </span>
                  )}
                  {e.dose && <span className="text-xs text-stone-400">{e.dose}</span>}
                </div>
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
                <p className="text-xs text-stone-400 mb-1.5">常用藥物</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_MEDS.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, med_name: m }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        form.med_name === m
                          ? 'bg-dojo-navy text-white'
                          : 'bg-dojo-yellow-light text-stone-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <input
                className="inp"
                placeholder="藥物名稱 *"
                value={form.med_name}
                onChange={e => setForm(f => ({ ...f, med_name: e.target.value }))}
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  className="inp"
                  placeholder="劑量（如 1 顆、2.5mg）"
                  value={form.dose}
                  onChange={e => setForm(f => ({ ...f, dose: e.target.value }))}
                />
                <select
                  className="inp"
                  value={form.route}
                  onChange={e => setForm(f => ({ ...f, route: e.target.value }))}
                >
                  {ROUTES.map(r => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
              </div>

              <textarea
                className="inp"
                placeholder="備注（如：Cytopoint 今日施打，觀察 21 天後搔癢是否回升）"
                rows={2}
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
              <Plus size={15} /> 新增用藥記錄
            </button>
          )}
        </div>
      )}
    </div>
  )
}
