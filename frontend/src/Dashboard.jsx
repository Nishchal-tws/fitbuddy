import React, { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import DashboardHome from './components/DashboardHome.jsx'
import WorkoutPage from './pages/WorkoutPage.jsx'
import PlansPage from './pages/PlansPage.jsx'
import GoalsPage from './pages/GoalsPage.jsx'
import ProgressPage from './pages/ProgressPage.jsx'

export default function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="grid grid-cols-[16rem_1fr]">
        <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={onLogout} />
        <main className="min-h-screen p-6">
          {activePage === 'overview' && <DashboardHome />}
          {activePage === 'workouts' && <WorkoutPage />}
          {activePage === 'plans' && <PlansPage />}
          {activePage === 'goals' && <GoalsPage />}
          {activePage === 'progress' && <ProgressPage />}
        </main>
      </div>
    </div>
  )
}
