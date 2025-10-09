import React, { useState } from 'react'
import { Plus, X, TrendingUp, Calendar, Target } from 'lucide-react'

const API_BASE_URL = 'http://localhost:8000'

export default function ProgressForm({ onProgressAdded }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD format
    metric_name: '',
    metric_value: '',
    unit: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const commonMetrics = [
    { name: 'Weight', unit: 'kg' },
    { name: 'Body Fat %', unit: '%' },
    { name: 'Muscle Mass', unit: 'kg' },
    { name: 'Steps', unit: 'steps' },
    { name: 'Calories Burned', unit: 'calories' },
    { name: 'Workout Duration', unit: 'minutes' },
    { name: 'Distance Run', unit: 'km' },
    { name: 'Push-ups', unit: 'reps' },
    { name: 'Squats', unit: 'reps' },
    { name: 'Plank Hold', unit: 'seconds' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/api/progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          metric_value: parseFloat(formData.metric_value)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to log progress')
      }

      const progressData = await response.json()
      setSuccess(`Progress logged successfully!`)
      
      // Reset form
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        metric_name: '',
        metric_value: '',
        unit: ''
      })

      // Trigger chart refresh
      if (onProgressAdded) {
        onProgressAdded()
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMetricSelect = (metric) => {
    setFormData(prev => ({
      ...prev,
      metric_name: metric.name,
      unit: metric.unit
    }))
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-8 w-8 rounded-lg bg-primary-600 grid place-items-center text-white">
          <TrendingUp size={18} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Log Progress</h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" data-lpignore="true">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <div className="relative">
            <input
              id="date"
              name="date"
              type="date"
              required
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            />
            <Calendar size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Select Metric
          </label>
          <div className="grid grid-cols-2 gap-2">
            {commonMetrics.map((metric, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleMetricSelect(metric)}
                className={`p-2 text-sm border rounded-lg transition-colors ${
                  formData.metric_name === metric.name
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {metric.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="metric_name" className="block text-sm font-medium text-gray-700 mb-1">
              Metric Name *
            </label>
            <input
              id="metric_name"
              name="metric_name"
              type="text"
              required
              value={formData.metric_name}
              onChange={handleInputChange}
              placeholder="e.g., Weight, Steps, Push-ups"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              value={formData.unit}
              onChange={handleInputChange}
              placeholder="e.g., kg, reps, minutes"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            />
          </div>
        </div>

        <div>
          <label htmlFor="metric_value" className="block text-sm font-medium text-gray-700 mb-1">
            Value *
          </label>
          <div className="relative">
            <input
              id="metric_value"
              name="metric_value"
              type="number"
              step="0.1"
              required
              value={formData.metric_value}
              onChange={handleInputChange}
              placeholder="Enter the measured value"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            />
            <Target size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              loading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500'
            }`}
          >
            {loading ? 'Logging Progress...' : 'Log Progress'}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                date: new Date().toISOString().slice(0, 10),
                metric_name: '',
                metric_value: '',
                unit: ''
              })
              setError('')
              setSuccess('')
            }}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500"
          >
            <X size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
