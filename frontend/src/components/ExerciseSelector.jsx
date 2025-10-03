import React, { useState, useEffect } from 'react'
import { Search, X, Plus, Dumbbell, Heart, Activity } from 'lucide-react'

const API_BASE_URL = 'http://127.0.0.1:8000'

export default function ExerciseSelector({ isOpen, onClose, onSelect }) {
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const categories = [
    { key: '', label: 'All Categories', icon: Dumbbell },
    { key: 'Cardio', label: 'Cardio', icon: Heart },
    { key: 'Strength', label: 'Strength', icon: Dumbbell },
    { key: 'Flexibility', label: 'Flexibility', icon: Activity }
  ]

  useEffect(() => {
    if (isOpen) {
      fetchExercises()
    }
  }, [isOpen])

  const fetchExercises = async () => {
    setLoading(true)
    setError('')
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/api/exercises/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch exercises')
      }

      const data = await response.json()
      setExercises(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelect = (exercise) => {
    onSelect(exercise)
    onClose()
  }

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.key === category)
    return categoryData ? categoryData.icon : Dumbbell
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Cardio': return 'text-red-600 bg-red-50'
      case 'Strength': return 'text-blue-600 bg-blue-50'
      case 'Flexibility': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 grid place-items-center text-white">
              <Dumbbell size={18} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Select Exercise</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-500">Loading exercises...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && filteredExercises.length === 0 && (
            <div className="text-center py-8">
              <Dumbbell size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No exercises found</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first exercise to get started'
                }
              </p>
            </div>
          )}

          {!loading && !error && filteredExercises.length > 0 && (
            <div className="space-y-3">
              {filteredExercises.map((exercise) => {
                const CategoryIcon = getCategoryIcon(exercise.category)
                return (
                  <div
                    key={exercise.id}
                    onClick={() => handleSelect(exercise)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">
                            {exercise.name}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
                            <CategoryIcon size={12} />
                            {exercise.category}
                          </span>
                        </div>
                        {exercise.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {exercise.description}
                          </p>
                        )}
                      </div>
                      <button className="ml-3 p-2 text-gray-400 hover:text-primary-600 transition-colors">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
