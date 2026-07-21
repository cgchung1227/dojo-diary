const LABELS = {
  0: '完全正常',
  1: '偶爾撓一下',
  2: '輕微搔癢',
  3: '有點在意',
  4: '反覆抓癢',
  5: '打斷活動去抓',
  6: '頻繁搔癢',
  7: '難以分心',
  8: '持續抓咬',
  9: '影響睡眠',
  10: '整晚抓不停',
}

function getColor(score) {
  if (score === null || score === undefined) return '#9CA3AF'
  if (score <= 2) return '#22C55E'
  if (score <= 4) return '#84CC16'
  if (score <= 6) return '#EAB308'
  if (score <= 8) return '#F97316'
  return '#EF4444'
}

export default function ItchScore({ score, onChange, disabled }) {
  const color = getColor(score)

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-stone-400 w-4">0</span>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={score ?? 0}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: score != null
              ? `linear-gradient(to right, ${color} ${(score / 10) * 100}%, #E5E7EB ${(score / 10) * 100}%)`
              : '#E5E7EB',
            accentColor: color,
          }}
        />
        <span className="text-xs text-stone-400 w-4 text-right">10</span>
        <span
          className="text-xl font-bold w-8 text-center tabular-nums"
          style={{ color }}
        >
          {score ?? '-'}
        </span>
      </div>
      <p className="text-center text-xs mt-1.5 font-medium h-4" style={{ color }}>
        {score != null ? LABELS[score] : '移動滑桿評分（PVAS）'}
      </p>
    </div>
  )
}
