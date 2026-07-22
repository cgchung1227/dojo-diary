import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts'
import { supabase } from '../lib/supabase'

const RANGES = [
  { label: '2週', days: 14 },
  { label: '1個月', days: 30 },
  { label: '3個月', days: 90 },
]

const SCORE_COLOR = ['', '#EF4444', '#F97316', '#EAB308', '#60A5FA', '#1E3A8A']

function SkinDot({ cx, cy, payload }) {
  const score = payload.skin_score
  if (!score || cx == null || cy == null) return null
  return (
    <circle
      cx={cx} cy={cy} r={5}
      fill={SCORE_COLOR[score] || '#2563EB'}
      stroke="#fff" strokeWidth={1.5}
    />
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-white border border-stone-100 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-bold text-stone-700 mb-1">{label}</p>
      {d?.skin_score != null && (
        <p style={{ color: SCORE_COLOR[d.skin_score] }}>
          皮膚狀況：{d.skin_score} / 5
        </p>
      )}
      {d?.itch_score != null && (
        <p className="text-orange-500">搔癢程度：{d.itch_score} / 10</p>
      )}
    </div>
  )
}

export default function Trends() {
  const [range, setRange] = useState(30)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load(range)
  }, [range])

  async function load(days) {
    setLoading(true)
    const from = new Date()
    from.setDate(from.getDate() - days)
    const fromStr = from.toLocaleDateString('sv-SE')

    const { data: rows } = await supabase
      .from('daily_logs')
      .select('date, skin_score, itch_score')
      .gte('date', fromStr)
      .order('date', { ascending: true })

    const mapped = (rows || []).map(r => ({
      ...r,
      label: new Date(r.date + 'T00:00:00').toLocaleDateString('zh-TW', {
        month: 'numeric', day: 'numeric',
      }),
    }))
    setData(mapped)
    setLoading(false)
  }

  const hasSkin = data.some(d => d.skin_score != null)
  const hasItch = data.some(d => d.itch_score != null)

  const avgSkin = hasSkin
    ? (data.filter(d => d.skin_score).reduce((s, d) => s + d.skin_score, 0) /
       data.filter(d => d.skin_score).length).toFixed(1)
    : null
  const avgItch = hasItch
    ? (data.filter(d => d.itch_score != null).reduce((s, d) => s + d.itch_score, 0) /
       data.filter(d => d.itch_score != null).length).toFixed(1)
    : null

  return (
    <div className="max-w-lg mx-auto px-4">
      <div className="bg-dojo-navy text-white px-4 pt-12 pb-6 -mx-4 mb-4">
        <p className="text-dojo-yellow text-xs font-bold tracking-widest uppercase mb-1">斗宅日記</p>
        <h1 className="text-lg font-bold">趨勢分析</h1>
        <p className="text-white/50 text-xs mt-1">觀察皮膚與搔癢的長期變化</p>
      </div>

      {/* Range selector */}
      <div className="flex gap-2 mb-4">
        {RANGES.map(r => (
          <button
            key={r.days}
            type="button"
            onClick={() => setRange(r.days)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              range === r.days
                ? 'bg-dojo-navy text-white'
                : 'bg-white text-stone-500 border border-stone-200'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-dojo-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data.length < 2 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-stone-400 text-sm">記錄還不夠多，至少需要 2 天的資料</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="card text-center">
              <p className="text-xs text-stone-400 mb-1">平均皮膚狀況</p>
              <p className="text-3xl font-black" style={{ color: SCORE_COLOR[Math.round(avgSkin)] || '#1E3A8A' }}>
                {avgSkin ?? '—'}
              </p>
              <p className="text-xs text-stone-400 mt-0.5">/ 5</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-stone-400 mb-1">平均搔癢程度</p>
              <p className="text-3xl font-black text-orange-400">{avgItch ?? '—'}</p>
              <p className="text-xs text-stone-400 mt-0.5">/ 10</p>
            </div>
          </div>

          {/* Skin score chart */}
          {hasSkin && (
            <div className="card mb-4">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">皮膚狀況趨勢</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={3} stroke="#E2E8F0" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="skin_score"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={<SkinDot />}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Itch score chart */}
          {hasItch && (
            <div className="card mb-4">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">搔癢程度趨勢</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 10]}
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{ fontSize: 10, fill: '#94A3B8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={5} stroke="#E2E8F0" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="itch_score"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#F97316', stroke: '#fff', strokeWidth: 1.5 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <p className="text-center text-xs text-stone-300 pb-6">共 {data.length} 天記錄</p>
        </>
      )}
    </div>
  )
}
