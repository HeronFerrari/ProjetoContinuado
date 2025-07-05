import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import api from './api';
// Você pode precisar importar jwtDecode aqui se usá-lo na inicialização fora do Login.jsx
import { jwtDecode } from 'jwt-decode'; // Importe jwtDecode aqui também para o App.jsx

import Login from './components/Login';
import AutorList from './pages/AutorList';
import AutorForm from './pages/AutorForm';
import LivroList from './pages/LivroList';
import LivroForm from './pages/LivroForm';
import CategoriaList from './pages/CategoriaList'; 
import EmprestimoList from './pages/EmprestimoList';
import ReservaList from './pages/ReservaList';
import ComentarioList from './pages/ComentarioList'; 
import ComentarioForm from './pages/ComentarioForm';
import UsuarioList from './pages/UsuarioList';
import UsuarioForm from './pages/UsuarioForm';
import ErrorBoundary from './components/ErrorBoundary';

// Um componente de Menu separado para manter o código limpo
function AppMenu({ onLogout, userType }) { // userType como prop
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/autores">Biblioteca React</Navbar.Brand>
                <Nav className="me-auto">
                    {/* LINKS VISÍVEIS PARA TODOS LOGADOS */}
                
                    <Link to="/livros"  className="nav-link">Livros</Link>
                    <Link to="/emprestimos" className="nav-link">Empréstimos</Link>
                    <Link to="/reservas" className="nav-link">Reservas</Link>
                    <Link to="/comentarios" className="nav-link">Comentários</Link>

                    
                    {/* LINKS CONDICIONAIS PARA ADMIN E BIBLIOTECÁRIO */}
                    {(userType === 'ADMIN' || userType === 'BIBLIOTECARIO') && (
                        <>
                            <Link to="/autores" className="nav-link">Autores</Link> 
                            <Link to="/categorias" className="nav-link">Categorias</Link>
                            {/* NOVO: Link para Gerenciar Usuários, APENAS para ADMIN */}
                            {userType === 'ADMIN' && (
                                <Link to="/usuarios" className="nav-link">Usuários</Link>
                            )}
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
        // Toda a lógica de inicialização deve estar aqui dentro deste callback
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token'); // Pega o token aqui para decodificação

        if (storedUser) {
            return JSON.parse(storedUser); // Retorna o usuário salvo se existir
        } 
        // Se não houver 'user' salvo, mas houver um token (ex: refresh da página)
        else if (token) {
            try {
                const decodedToken = jwtDecode(token); // Decodifica o token
                const userType = decodedToken.tipo;
                const userId = decodedToken.id; // Supondo que o ID também está no payload do token
                const newUser = { loggedIn: true, type: userType, id: userId };
                localStorage.setItem('user', JSON.stringify(newUser)); // Salva para futuras recargas
                return newUser;
            } catch (e) {
                console.error("Erro ao decodificar token na inicialização do App:", e);
                localStorage.removeItem('token');
                localStorage.removeItem('user'); // Limpa user também
                return { loggedIn: false, type: null, id: null };
            }
        }
        // Caso nenhum token ou usuário seja encontrado
        return { loggedIn: false, type: null, id: null };
    });

    const navigate = useNavigate();

    const handleLogin = (token, tipoUsuario, idUsuario) => { 
        const newUser = { loggedIn: true, type: tipoUsuario, id: idUsuario };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        navigate('/autores');
    };

    const handleLogout = () => {
        setUser({ loggedIn: false, type: null, id: null });
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        navigate('/login');
    };

    // Este useEffect ainda é útil para configurar o Axios globalmente na montagem inicial
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);
    
    return (
        <>
           {user.loggedIn && <AppMenu onLogout={handleLogout} userType={user.type} />}
            <Container className="mt-4">
                <Routes>
                    <Route path="/login" element={<Login onLogin={handleLogin} />} />
                    
                    {/* Todas as rotas agora usam user.loggedIn e passam user.type e user.id */}
                    {/* Rotas de LIVROS (visível para todos, com ações condicionais dentro do LivroList) */}
                    <Route path="/livros" element={user.loggedIn ? <ErrorBoundary> <LivroList userType={user.type} /> </ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/livros/novo" element={user.loggedIn && (user.type === 'ADMIN' || user.type === 'BIBLIOTECARIO') ? <ErrorBoundary> <LivroForm userType={user.type} /> </ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/livros/editar/:id" element={user.loggedIn && (user.type === 'ADMIN' || user.type === 'BIBLIOTECARIO') ? <ErrorBoundary>  <LivroForm userType={user.type} /> </ErrorBoundary> : <Navigate to="/login" />} />
                    
                    {/* Rotas de EMPRÉSTIMOS e RESERVAS (visível para todos, com filtro e ações condicionais) */}
                    <Route path="/emprestimos" element={user.loggedIn ? <ErrorBoundary> <EmprestimoList userType={user.type} userId={user.id} /> </ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/reservas" element={user.loggedIn ? <ErrorBoundary> <ReservaList userType={user.type} userId={user.id} /> </ErrorBoundary> : <Navigate to="/login" />} />
                    
                    {/* Rotas de AUTORES (AGORA RESTRITAS a ADMIN/BIBLIOTECARIO) */}
                    <Route path="/autores" element={user.loggedIn && (user.type === 'ADMIN' || user.type === 'BIBLIOTECARIO') ? <ErrorBoundary> <AutorList userType={user.type} /> </ErrorBoundary>: <Navigate to="/login" />} />
                    <Route path="/autores/novo" element={user.loggedIn && (user.type === 'ADMIN' || user.type === 'BIBLIOTECARIO') ? <ErrorBoundary> <AutorForm userType={user.type} /> </ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/autores/editar/:id" element={user.loggedIn && (user.type === 'ADMIN' || user.type === 'BIBLIOTECARIO') ? <ErrorBoundary> <AutorForm userType={user.type} /> </ErrorBoundary>: <Navigate to="/login" />} /> 
                    
                    {/* Rotas de CATEGORIAS (AGORA RESTRITAS a ADMIN/BIBLIOTECARIO) */}
                    <Route path="/categorias" element={user.loggedIn && (user.type === 'ADMIN' || user.type === 'BIBLIOTECARIO') ? <ErrorBoundary> <CategoriaList userType={user.type} /> </ErrorBoundary> : <Navigate to="/login" />} />
                    
                    {/* Rotas de Usuário (APENAS para ADMIN, exceto talvez criar-bibliotecario para Bibliotecário também) */}
                    <Route path="/usuarios" element={user.loggedIn && user.type === 'ADMIN' ? <ErrorBoundary><UsuarioList userType={user.type} /></ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/usuarios/novo" element={user.loggedIn && user.type === 'ADMIN' ? <ErrorBoundary><UsuarioForm userType={user.type} /></ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/usuarios/editar/:id" element={user.loggedIn && user.type === 'ADMIN' ? <ErrorBoundary><UsuarioForm userType={user.type} /></ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/usuarios/criar-bibliotecario" element={user.loggedIn && (user.type === 'ADMIN' || user.type === 'BIBLIOTECARIO') ? <ErrorBoundary><UsuarioForm userType={user.type} isCreationByBibliotecario={true} /></ErrorBoundary> : <Navigate to="/login" />} />
                    
                    {/* Rotas de Comentários (visível para todos logados, com ações condicionais) */}
                    <Route path="/comentarios" element={user.loggedIn ? <ErrorBoundary><ComentarioList userType={user.type} userId={user.id} /></ErrorBoundary> : <Navigate to="/login" />} />
                    <Route path="/comentarios/novo" element={user.loggedIn ? <ErrorBoundary><ComentarioForm userType={user.type} userId={user.id} /></ErrorBoundary> : <Navigate to="/login" />} />

                    {/* A rota padrão redireciona para /livros se logado, senão para /login */}
                    <Route path="*" element={<Navigate to={user.loggedIn ? "/livros" : "/login"} />} /> {/* Alterado para /livros */}
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