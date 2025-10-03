import React from 'react'
import WorkoutForm from '../components/WorkoutForm.jsx'
import TimerWidget from '../components/TimerWidget.jsx'

export default function WorkoutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Workouts</h1>
        <p className="text-gray-500">Log your workout sessions and track your progress.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutForm />
        <TimerWidget />
      </div>
    </div>
  )
}


