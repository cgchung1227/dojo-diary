import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Today from './pages/Today'
import History from './pages/History'
import BottomNav from './components/BottomNav'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-dojo-cream pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<Today />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
      <BottomNav />
    </HashRouter>
  )
}
