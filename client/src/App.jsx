// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container } from 'react-bootstrap';

import Login from './components/Login'; // Assumindo que Login está em components
import AutorList from './pages/AutorList'; // Importa a nova tela

function App() {
    // Verifica se existe um token para decidir se mostra o menu completo
    const token = localStorage.getItem('token');

    return (
        <Router>
            {token && ( // Renderização Condicional: só mostra o menu se estiver logado
                <Navbar bg="dark" variant="dark" expand="lg">
                    <Container>
                        <Navbar.Brand href="/">Biblioteca React</Navbar.Brand>
                        <Nav className="me-auto">
                            <Link to="/autores" className="nav-link">Autores</Link>
                        </Nav>
                    </Container>
                </Navbar>
            )}
            
            <Container className="mt-4">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/autores" element={<AutorList />} />
                    
                    {/* A rota padrão agora verifica se o usuário está logado */}
                    <Route path="*" element={<Navigate to={token ? "/autores" : "/login"} />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;