import { useState } from 'react' 
import React from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const isLogin = mode === 'login'

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const form = new FormData(event.currentTarget)
      const payload = Object.fromEntries(form.entries())

      if (isLogin) {
        // Login - use OAuth2PasswordRequestForm format
        const formData = new FormData()
        formData.append('username', payload.email) // OAuth2 uses 'username' field
        formData.append('password', payload.password)

        const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Login failed')
        }

        const tokenData = await response.json()
        localStorage.setItem('access_token', tokenData.access_token)
        setSuccess('Login successful! Redirecting...')
        
        // Call the onLogin callback to switch to dashboard
        setTimeout(() => {
          onLogin()
        }, 1500)

      } else {
        // Registration
        

        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: payload.email,
            full_name: payload.name,
            password: payload.password,
            experience_level: payload.experience_level
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Registration failed')
        }

        const userData = await response.json()
        setSuccess(`Registration successful! Welcome ${userData.full_name}. Please login.`)
        
        // Switch to login mode after successful registration
        setTimeout(() => {
          setMode('login')
          setSuccess('')
        }, 2000)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-9 w-9 rounded-xl bg-primary-600 grid place-items-center text-white font-bold">FB</div>
          <h1 className="text-2xl font-semibold text-gray-900">FitBuddy</h1>
        </div>
        <p className="text-gray-500 mb-6">
          {isLogin ? 'Welcome back. Sign in to continue.' : 'Create your account to get started.'}
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setMode('login')
              setError('')
              setSuccess('')
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isLogin
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setMode('register')
              setError('')
              setSuccess('')
            }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              !isLogin
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 mt-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                required
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required
              placeholder="********"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <input 
                id="experience_level" 
                name="experience_level" 
                type="text" 
                required
                placeholder="Beginner, Intermediate, Advanced"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`mt-2 w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              loading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500'
            }`}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {isLogin && (
          <div className="mt-3 text-center">
            <button 
              onClick={() => {
                setMode('register')
                setError('')
                setSuccess('')
              }} 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              No account? Register
            </button>
          </div>
        )}
      </div>
    </div>
  )
}





