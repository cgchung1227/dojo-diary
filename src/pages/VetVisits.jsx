import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'

const EMPTY_FORM = {
  visit_date: '',
  clinic: '',
  diagnosis: '',
  treatment: '',
  notes: '',
  next_visit: '',
}

function formatDate(str) {
  if (!str) return ''
  return new Date(str + 'T00:00:00').toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  })
}

function daysUntil(str) {
  if (!str) return null
  const diff = Math.ceil((new Date(str + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000)
  return diff
}

export default function VetVisits() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('vet_visits')
      .select('*')
      .order('visit_date', { ascending: false })
    setVisits(data || [])
    setLoading(false)
  }

  function openAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setExpanded(null)
  }

  function openEdit(v) {
    setEditId(v.id)
    setForm({
      visit_date: v.visit_date || '',
      clinic: v.clinic || '',
      diagnosis: v.diagnosis || '',
      treatment: v.treatment || '',
      notes: v.notes || '',
      next_visit: v.next_visit || '',
    })
    setShowForm(true)
    setExpanded(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.visit_date) return
    setSaving(true)
    const payload = {
      visit_date: form.visit_date,
      clinic: form.clinic || null,
      diagnosis: form.diagnosis || null,
      treatment: form.treatment || null,
      notes: form.notes || null,
      next_visit: form.next_visit || null,
    }
    if (editId) {
      await supabase.from('vet_visits').update(payload).eq('id', editId)
    } else {
      await supabase.from('vet_visits').insert([payload])
    }
    setForm(EMPTY_FORM)
    setShowForm(false)
    setEditId(null)
    setSaving(false)
    load()
  }

  async function handleDelete(id) {
    await supabase.from('vet_visits').delete().eq('id', id)
    load()
  }

  const nextVisit = visits.find(v => v.next_visit && daysUntil(v.next_visit) >= 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-dojo-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4">
      <div className="bg-dojo-navy text-white px-4 pt-12 pb-6 -mx-4 mb-4">
        <p className="text-dojo-yellow text-xs font-bold tracking-widest uppercase mb-1">斗宅日記</p>
        <h1 className="text-lg font-bold">回診記錄</h1>
        <p className="text-white/50 text-xs mt-1">共 {visits.length} 次就診記錄</p>
      </div>

      {/* 下次回診提醒 */}
      {nextVisit?.next_visit && (() => {
        const days = daysUntil(nextVisit.next_visit)
        return (
          <div className={`rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 ${
            days <= 7 ? 'bg-red-50 border border-red-100' : 'bg-dojo-blue-light border border-dojo-blue/20'
          }`}>
            <Calendar size={18} className={days <= 7 ? 'text-red-400' : 'text-dojo-blue'} />
            <div>
              <p className={`text-xs font-bold ${days <= 7 ? 'text-red-500' : 'text-dojo-blue'}`}>
                {days === 0 ? '今天要回診！' : days < 0 ? '回診日已過' : `${days} 天後回診`}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                {formatDate(nextVisit.next_visit)}
                {nextVisit.clinic ? `・${nextVisit.clinic}` : ''}
              </p>
            </div>
          </div>
        )
      })()}

      {/* 新增表單 */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="card mb-4 space-y-3">
          <p className="font-bold text-stone-800">
            {editId ? '✏️ 修改回診記錄' : '新增回診記錄'}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="section-label">就診日期 *</p>
              <input
                type="date"
                className="inp"
                value={form.visit_date}
                onChange={e => setForm(f => ({ ...f, visit_date: e.target.value }))}
                required
              />
            </div>
            <div>
              <p className="section-label">診所／醫院</p>
              <input
                className="inp"
                placeholder="診所名稱"
                value={form.clinic}
                onChange={e => setForm(f => ({ ...f, clinic: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <p className="section-label">診斷結果</p>
            <textarea
              className="inp"
              rows={2}
              placeholder="醫生的診斷、檢查結果..."
              value={form.diagnosis}
              onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
            />
          </div>

          <div>
            <p className="section-label">治療方式 / 用藥</p>
            <textarea
              className="inp"
              rows={2}
              placeholder="開了什麼藥、打了什麼針、治療計畫..."
              value={form.treatment}
              onChange={e => setForm(f => ({ ...f, treatment: e.target.value }))}
            />
          </div>

          <div>
            <p className="section-label">備註</p>
            <textarea
              className="inp"
              rows={2}
              placeholder="其他觀察或醫囑..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div>
            <p className="section-label">下次回診日期</p>
            <input
              type="date"
              className="inp"
              value={form.next_visit}
              onChange={e => setForm(f => ({ ...f, next_visit: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="btn-blue flex-1">
              {saving ? '儲存中...' : editId ? '儲存修改' : '新增'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditId(null) }}
              className="btn-outline"
            >
              取消
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-2 w-full justify-center py-3 rounded-2xl border border-dashed border-dojo-blue/30 text-dojo-blue text-sm font-semibold mb-4 active:scale-95 transition-transform"
        >
          <Plus size={16} />新增回診記錄
        </button>
      )}

      {/* 記錄列表 */}
      {visits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🏥</p>
          <p className="text-stone-400 text-sm">還沒有回診記錄</p>
        </div>
      ) : (
        <div className="space-y-2 pb-6">
          {visits.map(v => {
            const isOpen = expanded === v.id
            const days = v.next_visit ? daysUntil(v.next_visit) : null
            return (
              <div key={v.id} className="card">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : v.id)}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <div className="flex-shrink-0 w-14 text-center">
                    <p className="text-[10px] text-stone-400 font-semibold">
                      {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('zh-TW', { weekday: 'short' })}
                    </p>
                    <p className="text-xl font-black text-stone-800 leading-none">
                      {new Date(v.visit_date + 'T00:00:00').getDate()}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {new Date(v.visit_date + 'T00:00:00').toLocaleDateString('zh-TW', { month: 'short' })}
                    </p>
                  </div>

                  <div className="w-px h-10 bg-stone-100 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-stone-800 truncate">
                      {v.clinic || '就診記錄'}
                    </p>
                    {v.diagnosis && (
                      <p className="text-xs text-stone-400 truncate mt-0.5">{v.diagnosis}</p>
                    )}
                    {days != null && days >= 0 && (
                      <span className={`text-xs font-semibold mt-1 inline-block ${
                        days <= 7 ? 'text-red-400' : 'text-dojo-blue'
                      }`}>
                        下次回診 {days === 0 ? '今天' : `${days}天後`}
                      </span>
                    )}
                  </div>

                  <span className="text-stone-300 text-lg flex-shrink-0">
                    {isOpen ? '▲' : '▽'}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-stone-100 space-y-2.5">
                    {v.diagnosis && (
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">診斷結果</p>
                        <p className="text-xs text-stone-600">{v.diagnosis}</p>
                      </div>
                    )}
                    {v.treatment && (
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">治療 / 用藥</p>
                        <p className="text-xs text-stone-600">{v.treatment}</p>
                      </div>
                    )}
                    {v.notes && (
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">備註</p>
                        <p className="text-xs text-stone-500">{v.notes}</p>
                      </div>
                    )}
                    {v.next_visit && (
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">下次回診</p>
                        <p className="text-xs text-stone-600">{formatDate(v.next_visit)}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openEdit(v)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-dojo-blue px-3 py-1.5 rounded-full border border-dojo-blue/30 hover:bg-dojo-blue-light transition-all"
                      >
                        <Pencil size={12} />編輯
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-400 px-3 py-1.5 rounded-full border border-red-100 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={12} />刪除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
