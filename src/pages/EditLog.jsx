import { useState, useEffect, useCallback, useRef } from 'react'
import { Save, CheckCircle2, ArrowLeft, Plus, X } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
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

export default function EditLog() {
  const { date } = useParams()
  const navigate = useNavigate()
  const [logId, setLogId] = useState(null)
  const [log, setLog] = useState(EMPTY_LOG)
  const [diet, setDiet] = useState([])
  const [exercise, setExercise] = useState([])
  const [medication, setMedication] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [customStress, setCustomStress] = useState('')
  const saveTimer = useRef(null)

  useEffect(() => {
    loadAll()
  }, [date])

  async function loadAll() {
    setLoading(true)
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('date', date)
      .maybeSingle()

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
    if (!logId) return
    setSaving(true)
    await supabase
      .from('daily_logs')
      .update({ ...updatedLog, updated_at: new Date().toISOString() })
      .eq('id', logId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function update(field, value) {
    const next = { ...log, [field]: value }
    setLog(next)
    scheduleSave(next)
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

  const dateStr = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('zh-TW', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
      })
    : ''

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
        <button
          type="button"
          onClick={() => navigate('/history')}
          className="flex items-center gap-1.5 text-white/60 text-xs mb-3 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />返回歷史記錄
        </button>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-dojo-yellow text-xs font-bold tracking-widest uppercase mb-1">編輯記錄</p>
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
          <span className="font-bold text-stone-800">皮膚狀況</span>
        </div>

        <div className="mb-4">
          <p className="section-label">整體狀況（1 很差 → 5 很好）</p>
          <SkinScore score={log.skin_score} onChange={v => update('skin_score', v)} />
        </div>

        <div className="mb-4">
          <p className="section-label">搔癢程度 PVAS（0–10）</p>
          <ItchScore score={log.itch_score} onChange={v => update('itch_score', v)} />
        </div>

        <div className="mb-4">
          <p className="section-label">抓咬部位</p>
          <BodyMap selected={log.affected_areas} onChange={v => update('affected_areas', v)} />
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
            date={date}
            photoUrl={log.skin_photo_url}
            onUploaded={url => update('skin_photo_url', url)}
          />
        </div>

        <div>
          <p className="section-label">皮膚備註</p>
          <textarea
            className="inp"
            rows={2}
            placeholder="皮膚的觀察細節..."
            value={log.skin_notes}
            onChange={e => update('skin_notes', e.target.value)}
          />
        </div>
      </div>

      {/* ─── 天氣 ─── */}
      <div className="card mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🌤️</span>
          <span className="font-bold text-stone-800">天氣</span>
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
        <GroomingSection values={log} onChange={(k, v) => update(k, v)} />
      </div>

      {/* ─── 壓力事件 ─── */}
      <div className="card mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🧠</span>
          <span className="font-bold text-stone-800">壓力事件</span>
        </div>
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

      {/* ─── 備註 ─── */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📝</span>
          <span className="font-bold text-stone-800">備註</span>
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
            <><Save size={18} />儲存記錄</>
          )}
        </button>
      </div>

    </div>
  )
}
