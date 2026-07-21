const TOGGLES = [
  { key: 'bathed',        label: '今天洗澡了',        icon: '🛁' },
  { key: 'groomed',       label: '梳毛/修毛',          icon: '🖌️' },
  { key: 'ear_cleaned',   label: '清潔耳朵',          icon: '👂' },
  { key: 'pest_control',  label: '施用體外驅蟲藥',    icon: '🦟' },
  { key: 'bedding_washed',label: '清洗睡墊/睡窩',     icon: '🧺' },
]

export default function GroomingSection({ values, onChange }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">✨</span>
        <span className="font-bold text-stone-800">清潔與環境</span>
      </div>

      <div className="space-y-2">
        {TOGGLES.map(t => (
          <label key={t.key} className="flex items-center gap-3 py-2 px-3 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors active:bg-stone-100">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              values[t.key]
                ? 'bg-dojo-navy border-dojo-navy'
                : 'border-stone-300 bg-white'
            }`}>
              {values[t.key] && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={!!values[t.key]}
              onChange={e => onChange(t.key, e.target.checked)}
            />
            <span className="text-sm font-medium text-stone-700 flex-1">{t.label}</span>
            <span className="text-base">{t.icon}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
