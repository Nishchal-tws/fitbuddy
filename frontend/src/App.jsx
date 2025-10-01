import AuthPage from './AuthPage.jsx'
import Dashboard from './Dashboard.jsx'
import React, { useState, useEffect } from 'react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        background: '#0f172a',
        color: '#e2e8f0'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <AuthPage onLogin={handleLogin} />
}







