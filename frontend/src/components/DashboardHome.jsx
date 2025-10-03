import React, { useEffect, useState } from 'react'

const API_BASE_URL = 'http://127.0.0.1:8000'

export default function DashboardHome() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchGoals() {
      try {
        setLoading(true)
        setError('')
        const token = localStorage.getItem('access_token')
        const res = await fetch(`${API_BASE_URL}/api/goals/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.detail || 'Failed to load goals')
        }
        const data = await res.json()
        setGoals(Array.isArray(data) ? data.slice(0, 3) : [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchGoals()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500">Here is your quick overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Steps', value: '2,500' },
          { label: 'Water', value: '1.25 Liters' },
          { label: 'Calories', value: '750' },
          { label: 'Heart Rate', value: '110 Bpm' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-500">{card.label}</div>
            <div className="mt-2 text-2xl font-semibold text-primary-700">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2 min-h-64 grid place-items-center text-gray-500">
          <span>Detailed analytics and charts are coming soon!</span>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Today's Goals</h2>
          </div>
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && !error && (
            <ul className="space-y-2">
              {goals.length === 0 ? (
                <li className="text-sm text-gray-500">No goals yet.</li>
              ) : (
                goals.map((g) => (
                  <li key={g.id || g.title} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                    <span className="font-medium text-gray-800">{g.title || g.name}</span>
                    <span className="text-xs text-gray-500">{g.status || ''}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1,2,3].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm min-h-40 grid place-items-center text-gray-500">
            Advanced widget placeholder
          </div>
        ))}
      </div>
    </div>
  )
}


