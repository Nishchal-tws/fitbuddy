import React from 'react'
import { LayoutDashboard, Dumbbell, Target, Flag, TrendingUp, LogOut } from 'lucide-react'

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const navItems = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'workouts', label: 'Workouts', icon: Dumbbell },
    { key: 'plans', label: 'Plans', icon: Flag },
    { key: 'goals', label: 'Goals', icon: Target },
    { key: 'progress', label: 'Progress', icon: TrendingUp },
  ]

  return (
    <aside className="h-screen sticky top-0 w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary-600 grid place-items-center text-white font-bold">FB</div>
          <div className="text-xl font-semibold">FitBuddy</div>
        </div>
      </div>
      <nav className="px-3 flex-1">
        <ul className="space-y-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <li key={key}>
              <button
                onClick={() => setActivePage(key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === key
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 border-t border-gray-200">
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}


