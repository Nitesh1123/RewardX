import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('RewardX Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '40px'
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2 style={{ 
            color: '#F59E0B', 
            fontSize: '24px',
            margin: '16px 0 8px' 
          }}>
            Something went wrong
          </h2>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            {this.state.error?.message}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #F59E0B, #B45309)',
              color: '#08080F',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
