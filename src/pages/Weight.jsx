import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { supabase } from '../lib/supabase'

const TODAY = new Date().toLocaleDateString('sv-SE')

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-stone-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-stone-700 mb-0.5">{label}</p>
      <p className="text-dojo-blue">{payload[0].value} kg</p>
    </div>
  )
}

export default function Weight() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ logged_date: TODAY, weight_kg: '', notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('weight_logs')
      .select('*')
      .order('logged_date', { ascending: true })
    setLogs(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.weight_kg) return
    setSaving(true)
    await supabase.from('weight_logs').insert([{
      logged_date: form.logged_date,
      weight_kg: parseFloat(form.weight_kg),
      notes: form.notes || null,
    }])
    setForm({ logged_date: TODAY, weight_kg: '', notes: '' })
    setSaving(false)
    load()
  }

  async function handleDelete(id) {
    await supabase.from('weight_logs').delete().eq('id', id)
    load()
  }

  const chartData = logs.map(r => ({
    label: new Date(r.logged_date + 'T00:00:00').toLocaleDateString('zh-TW', {
      month: 'numeric', day: 'numeric',
    }),
    weight: parseFloat(r.weight_kg),
    id: r.id,
  }))

  const latest = logs[logs.length - 1]
  const first = logs[0]
  const diff = latest && first && logs.length > 1
    ? (parseFloat(latest.weight_kg) - parseFloat(first.weight_kg)).toFixed(2)
    : null

  const weights = logs.map(r => parseFloat(r.weight_kg))
  const minW = weights.length ? Math.floor(Math.min(...weights) - 0.5) : 0
  const maxW = weights.length ? Math.ceil(Math.max(...weights) + 0.5) : 10

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
        <h1 className="text-lg font-bold">體重追蹤</h1>
        <p className="text-white/50 text-xs mt-1">共 {logs.length} 筆記錄</p>
      </div>

      {/* 摘要 */}
      {logs.length >= 2 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="card text-center">
            <p className="text-xs text-stone-400 mb-1">最新體重</p>
            <p className="text-2xl font-black text-dojo-navy">{parseFloat(latest.weight_kg)}</p>
            <p className="text-xs text-stone-400">kg</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-stone-400 mb-1">最低</p>
            <p className="text-2xl font-black text-green-500">{Math.min(...weights)}</p>
            <p className="text-xs text-stone-400">kg</p>
          </div>
          <div className="card text-center">
            <p className="text-xs text-stone-400 mb-1">整體變化</p>
            <p className={`text-2xl font-black ${diff > 0 ? 'text-orange-400' : diff < 0 ? 'text-green-500' : 'text-stone-400'}`}>
              {diff > 0 ? `+${diff}` : diff}
            </p>
            <p className="text-xs text-stone-400">kg</p>
          </div>
        </div>
      )}

      {/* 趨勢圖 */}
      {logs.length >= 2 && (
        <div className="card mb-4">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">體重趨勢</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minW, maxW]}
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 4, fill: '#2563EB', stroke: '#fff', strokeWidth: 1.5 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 新增表單 */}
      <form onSubmit={handleSubmit} className="card mb-4 space-y-3">
        <p className="font-bold text-stone-800">記錄體重</p>
        <div className="flex flex-col gap-2">
          <div>
            <p className="section-label">日期</p>
            <input
              type="date"
              className="inp max-w-full"
              value={form.logged_date}
              onChange={e => setForm(f => ({ ...f, logged_date: e.target.value }))}
              required
            />
          </div>
          <div>
            <p className="section-label">體重（kg）*</p>
            <input
              type="number"
              className="inp"
              placeholder="例：8.5"
              step="0.01"
              min="0"
              value={form.weight_kg}
              onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))}
              required
            />
          </div>
        </div>
        <div>
          <p className="section-label">備註</p>
          <input
            className="inp"
            placeholder="例：飯前量、剛洗完澡..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </div>
        <button type="submit" disabled={saving} className="btn-blue w-full flex items-center justify-center gap-2">
          <Plus size={15} />{saving ? '儲存中...' : '新增記錄'}
        </button>
      </form>

      {/* 記錄列表 */}
      {logs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⚖️</p>
          <p className="text-stone-400 text-sm">還沒有體重記錄</p>
        </div>
      ) : (
        <div className="space-y-2 pb-6">
          {[...logs].reverse().map(r => (
            <div key={r.id} className="card flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 text-center flex-shrink-0">
                  <p className="text-[10px] text-stone-400">
                    {new Date(r.logged_date + 'T00:00:00').toLocaleDateString('zh-TW', { month: 'short' })}
                  </p>
                  <p className="text-xl font-black text-stone-800 leading-none">
                    {new Date(r.logged_date + 'T00:00:00').getDate()}
                  </p>
                </div>
                <div className="w-px h-8 bg-stone-100 flex-shrink-0" />
                <div>
                  <p className="text-lg font-black text-dojo-navy">{parseFloat(r.weight_kg)} <span className="text-sm font-normal text-stone-400">kg</span></p>
                  {r.notes && <p className="text-xs text-stone-400">{r.notes}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                className="text-stone-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
