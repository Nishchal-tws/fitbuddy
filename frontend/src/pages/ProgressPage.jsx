import React from 'react'
import ProgressChart from '../components/ProgressChart.jsx'

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Progress</h1>
        <p className="text-gray-500">Track your fitness journey with detailed progress charts.</p>
      </div>

      <ProgressChart />
    </div>
  )
}


