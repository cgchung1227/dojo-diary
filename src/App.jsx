import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Today from './pages/Today'
import History from './pages/History'
import EditLog from './pages/EditLog'
import Trends from './pages/Trends'
import VetVisits from './pages/VetVisits'
import Weight from './pages/Weight'
import BottomNav from './components/BottomNav'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-dojo-cream pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<Today />} />
          <Route path="/history" element={<History />} />
          <Route path="/edit/:date" element={<EditLog />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/vet" element={<VetVisits />} />
          <Route path="/weight" element={<Weight />} />
        </Routes>
      </div>
      <BottomNav />
    </HashRouter>
  )
}
