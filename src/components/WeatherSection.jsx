const WEATHERS = [
  { key: 'sunny',  label: '晴天', icon: '☀️' },
  { key: 'cloudy', label: '多雲', icon: '⛅' },
  { key: 'rainy',  label: '下雨', icon: '🌧️' },
  { key: 'windy',  label: '強風', icon: '🌬️' },
  { key: 'humid',  label: '悶熱潮濕', icon: '🌡️' },
]

export default function WeatherSection({ weather, humidity, onChange, disabled }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="section-label">天氣</p>
        <div className="flex flex-wrap gap-2">
          {WEATHERS.map(w => (
            <button
              key={w.key}
              type="button"
              disabled={disabled}
              onClick={() => onChange('weather', weather === w.key ? null : w.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all active:scale-95 ${
                weather === w.key
                  ? 'bg-dojo-navy text-white border-dojo-navy'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              <span>{w.icon}</span>
              <span>{w.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="section-label mb-0">濕度</p>
          <span className="text-sm font-bold text-dojo-blue">
            {humidity != null ? `${humidity}%` : '—'}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={humidity ?? 50}
          disabled={disabled}
          onChange={e => onChange('humidity', Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: humidity != null
              ? `linear-gradient(to right, #2563EB ${humidity}%, #E5E7EB ${humidity}%)`
              : '#E5E7EB',
            accentColor: '#2563EB',
          }}
        />
        <div className="flex justify-between text-xs text-stone-400 mt-1">
          <span>乾燥 0%</span>
          <span>100% 潮濕</span>
        </div>
      </div>
    </div>
  )
}
