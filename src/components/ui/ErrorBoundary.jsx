import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: '100dvh', padding: '32px',
          background: 'var(--bg-base)', textAlign: 'center', gap: '16px',
        }}>
          <p style={{ fontSize: '40px' }}>⚠️</p>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '18px' }}>
            Algo salió mal
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '280px' }}>
            {this.state.error?.message || 'Error inesperado en la aplicación'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.href = '/'
            }}
            style={{
              marginTop: '8px', padding: '12px 28px',
              borderRadius: 'var(--radius-md)', border: 'none',
              background: 'var(--accent)', color: 'white',
              fontWeight: 600, fontSize: '15px', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          >
            Volver al inicio
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
