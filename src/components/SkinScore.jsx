import { PawPrint } from 'lucide-react'

const LEVELS = [
  { label: '非常差', color: '#EF4444' },
  { label: '偏差',   color: '#F97316' },
  { label: '普通',   color: '#EAB308' },
  { label: '不錯',   color: '#60A5FA' },
  { label: '很好',   color: '#1E3A8A' },
]

export default function SkinScore({ score, onChange, disabled }) {
  return (
    <div>
      <div className="flex justify-center gap-2 mb-2">
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            disabled={disabled}
            onClick={() => onChange(score === n ? null : n)}
            className="w-14 h-14 flex items-center justify-center active:scale-90 transition-transform"
          >
            <PawPrint
              size={40}
              fill={score >= n ? LEVELS[n-1].color : 'transparent'}
              color={score >= n ? LEVELS[n-1].color : '#D1D5DB'}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-sm font-semibold h-5" style={{ color: score ? LEVELS[score-1].color : '#9CA3AF' }}>
        {score ? `${score}/5 — ${LEVELS[score-1].label}` : '點選評分'}
      </p>
    </div>
  )
}
