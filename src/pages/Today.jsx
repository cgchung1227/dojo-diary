import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, CheckCircle2, Plus, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SkinScore from '../components/SkinScore'
import ItchScore from '../components/ItchScore'
import SkinAreaSection from '../components/SkinAreaSection'
import WeatherSection from '../components/WeatherSection'
import DietSection from '../components/DietSection'
import ExerciseSection from '../components/ExerciseSection'
import MedicationSection from '../components/MedicationSection'
import GroomingSection from '../components/GroomingSection'

const TODAY = new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD

const STRESS_EVENTS = ['獨處時間長', '家中有客人', '去醫院', '洗澡/美容', '環境改變', '吵雜聲']

const EMPTY_LOG = {
  weather: null, humidity: null,
  skin_score: null, itch_score: null,
  bathed: false, groomed: false, ear_cleaned: false,
  pest_control: false, bedding_washed: false,
  stress_events: [], notes: '',
}

export default function Today() {
  const [logId, setLogId] = useState(null)
  const [log, setLog] = useState(EMPTY_LOG)
  const [diet, setDiet] = useState([])
  const [exercise, setExercise] = useState([])
  const [medication, setMedication] = useState([])
  const [skinAreas, setSkinAreas] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [customStress, setCustomStress] = useState('')
  const saveTimer = useRef(null)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    let { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('date', TODAY)
      .maybeSingle()

    if (!data) {
      const { data: created } = await supabase
        .from('daily_logs')
        .insert([{ date: TODAY }])
        .select()
        .single()
      data = created
    }

    if (data) {
      setLogId(data.id)
      setLog({
        weather: data.weather,
        humidity: data.humidity,
        skin_score: data.skin_score,
        itch_score: data.itch_score,
        bathed: data.bathed || false,
        groomed: data.groomed || false,
        ear_cleaned: data.ear_cleaned || false,
        pest_control: data.pest_control || false,
        bedding_washed: data.bedding_washed || false,
        stress_events: data.stress_events || [],
        notes: data.notes || '',
      })
      await loadEntries(data.id)
    }
    setLoading(false)
  }

  async function loadEntries(id) {
    const lid = id || logId
    if (!lid) return
    const [d, e, m, s] = await Promise.all([
      supabase.from('diet_entries').select('*').eq('log_id', lid).order('created_at'),
      supabase.from('exercise_entries').select('*').eq('log_id', lid).order('created_at'),
      supabase.from('medication_entries').select('*').eq('log_id', lid).order('created_at'),
      supabase.from('skin_area_entries').select('*').eq('log_id', lid).order('created_at'),
    ])
    setDiet(d.data || [])
    setExercise(e.data || [])
    setMedication(m.data || [])
    setSkinAreas(s.data || [])
  }

  const scheduleSave = useCallback((updatedLog) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveLog(updatedLog), 800)
  }, [logId])

  async function saveLog(updatedLog) {
    setSaving(true)
    const payload = { date: TODAY, ...updatedLog, updated_at: new Date().toISOString() }

    if (logId) {
      await supabase.from('daily_logs').update(payload).eq('id', logId)
    } else {
      const { data } = await supabase.from('daily_logs').insert([payload]).select().single()
      if (data) {
        setLogId(data.id)
        await loadEntries(data.id)
      }
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function update(field, value) {
    const next = { ...log, [field]: value }
    setLog(next)
    scheduleSave(next)
  }

  function updateGrooming(key, value) {
    update(key, value)
  }

  function toggleStress(event) {
    const next = log.stress_events.includes(event)
      ? log.stress_events.filter(e => e !== event)
      : [...log.stress_events, event]
    update('stress_events', next)
  }

  function addCustomStress() {
    const v = customStress.trim()
    if (!v || log.stress_events.includes(v)) return
    update('stress_events', [...log.stress_events, v])
    setCustomStress('')
  }

  const dateStr = new Date().toLocaleDateString('zh-TW', {
    month: 'long', day: 'numeric', weekday: 'long',
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-dojo-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4">

      {/* Header */}
      <div className="bg-dojo-navy text-white px-4 pt-12 pb-6 -mx-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dojo-yellow text-xs font-bold tracking-widest uppercase mb-1">斗宅日記</p>
            <h1 className="text-lg font-bold">{dateStr}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-dojo-yellow flex items-center justify-center text-xl">
            🐕
          </div>
        </div>
        {(saving || saved) && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-white/60">
            {saving
              ? <><div className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin" />儲存中...</>
              : <><CheckCircle2 size={12} className="text-dojo-yellow" />已自動儲存</>
            }
          </div>
        )}
      </div>

      {/* ─── 皮膚狀況 ─── */}
      <div className="card mb-3">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🐾</span>
          <span className="font-bold text-stone-800">今天皮膚狀況</span>
        </div>

        <div className="mb-4">
          <p className="section-label">整體狀況（1 很差 → 5 很好）</p>
          <SkinScore score={log.skin_score} onChange={v => update('skin_score', v)} />
        </div>

        <div>
          <p className="section-label">搔癢程度 PVAS（0–10）</p>
          <ItchScore score={log.itch_score} onChange={v => update('itch_score', v)} />
        </div>
      </div>

      {/* ─── 患部狀況 ─── */}
      <div className="mb-3">
        <SkinAreaSection
          logId={logId}
          date={TODAY}
          entries={skinAreas}
          onRefresh={() => loadEntries()}
        />
      </div>

      {/* ─── 天氣 ─── */}
      <div className="card mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🌤️</span>
          <span className="font-bold text-stone-800">今天天氣</span>
        </div>
        <WeatherSection
          weather={log.weather}
          humidity={log.humidity}
          onChange={(field, value) => update(field, value)}
        />
      </div>

      {/* ─── 飲食 ─── */}
      <div className="mb-3">
        <DietSection logId={logId} entries={diet} onRefresh={() => loadEntries()} />
      </div>

      {/* ─── 運動 ─── */}
      <div className="mb-3">
        <ExerciseSection logId={logId} entries={exercise} onRefresh={() => loadEntries()} />
      </div>

      {/* ─── 用藥 ─── */}
      <div className="mb-3">
        <MedicationSection logId={logId} entries={medication} onRefresh={() => loadEntries()} />
      </div>

      {/* ─── 清潔 ─── */}
      <div className="mb-3">
        <GroomingSection
          values={log}
          onChange={updateGrooming}
        />
      </div>

      {/* ─── 壓力事件 ─── */}
      <div className="card mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🧠</span>
          <span className="font-bold text-stone-800">今天壓力事件</span>
        </div>
        <p className="text-xs text-stone-400 mb-2">壓力會降低搔癢閾值，選取有助於交叉比對</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {STRESS_EVENTS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => toggleStress(e)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                log.stress_events.includes(e)
                  ? 'bg-dojo-navy text-white border-dojo-navy'
                  : 'bg-white text-stone-500 border-stone-200'
              }`}
            >
              {e}
            </button>
          ))}
          {log.stress_events.filter(e => !STRESS_EVENTS.includes(e)).map(e => (
            <span
              key={e}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-dojo-navy text-white border border-dojo-navy"
            >
              {e}
              <button type="button" onClick={() => toggleStress(e)} className="ml-0.5 opacity-70 hover:opacity-100">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="inp flex-1"
            placeholder="自訂壓力事件..."
            value={customStress}
            onChange={e => setCustomStress(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomStress())}
          />
          <button
            type="button"
            onClick={addCustomStress}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors flex-shrink-0"
          >
            <Plus size={13} />新增
          </button>
        </div>
      </div>

      {/* ─── 今日備註 ─── */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📝</span>
          <span className="font-bold text-stone-800">今日備註</span>
        </div>
        <textarea
          className="inp"
          rows={3}
          placeholder="其他觀察..."
          value={log.notes}
          onChange={e => update('notes', e.target.value)}
        />
      </div>

      {/* ─── 儲存鍵 ─── */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => saveLog(log)}
          disabled={saving}
          className="w-full py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
          style={{ backgroundColor: saved ? '#16a34a' : '#1E3A8A', color: '#fff' }}
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />儲存中...</>
          ) : saved ? (
            <><CheckCircle2 size={18} />已儲存！</>
          ) : (
            <><Save size={18} />儲存今日記錄</>
          )}
        </button>
      </div>

    </div>
  )
}
