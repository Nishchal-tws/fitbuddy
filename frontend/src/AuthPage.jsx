import { useState } from 'react'
import React from 'react';

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const isLogin = mode === 'login'

  function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    console.log(isLogin ? 'Login' : 'Register', payload)
    alert(`${isLogin ? 'Login' : 'Register'} submitted`)
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

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={() => setMode('login')}
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
            onClick={() => setMode('register')}
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
              <label htmlFor="confirm" style={{ display: 'block', marginBottom: '6px' }}>Confirm Password</label>
              <input id="confirm" name="confirm" type="password" required
                placeholder="********"
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid #374151', background: '#0b1220', color: '#e2e8f0'
                }}
              />
            </div>
          )}

          <button type="submit" style={{
            marginTop: '8px', padding: '12px', width: '100%', borderRadius: '8px',
            border: '1px solid #3b82f6', background: '#1d4ed8', color: 'white',
            fontWeight: 600, cursor: 'pointer'
          }}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {isLogin && (
          <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px' }}>
            <button onClick={() => setMode('register')} style={{
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



