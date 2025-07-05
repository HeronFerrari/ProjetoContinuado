import React, { useState } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import api from '../api';
import {jwtDecode} from 'jwt-decode';

function Login({ onLogin }) {
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', { login, senha });
            const token = response.data.token;
            
            // Decodifique o token para obter o tipo de usuário
            const decodedToken = jwtDecode(token);
            const userType = decodedToken.tipo; // Assumindo que 'tipo' está no payload do JWT

            onLogin(token, userType); // Passe o token E o tipo de usuário para o App.jsx
        } catch (err) {
            console.error("Erro no login:", err);
            setError(err.response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Login do Sistema</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="formLogin">
                            <Form.Label>Login</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={login} 
                                onChange={(e) => setLogin(e.target.value)} 
                                required 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formSenha">
                            <Form.Label>Senha</Form.Label>
                            <Form.Control 
                                type="password" 
                                value={senha} 
                                onChange={(e) => setSenha(e.target.value)} 
                                required 
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="w-100">
                            Entrar
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default Login;