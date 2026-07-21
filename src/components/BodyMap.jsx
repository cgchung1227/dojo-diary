const AREAS = [
  { key: 'head',        label: '頭部' },
  { key: 'right_ear',   label: '右耳' },
  { key: 'left_ear',    label: '左耳' },
  { key: 'neck',        label: '頸部' },
  { key: 'back',        label: '背部' },
  { key: 'chest',       label: '胸部' },
  { key: 'belly',       label: '腹部' },
  { key: 'right_front', label: '右前爪' },
  { key: 'left_front',  label: '左前爪' },
  { key: 'right_rear',  label: '右後爪' },
  { key: 'left_rear',   label: '左後爪' },
  { key: 'tail',        label: '尾巴' },
  { key: 'groin',       label: '鼠蹊部' },
  { key: 'armpit',      label: '腋下' },
]

export default function BodyMap({ selected = [], onChange, disabled }) {
  function toggle(key) {
    if (disabled) return
    const next = selected.includes(key)
      ? selected.filter(k => k !== key)
      : [...selected, key]
    onChange(next)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {AREAS.map(a => (
          <button
            key={a.key}
            type="button"
            onClick={() => toggle(a.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
              selected.includes(a.key)
                ? 'bg-dojo-navy text-white border-dojo-navy'
                : 'bg-white text-stone-500 border-stone-200'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
      {selected.length === 0 && (
        <p className="text-xs text-stone-400 mt-2">點擊標記今天發紅/抓咬的部位</p>
      )}
      {selected.length > 0 && (
        <p className="text-xs text-dojo-blue font-medium mt-2">
          已標記：{selected.map(k => AREAS.find(a => a.key === k)?.label).join('、')}
        </p>
      )}
    </div>
  )
}
