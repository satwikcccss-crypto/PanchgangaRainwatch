import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[CCCSS Dashboard Error]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          margin: '1rem',
          background: '#fff7ed',
          border: '2px solid #f97316',
          borderRadius: '8px',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        }}>
          <h3 style={{ color: '#c2410c', fontWeight: 800, marginBottom: '0.5rem' }}>
            ⚠ Component Error
          </h3>
          <p style={{ color: '#7c2d12', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            {this.props.label || 'A section'} failed to render.
          </p>
          <code style={{ fontSize: '0.75rem', color: '#9a3412', background: '#ffedd5', padding: '4px 8px', borderRadius: '4px' }}>
            {this.state.error?.message}
          </code>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
