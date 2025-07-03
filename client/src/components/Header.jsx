import React from 'react';
import './Header.css'; // Vamos criar este arquivo de estilo em breve

function Header() {
    return (
        <header className="app-header">
            <h1>Biblioteca</h1>
            <nav>
                <a href="/autores">Autores</a>
                <a href="/livros">Livros</a>
                {/* Adicionaremos mais links aqui no futuro */}
            </nav>
        </header>
    );
}

export default Header;