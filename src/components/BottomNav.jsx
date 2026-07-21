import { NavLink } from 'react-router-dom'
import { ClipboardList, Clock } from 'lucide-react'

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
      </div>
    </nav>
  )
}
