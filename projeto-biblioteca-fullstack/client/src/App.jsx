import React from 'react';
import Header from './components/Header'; // Importa nosso novo componente

function App() {
  // Usando a sintaxe de Fragmentos <> que o professor explicou
  return (
    <> 
      <Header />
      <main className="app-content">
        <h2>Bem-vindo ao Sistema da Biblioteca</h2>
        <p>Utilize o menu acima para navegar pelas seções.</p>
        
        {/* Futuramente, aqui renderizaremos as listas de autores, livros, etc. */}
      </main>
    </>
  );
}

export default App;