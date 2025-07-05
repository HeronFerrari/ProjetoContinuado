import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // Este método é chamado se um erro for disparado por um componente filho.
  // Ele permite que você renderize uma UI de fallback.
  static getDerivedStateFromError(error) {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback
    return { hasError: true, error: error };
  }

  // Este método é chamado depois que um erro é disparado.
  // Você pode usá-lo para logar o erro.
  componentDidCatch(error, errorInfo) {
    // Você pode logar o erro para um serviço de relatórios de erro aqui
    console.error("ErrorBoundary pegou um erro:", error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI de fallback personalizada
      return (
        <div style={{ padding: '20px', border: '1px solid red', borderRadius: '5px', backgroundColor: '#ffe6e6' }}>
          <h2>Ops! Algo deu errado.</h2>
          <p>Ocorreu um erro ao renderizar este componente.</p>
          {/* Para depuração, você pode exibir os detalhes do erro */}
          {process.env.NODE_ENV === 'development' && ( // Exibe detalhes apenas em desenvolvimento
            <details style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '15px', padding: '10px 20px', cursor: 'pointer' }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;