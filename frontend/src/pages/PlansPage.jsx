import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Target, Users, Star, CheckCircle, X } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [myPlans, setMyPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLevel, setSelectedLevel] = useState('')
  const [activeTab, setActiveTab] = useState('browse') // 'browse' or 'my-plans'
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedPlanExercises, setSelectedPlanExercises] = useState(null)
  const [loadingExercises, setLoadingExercises] = useState(false)

  useEffect(() => {
    // Add a small delay to ensure token is available
    const timer = setTimeout(() => {
      if (activeTab === 'browse') {
        fetchPlans()
      } else {
        fetchPlansForMyPlans()
      }
      fetchMyPlans()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [selectedLevel, activeTab])

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

  const fetchAllPlans = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      // Fetch both system plans and custom plans
      const [systemPlansResponse, customPlansResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/plans/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/plans/my-plans`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      let allPlans = []
      if (systemPlansResponse.ok) {
        const systemPlans = await systemPlansResponse.json()
        allPlans = [...allPlans, ...systemPlans]
      }

      if (customPlansResponse.ok) {
        const myPlans = await customPlansResponse.json()
        // For custom plans, we need to fetch the actual plan details
        for (const myPlan of myPlans) {
          try {
            const planResponse = await fetch(`${API_BASE_URL}/api/plans/plan/${myPlan.workout_id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (planResponse.ok) {
              const planDetails = await planResponse.json()
              allPlans.push(planDetails)
            }
          } catch (error) {
            console.error(`Error fetching plan details for ${myPlan.workout_id}:`, error)
          }
        }
      }

      setPlans(allPlans)
    } catch (error) {
      console.error('Error fetching all plans:', error)
    }
  }

  const fetchPlansForMyPlans = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      // Fetch my plans and get all plan details
      const myPlansResponse = await fetch(`${API_BASE_URL}/api/plans/my-plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (myPlansResponse.ok) {
        const myPlans = await myPlansResponse.json()
        const planDetails = []
        
        // Fetch details for each plan
        for (const myPlan of myPlans) {
          try {
            const planResponse = await fetch(`${API_BASE_URL}/api/plans/plan/${myPlan.workout_id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (planResponse.ok) {
              const plan = await planResponse.json()
              planDetails.push(plan)
            }
          } catch (error) {
            console.error(`Error fetching plan details for ${myPlan.workout_id}:`, error)
          }
        }
        
        setPlans(planDetails)
      }
    } catch (error) {
      console.error('Error fetching plans for my plans:', error)
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

  const fetchPlanExercises = async (planId) => {
    try {
      setLoadingExercises(true)
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/plans/plan/${planId}/exercises`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedPlanExercises(data)
      } else {
        console.error('Failed to fetch plan exercises')
        setMessage({ type: 'error', text: 'Failed to load plan exercises' })
      }
    } catch (error) {
      console.error('Error fetching plan exercises:', error)
      setMessage({ type: 'error', text: 'Failed to load plan exercises' })
    } finally {
      setLoadingExercises(false)
    }
  }

  const handlePlanClick = (planId) => {
    fetchPlanExercises(planId)
  }

  const closeExercisesModal = () => {
    setSelectedPlanExercises(null)
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
                  <div 
                    key={plan.id} 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handlePlanClick(plan.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                        <div className="flex items-center gap-2">
                          {plan.level && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(plan.level)}`}>
                              {plan.level.charAt(0).toUpperCase() + plan.level.slice(1)}
                            </span>
                          )}
                          {plan.is_completed && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Completed
                            </span>
                          )}
                        </div>
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
                  if (!plan) {
                    // If plan not found in plans array, it might be a custom plan
                    // For now, show a placeholder until we fetch the plan details
                    return (
                      <div key={myPlan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading plan details...</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Custom Plan
                              </span>
                            </div>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-blue-100 text-blue-700 text-center">
                          Your Custom Plan
                        </div>
                      </div>
                    )
                  }
                  
                  const isCustomPlan = myPlan.id > 1000000 // Custom plans have high IDs
                  
                  return (
                    <div 
                      key={myPlan.id} 
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handlePlanClick(myPlan.workout_id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {plan.level && (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(plan.level)}`}>
                                  {plan.level.charAt(0).toUpperCase() + plan.level.slice(1)}
                                </span>
                              )}
                              {plan.is_completed && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✅ Completed
                                </span>
                              )}
                            </div>
                            {isCustomPlan && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Custom Plan
                              </span>
                            )}
                          </div>
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

                      {isCustomPlan ? (
                        <div className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-blue-100 text-blue-700 text-center">
                          Your Custom Plan
                        </div>
                      ) : (
                        <button
                          onClick={() => unsubscribeFromPlan(plan.id)}
                          className="w-full py-2 px-4 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Unsubscribe
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exercises Modal */}
      {selectedPlanExercises && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPlanExercises.plan_title}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(selectedPlanExercises.plan_level)}`}>
                      {selectedPlanExercises.plan_level?.charAt(0).toUpperCase() + selectedPlanExercises.plan_level?.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{selectedPlanExercises.plan_duration} days</span>
                  </div>
                </div>
                <button
                  onClick={closeExercisesModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {loadingExercises ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading exercises...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Workout Exercises</h3>
                  {selectedPlanExercises.exercises.map((exercise, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          exercise.category === 'Strength' ? 'bg-blue-100 text-blue-800' :
                          exercise.category === 'Cardio' ? 'bg-red-100 text-red-800' :
                          exercise.category === 'Core' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {exercise.category}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Sets:</span> {exercise.sets}
                        </div>
                        <div>
                          <span className="font-medium">Reps:</span> {exercise.reps}
                        </div>
                        <div>
                          <span className="font-medium">Rest:</span> {exercise.rest}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


