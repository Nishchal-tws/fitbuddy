import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

const API_BASE_URL = 'http://127.0.0.1:8000'

export default function DashboardHome() {
  const [goals, setGoals] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentQuote, setCurrentQuote] = useState('')

  // Motivational quotes array
  const motivationalQuotes = [
    "Every workout counts. Every rep matters. Every step forward is progress.",
    "The only bad workout is the one that didn't happen.",
    "Your body can do it. It's your mind you have to convince.",
    "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.",
    "The pain you feel today will be the strength you feel tomorrow.",
    "Fitness is not about being better than someone else. It's about being better than you used to be.",
    "Don't wish for it, work for it.",
    "The hardest part of any workout is showing up.",
    "You are stronger than you think, more capable than you imagine.",
    "Progress, not perfection, is the goal.",
    "Every expert was once a beginner. Every pro was once an amateur.",
    "The body achieves what the mind believes.",
    "Success isn't always about greatness. It's about consistency.",
    "You don't have to be great to get started, but you have to get started to be great.",
    "The only impossible journey is the one you never begin."
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError('')
        const token = localStorage.getItem('access_token')
        
        // Fetch user data
        const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }

        // Fetch goals data
        const goalsRes = await fetch(`${API_BASE_URL}/api/goals/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (goalsRes.ok) {
          const goalsData = await goalsRes.json()
          setGoals(Array.isArray(goalsData) ? goalsData.slice(0, 3) : [])
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Get random motivational quote
  const getRandomQuote = () => {
    return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  }

  // Set initial quote
  useEffect(() => {
    setCurrentQuote(getRandomQuote())
  }, [])

  // Refresh quote function
  const refreshQuote = () => {
    setCurrentQuote(getRandomQuote())
  }

  // Get user's first name
  const getFirstName = () => {
    if (!user?.full_name) return 'Champion'
    return user.full_name.split(' ')[0]
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {getFirstName()}! 👋
            </h1>
            <p className="text-lg text-primary-700 font-medium italic">
              "{currentQuote}"
            </p>
            <p className="text-sm text-gray-600 mt-3">
              Here's your fitness overview for today.
            </p>
          </div>
          <button
            onClick={refreshQuote}
            className="ml-4 p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
            title="Get new motivational quote"
          >
            <RefreshCw size={20} />
          </button>
        </div>
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


