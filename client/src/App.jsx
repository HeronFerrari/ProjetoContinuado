import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

import Login from './components/Login';
import AutorList from './pages/AutorList';
import AutorForm from './pages/AutorForm';
import LivroList from './pages/LivroList';
import LivroForm from './pages/LivroForm';
import CategoriaList from './pages/CategoriaList'; 
import EmprestimoList from './pages/EmprestimoList';
import ReservaList from './pages/ReservaList';
import ErrorBoundary from './components/ErrorBoundary';

// Um componente de Menu separado para manter o código limpo
function AppMenu({ onLogout, userType }) {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/autores">Biblioteca React</Navbar.Brand>
                <Nav className="me-auto">
                    
                    <Link to="/livros"  className="nav-link">Livros</Link>
                    <Link to="/emprestimos" className="nav-link">Empréstimos</Link>
                    <Link to="/reservas" className="nav-link">Reservas</Link>
                    
                    <Link to="/login" className="nav-link">Login</Link>
                    {/* Adicione outros links aqui */}
                    {userType !== 'LEITOR' && (
                        <>
                            <Link to="/categorias" className="nav-link">Categorias</Link>
                            <Link to="/autores" className="nav-link">Autores</Link>
                        </>
                    )}
                </Nav>
                 <Nav> {/* Adicione um Nav para alinhar à direita */}
                    {userType && <Navbar.Text className="me-3">Logado como: **{userType}**</Navbar.Text>} {/* Mostra o tipo de usuário */}
                    <Button variant="outline-light" onClick={onLogout}>Logout</Button>
                </Nav>
            </Container>
        </Navbar>
    );
}


function App() {
   const [user, setUser] = useState(() => {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType'); 
        
        if (token && !userType) {
            try {
                const { jwtDecode } = require('jwt-decode'); // Importe aqui se não for global
                const decodedToken = jwtDecode(token);
                return { loggedIn: true, type: decodedToken.tipo };
            } catch (e) {
                console.error("Erro ao decodificar token no App inicialização:", e);
                localStorage.removeItem('token');
                localStorage.removeItem('userType');
                return { loggedIn: false, type: null };
            }
        }

        return token ? { loggedIn: true, type: userType } : { loggedIn: false, type: null };
    });
    const navigate = useNavigate();

    const handleLogin = (token, tipoUsuario) => { // Ajuste para receber o tipoUsuario
        localStorage.setItem('token', token);
        localStorage.setItem('userType', tipoUsuario); // Salva o tipo
        setUser({ loggedIn: true, type: tipoUsuario }); // Atualiza o estado
        navigate('/autores');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        setUser({ loggedIn: false, type: null });
        navigate('/login');
    };

    return (
        <>
           {user.loggedIn && <AppMenu onLogout={handleLogout} userType={user.type} />}
            <Container className="mt-4">
                <Routes>
                    <Route path="/login" element={<Login onLogin={(t, type) => handleLogin(t, type)} />} />
                    
                    {/* Protegendo a rota de Autores */}
                    <Route path="/autores" element={user.loggedIn ? <ErrorBoundary> <AutorList /> </ErrorBoundary>: <Navigate to="/login" />} />
                    <Route path="/autores/novo" element={user.loggedIn ? <ErrorBoundary> <AutorForm /> </ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/autores/editar/:id" element={user.loggedIn ? <ErrorBoundary> <AutorForm /> </ErrorBoundary>: <Navigate to="/login" />} /> 
                    <Route path="/livros" element={user.loggedIn ? <ErrorBoundary> <LivroList userType={user.type} /> </ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/livros/novo" element={user.loggedIn ? <ErrorBoundary> <LivroForm /> </ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/livros/editar/:id" element={user.loggedIn ? <ErrorBoundary>  <LivroForm /> </ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/categorias" element={user.loggedIn ? <ErrorBoundary> <CategoriaList /> </ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/emprestimos" element={user.loggedIn ? <ErrorBoundary> <EmprestimoList /> </ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/reservas" element={user.loggedIn ? <ErrorBoundary> <ReservaList /> </ErrorBoundary> : <Navigate to="/login" />} />
                    
                    {/* A rota padrão redireciona com base no estado de login */}
                    <Route path="*" element={<Navigate to={user.loggedIn ? "/autores" : "/login"} />} />
                </Routes>
            </Container>
        </>
    );
}

// O App precisa estar dentro do Router para usar o hook useNavigate
function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default AppWrapper;