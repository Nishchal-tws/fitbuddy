import React from 'react';

export default function Dashboard({ onLogout }) {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    onLogout();
  };

  return (
    <div style={{
      minHeight: '100svh',
      background: '#0f172a',
      color: '#e2e8f0',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          padding: '16px 0',
          borderBottom: '1px solid #1f2937'
        }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>FitBuddy Dashboard</h1>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Logout
          </button>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <div style={{
            background: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Welcome Back!</h2>
            <p style={{ margin: 0, opacity: 0.8 }}>
              You're successfully logged in to FitBuddy your personal fitness assistant. Start tracking your fitness journey!
            </p>
          </div>

          <div style={{
            background: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button style={{
                padding: '12px 16px',
                background: '#1d4ed8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}>
                Start Workout
              </button>
              <button style={{
                padding: '12px 16px',
                background: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}>
                Log Progress
              </button>
              <button style={{
                padding: '12px 16px',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}>
                Set Goals
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
