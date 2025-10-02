import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 p-6">
          <div className="max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Ocorreu um erro na aplicação</h2>
            <p className="mb-4">Verifique o console do navegador para mais detalhes.</p>
            <details className="text-left whitespace-pre-wrap bg-gray-100 p-3 rounded">
              <summary className="cursor-pointer">Detalhes (clique para abrir)</summary>
              <pre className="text-xs mt-2">{String(this.state.error)}</pre>
              {this.state.info && <pre className="text-xs mt-2">{String(this.state.info.componentStack)}</pre>}
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
