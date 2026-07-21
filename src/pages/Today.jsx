import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SkinScore from '../components/SkinScore'
import ItchScore from '../components/ItchScore'
import BodyMap from '../components/BodyMap'
import SkinPhotoUpload from '../components/SkinPhotoUpload'
import WeatherSection from '../components/WeatherSection'
import DietSection from '../components/DietSection'
import ExerciseSection from '../components/ExerciseSection'
import MedicationSection from '../components/MedicationSection'
import GroomingSection from '../components/GroomingSection'

const TODAY = new Date().toLocaleDateString('sv-SE') // YYYY-MM-DD

const ODORS = [
  { key: 'none',   label: '無異味' },
  { key: 'sour',   label: '酸臭味' },
  { key: 'fishy',  label: '腥味' },
  { key: 'yeast',  label: '酵母/麵包味' },
]

const DISCHARGE = [
  { key: 'none',   label: '正常乾燥' },
  { key: 'flaky',  label: '脫皮/皮屑' },
  { key: 'fluid',  label: '組織液滲出' },
  { key: 'pus',    label: '膿胞' },
]

const STRESS_EVENTS = ['獨處時間長', '家中有客人', '去醫院', '洗澡/美容', '環境改變', '吵雜聲']

const EMPTY_LOG = {
  weather: null, humidity: null,
  skin_score: null, itch_score: null,
  affected_areas: [], skin_photo_url: null, skin_notes: '',
  odor: null, discharge: null,
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
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
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
        affected_areas: data.affected_areas || [],
        skin_photo_url: data.skin_photo_url,
        skin_notes: data.skin_notes || '',
        odor: data.odor,
        discharge: data.discharge,
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
    const [d, e, m] = await Promise.all([
      supabase.from('diet_entries').select('*').eq('log_id', lid).order('created_at'),
      supabase.from('exercise_entries').select('*').eq('log_id', lid).order('created_at'),
      supabase.from('medication_entries').select('*').eq('log_id', lid).order('created_at'),
    ])
    setDiet(d.data || [])
    setExercise(e.data || [])
    setMedication(m.data || [])
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
          <SkinScore
            score={log.skin_score}
            onChange={v => update('skin_score', v)}
          />
        </div>

        <div className="mb-4">
          <p className="section-label">搔癢程度 PVAS（0–10）</p>
          <ItchScore
            score={log.itch_score}
            onChange={v => update('itch_score', v)}
          />
        </div>

        <div className="mb-4">
          <p className="section-label">今天抓咬部位</p>
          <BodyMap
            selected={log.affected_areas}
            onChange={v => update('affected_areas', v)}
          />
        </div>

        <div className="mb-4">
          <p className="section-label">異味</p>
          <div className="flex flex-wrap gap-1.5">
            {ODORS.map(o => (
              <button
                key={o.key}
                type="button"
                onClick={() => update('odor', log.odor === o.key ? null : o.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  log.odor === o.key
                    ? 'bg-dojo-navy text-white border-dojo-navy'
                    : 'bg-white text-stone-500 border-stone-200'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="section-label">分泌物狀態</p>
          <div className="flex flex-wrap gap-1.5">
            {DISCHARGE.map(d => (
              <button
                key={d.key}
                type="button"
                onClick={() => update('discharge', log.discharge === d.key ? null : d.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  log.discharge === d.key
                    ? 'bg-dojo-navy text-white border-dojo-navy'
                    : 'bg-white text-stone-500 border-stone-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="section-label">皮膚照片</p>
          <SkinPhotoUpload
            date={TODAY}
            photoUrl={log.skin_photo_url}
            onUploaded={url => update('skin_photo_url', url)}
          />
        </div>

        <div>
          <p className="section-label">皮膚備注</p>
          <textarea
            className="inp"
            rows={2}
            placeholder="今天皮膚的觀察細節..."
            value={log.skin_notes}
            onChange={e => update('skin_notes', e.target.value)}
          />
        </div>
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
        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      {/* ─── 今日備注 ─── */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📝</span>
          <span className="font-bold text-stone-800">今日備注</span>
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
