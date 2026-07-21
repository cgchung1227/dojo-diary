import { useState, useEffect } from 'react'
import { PawPrint } from 'lucide-react'
import { supabase } from '../lib/supabase'

const WEATHER_ICON = {
  sunny: '☀️', cloudy: '⛅', rainy: '🌧️', windy: '🌬️', humid: '🌡️',
}

const SCORE_COLOR = ['', '#EF4444', '#F97316', '#EAB308', '#60A5FA', '#1E3A8A']

const ODOR_LABEL = { none: '無異味', sour: '酸臭', fishy: '腥味', yeast: '酵母味' }
const DISC_LABEL = { none: '正常', flaky: '脫皮', fluid: '組織液', pus: '膿胞' }

export default function History() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [entryCache, setEntryCache] = useState({})

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .order('date', { ascending: false })
        .limit(60)
      setLogs(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function loadEntries(id) {
    if (entryCache[id]) return
    const [d, e, m] = await Promise.all([
      supabase.from('diet_entries').select('*').eq('log_id', id).order('created_at'),
      supabase.from('exercise_entries').select('*').eq('log_id', id).order('created_at'),
      supabase.from('medication_entries').select('*').eq('log_id', id).order('created_at'),
    ])
    setEntryCache(c => ({
      ...c,
      [id]: {
        diet: d.data || [],
        exercise: e.data || [],
        medication: m.data || [],
      }
    }))
  }

  function toggle(log) {
    if (expanded === log.id) {
      setExpanded(null)
    } else {
      setExpanded(log.id)
      loadEntries(log.id)
    }
  }

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
        <h1 className="text-lg font-bold">歷史記錄</h1>
        <p className="text-white/50 text-xs mt-1">共 {logs.length} 天的記錄</p>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🐕</p>
          <p className="text-stone-400 text-sm">還沒有記錄，快去今天頁面新增！</p>
        </div>
      ) : (
        <div className="space-y-2 pb-6">
          {logs.map(log => {
            const isOpen = expanded === log.id
            const entries = entryCache[log.id]
            const date = new Date(log.date + 'T00:00:00')
            const dateStr = date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', weekday: 'short' })

            return (
              <div key={log.id} className="card">
                <button
                  type="button"
                  onClick={() => toggle(log)}
                  className="flex items-center gap-3 w-full text-left"
                >
                  {/* Date */}
                  <div className="flex-shrink-0 w-14 text-center">
                    <p className="text-[10px] text-stone-400 font-semibold">
                      {date.toLocaleDateString('zh-TW', { weekday: 'short' })}
                    </p>
                    <p className="text-xl font-black text-stone-800 leading-none">
                      {date.getDate()}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {date.toLocaleDateString('zh-TW', { month: 'short' })}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-10 bg-stone-100 flex-shrink-0" />

                  {/* Summary */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Skin score */}
                      {log.skin_score && (
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(n => (
                            <PawPrint
                              key={n}
                              size={12}
                              fill={log.skin_score >= n ? SCORE_COLOR[log.skin_score] : 'transparent'}
                              color={log.skin_score >= n ? SCORE_COLOR[log.skin_score] : '#D1D5DB'}
                              strokeWidth={1.5}
                            />
                          ))}
                        </div>
                      )}
                      {/* Itch score */}
                      {log.itch_score != null && (
                        <span className="text-xs font-bold text-stone-500">
                          搔癢 {log.itch_score}/10
                        </span>
                      )}
                      {/* Weather */}
                      {log.weather && <span className="text-sm">{WEATHER_ICON[log.weather]}</span>}
                      {/* Humidity */}
                      {log.humidity != null && (
                        <span className="text-xs text-stone-400">濕 {log.humidity}%</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {log.affected_areas?.length > 0 && (
                        <span className="text-xs text-dojo-blue bg-dojo-blue-light px-2 py-0.5 rounded-full">
                          {log.affected_areas.length} 個患部
                        </span>
                      )}
                      {log.bathed && <span className="text-xs text-stone-400">🛁 洗澡</span>}
                      {log.groomed && <span className="text-xs text-stone-400">🖌️ 梳毛</span>}
                    </div>
                  </div>

                  <span className="text-stone-300 text-lg flex-shrink-0">{isOpen ? '▲' : '▽'}</span>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-stone-100 space-y-3">

                    {/* Skin details */}
                    {(log.skin_notes || log.odor || log.discharge) && (
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">皮膚</p>
                        {log.odor && log.odor !== 'none' && (
                          <p className="text-xs text-stone-600">異味：{ODOR_LABEL[log.odor]}</p>
                        )}
                        {log.discharge && log.discharge !== 'none' && (
                          <p className="text-xs text-stone-600">分泌物：{DISC_LABEL[log.discharge]}</p>
                        )}
                        {log.skin_notes && (
                          <p className="text-xs text-stone-500 mt-1">{log.skin_notes}</p>
                        )}
                        {log.skin_photo_url && (
                          <img
                            src={log.skin_photo_url}
                            alt="皮膚狀況"
                            className="mt-2 w-full max-w-xs h-32 object-cover rounded-xl"
                          />
                        )}
                      </div>
                    )}

                    {/* Diet */}
                    {entries?.diet.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">飲食</p>
                        {entries.diet.map(e => (
                          <p key={e.id} className="text-xs text-stone-600">
                            {e.food_name}{e.amount ? ` (${e.amount})` : ''}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Exercise */}
                    {entries?.exercise.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">運動</p>
                        {entries.exercise.map(e => (
                          <p key={e.id} className="text-xs text-stone-600">
                            {e.type}{e.duration_min ? ` ${e.duration_min} 分鐘` : ''}{e.notes ? ` — ${e.notes}` : ''}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Medication */}
                    {entries?.medication.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">用藥</p>
                        {entries.medication.map(e => (
                          <p key={e.id} className="text-xs text-stone-600">
                            {e.med_name}{e.dose ? ` (${e.dose})` : ''}{e.route ? ` — ${e.route}` : ''}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Stress */}
                    {log.stress_events?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">壓力事件</p>
                        <p className="text-xs text-stone-600">{log.stress_events.join('、')}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {log.notes && (
                      <div>
                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">備注</p>
                        <p className="text-xs text-stone-500">{log.notes}</p>
                      </div>
                    )}

                    {!entries && (
                      <p className="text-xs text-stone-300 text-center py-2">載入詳情中...</p>
                    )}
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
