import { NavLink } from 'react-router-dom'
import { ClipboardList, Clock, TrendingUp, Stethoscope, Scale } from 'lucide-react'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 shadow-lg z-50">
      <div className="flex max-w-lg mx-auto">
        <NavLink
          to="/today"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
              isActive ? 'text-dojo-blue' : 'text-stone-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <ClipboardList size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              今天
            </>
          )}
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
              isActive ? 'text-dojo-blue' : 'text-stone-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Clock size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              歷史
            </>
          )}
        </NavLink>
        <NavLink
          to="/trends"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
              isActive ? 'text-dojo-blue' : 'text-stone-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <TrendingUp size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              趨勢
            </>
          )}
        </NavLink>
        <NavLink
          to="/vet"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
              isActive ? 'text-dojo-blue' : 'text-stone-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Stethoscope size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              回診
            </>
          )}
        </NavLink>
        <NavLink
          to="/weight"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
              isActive ? 'text-dojo-blue' : 'text-stone-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Scale size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              體重
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
