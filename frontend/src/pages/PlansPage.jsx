import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Target, Users, Star, CheckCircle, X } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [myPlans, setMyPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [activeTab, setActiveTab] = useState('browse') // 'browse' or 'my-plans'
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    // Add a small delay to ensure token is available
    const timer = setTimeout(() => {
      fetchPlans()
      fetchMyPlans()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [selectedLevel])

  const fetchPlans = async () => {
    try {
      const url = selectedLevel 
        ? `${API_BASE_URL}/api/plans/?level=${selectedLevel}`
        : `${API_BASE_URL}/api/plans/`
      
      const token = localStorage.getItem('access_token')
      console.log('PlansPage - Token:', token ? 'Present' : 'Missing')
      console.log('PlansPage - API URL:', url)
      console.log('PlansPage - Full token:', token)
      
      if (!token) {
        console.error('PlansPage - No token found, skipping request')
        setMessage({ type: 'error', text: 'Authentication required. Please login again.' })
        return
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPlans(data)
      } else {
        console.error('PlansPage - fetchPlans failed:', response.status, response.statusText)
        const errorData = await response.json()
        console.error('PlansPage - Error details:', errorData)
      }
    } catch (error) {
      console.error('Error fetching plans:', error)
      setMessage({ type: 'error', text: 'Failed to fetch plans' })
    } finally {
      setLoading(false)
    }
  }

  const fetchMyPlans = async () => {
    try {
      const token = localStorage.getItem('access_token')
      console.log('PlansPage - MyPlans Token:', token ? 'Present' : 'Missing')
      console.log('PlansPage - MyPlans API URL:', `${API_BASE_URL}/api/plans/my-plans`)
      console.log('PlansPage - MyPlans Full token:', token)
      
      if (!token) {
        console.error('PlansPage - MyPlans No token found, skipping request')
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/api/plans/my-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMyPlans(data)
      } else {
        console.error('PlansPage - fetchMyPlans failed:', response.status, response.statusText)
        const errorData = await response.json()
        console.error('PlansPage - MyPlans Error details:', errorData)
      }
    } catch (error) {
      console.error('Error fetching my plans:', error)
    }
  }

  const subscribeToPlan = async (planId) => {
    try {
      const token = localStorage.getItem('access_token')
      console.log('PlansPage - Subscribe Token:', token ? 'Present' : 'Missing')
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please login again.' })
        return
      }
      
      const response = await fetch(`${API_BASE_URL}/api/plans/subscribe/${planId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Successfully subscribed to plan!' })
        fetchMyPlans() // Refresh my plans
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.detail || 'Failed to subscribe to plan' })
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error)
      setMessage({ type: 'error', text: 'Failed to subscribe to plan' })
    }
  }

  const unsubscribeFromPlan = async (planId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/plans/unsubscribe/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Successfully unsubscribed from plan!' })
        fetchMyPlans() // Refresh my plans
      } else {
        setMessage({ type: 'error', text: 'Failed to unsubscribe from plan' })
      }
    } catch (error) {
      console.error('Error unsubscribing from plan:', error)
      setMessage({ type: 'error', text: 'Failed to unsubscribe from plan' })
    }
  }

  const isSubscribed = (planId) => {
    return myPlans.some(myPlan => myPlan.workout_id === planId)
  }

  const getLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const levelOptions = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Plans</h1>
          <p className="text-gray-600">Choose from our curated workout plans or browse your subscribed plans</p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <X size={20} />}
            {message.text}
            <button 
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('browse')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'browse'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Browse Plans
              </button>
              <button
                onClick={() => setActiveTab('my-plans')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-plans'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Plans ({myPlans.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'browse' && (
          <>
            {/* Filters */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter by Level:</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {levelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Plans Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-12">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
                <p className="text-gray-500">Try adjusting your filters or check back later for new plans.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                        {plan.level && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(plan.level)}`}>
                            {plan.level.charAt(0).toUpperCase() + plan.level.slice(1)}
                          </span>
                        )}
                      </div>
                      {isSubscribed(plan.id) && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>

                    {plan.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{plan.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                      {plan.duration_days && (
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>{plan.duration_days} days</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => isSubscribed(plan.id) ? unsubscribeFromPlan(plan.id) : subscribeToPlan(plan.id)}
                      className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                        isSubscribed(plan.id)
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {isSubscribed(plan.id) ? 'Unsubscribe' : 'Subscribe'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'my-plans' && (
          <div>
            {myPlans.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribed plans</h3>
                <p className="text-gray-500">Browse and subscribe to workout plans to see them here.</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Browse Plans
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPlans.map((myPlan) => {
                  const plan = plans.find(p => p.id === myPlan.workout_id)
                  if (!plan) return null
                  
                  return (
                    <div key={myPlan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                          {plan.level && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(plan.level)}`}>
                              {plan.level.charAt(0).toUpperCase() + plan.level.slice(1)}
                            </span>
                          )}
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>

                      {plan.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{plan.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        {plan.duration_days && (
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>{plan.duration_days} days</span>
                          </div>
                        )}
                        {myPlan.start_date && (
                          <div className="flex items-center gap-1">
                            <Clock size={16} />
                            <span>Started {new Date(myPlan.start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => unsubscribeFromPlan(plan.id)}
                        className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        Unsubscribe
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


