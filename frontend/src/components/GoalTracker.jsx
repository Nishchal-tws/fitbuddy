import React, { useState, useEffect } from 'react'
import { Target, Plus, Check, Edit, Trash2, Calendar, Clock } from 'lucide-react'

const API_BASE_URL = 'http://127.0.0.1:8000'

export default function GoalTracker() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    is_completed: false
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/api/goals/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch goals')
      }

      const data = await response.json()
      setGoals(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('access_token')
      const url = editingGoal 
        ? `${API_BASE_URL}/api/goals/${editingGoal.id}`
        : `${API_BASE_URL}/api/goals/`
      
      const method = editingGoal ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to ${editingGoal ? 'update' : 'create'} goal`)
      }

      setSuccess(`Goal ${editingGoal ? 'updated' : 'created'} successfully!`)
      setShowForm(false)
      setEditingGoal(null)
      setFormData({ title: '', description: '', target_date: '', is_completed: false })
      fetchGoals()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target_date: goal.target_date ? new Date(goal.target_date).toISOString().slice(0, 10) : '',
      is_completed: goal.is_completed
    })
    setShowForm(true)
  }

  const handleDelete = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to delete goal')
      }

      setSuccess('Goal deleted successfully!')
      fetchGoals()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (goal) => {
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...goal,
          is_completed: !goal.is_completed
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update goal')
      }

      fetchGoals()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', target_date: '', is_completed: false })
    setShowForm(false)
    setEditingGoal(null)
    setError('')
    setSuccess('')
  }

  const getDaysUntilTarget = (targetDate) => {
    if (!targetDate) return null
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const activeGoals = goals.filter(goal => !goal.is_completed)
  const completedGoals = goals.filter(goal => goal.is_completed)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-600 grid place-items-center text-white">
            <Target size={18} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Goals</h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={18} />
          New Goal
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Goal Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4" data-lpignore="true">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Run 5K, Lose 10 pounds"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your goal and how you plan to achieve it..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 resize-none"
              />
            </div>

            <div>
              <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 mb-1">
                Target Date
              </label>
              <input
                id="target_date"
                name="target_date"
                type="date"
                value={formData.target_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_completed"
                name="is_completed"
                type="checkbox"
                checked={formData.is_completed}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="is_completed" className="text-sm font-medium text-gray-700">
                Mark as completed
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  loading 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500'
                }`}
              >
                {loading ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Goals */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Goals</h3>
        
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-500">Loading goals...</p>
          </div>
        )}

        {!loading && activeGoals.length === 0 && (
          <div className="text-center py-8">
            <Target size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No active goals</p>
            <p className="text-sm text-gray-400 mt-1">Create your first goal to get started</p>
          </div>
        )}

        {!loading && activeGoals.length > 0 && (
          <div className="space-y-3">
            {activeGoals.map((goal) => {
              const daysLeft = getDaysUntilTarget(goal.target_date)
              return (
                <div key={goal.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => handleToggleComplete(goal)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <div className="w-5 h-5 border-2 border-gray-300 rounded hover:border-primary-500"></div>
                        </button>
                        <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {goal.target_date && (
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>
                              {new Date(goal.target_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                              {daysLeft !== null && (
                                <span className={`ml-1 ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 7 ? 'text-orange-600' : ''}`}>
                                  ({daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1 ml-3">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completed Goals</h3>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                      <h4 className="font-semibold text-gray-700 line-through">{goal.title}</h4>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
