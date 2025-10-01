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
    <div style={{
      minHeight: '100svh',
      display: 'grid',
      placeItems: 'center',
      background: '#0f172a',
      color: '#e2e8f0',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>FitBuddy</h1>
        <p style={{ marginTop: '6px', opacity: 0.8 }}>
          {isLogin ? 'Welcome back. Sign in to continue.' : 'Create your account to get started.'}
        </p>

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: '#dc2626',
            border: '1px solid #b91c1c',
            borderRadius: '8px',
            color: '#fecaca',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: '#059669',
            border: '1px solid #047857',
            borderRadius: '8px',
            color: '#a7f3d0',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={() => {
              setMode('login')
              setError('')
              setSuccess('')
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '8px',
              border: isLogin ? '1px solid #3b82f6' : '1px solid #374151',
              background: isLogin ? '#1f2937' : 'transparent',
              color: '#e2e8f0',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
          <button
            onClick={() => {
              setMode('register')
              setError('')
              setSuccess('')
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '8px',
              border: !isLogin ? '1px solid #3b82f6' : '1px solid #374151',
              background: !isLogin ? '#1f2937' : 'transparent',
              color: '#e2e8f0',
              cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
          {!isLogin && (
            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '6px' }}>Name</label>
              <input id="name" name="name" type="text" required
                placeholder="Your name"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid #374151', background: '#0b1220', color: '#e2e8f0'
                }}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '6px' }}>Email</label>
            <input id="email" name="email" type="email" required
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #374151', background: '#0b1220', color: '#e2e8f0'
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '6px' }}>Password</label>
            <input id="password" name="password" type="password" required
              placeholder="********"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '8px',
                border: '1px solid #374151', background: '#0b1220', color: '#e2e8f0'
              }}
            />
          </div>

          {isLogin ? null : (
            <div>
              <label htmlFor="experience_level" style={{ display: 'block', marginBottom: '6px' }}>Experience Level</label>
              <input id="experience_level" name="experience_level" type="text" required
                placeholder="Beginner, Intermediate, Advanced"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid #374151', background: '#0b1220', color: '#e2e8f0'
                }}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: '8px', padding: '12px', width: '100%', borderRadius: '8px',
              border: '1px solid #3b82f6', 
              background: loading ? '#6b7280' : '#1d4ed8', 
              color: 'white',
              fontWeight: 600, 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {isLogin && (
          <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px' }}>
            <button onClick={() => {
              setMode('register')
              setError('')
              setSuccess('')
            }} style={{
              border: 'none', background: 'transparent', color: '#60a5fa', cursor: 'pointer'
            }}>
              No account? Register
            </button>
          </div>
        )}
      </div>
    </div>
  )
}





