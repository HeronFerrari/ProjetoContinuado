// client/src/pages/CategoriaList.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import api from '../api';

function CategoriaList() {
    const [categorias, setCategorias] = useState([]);
    const [error, setError] = useState('');
    
    // Estados para controlar os campos do formulário de filtro
    const [busca, setBusca] = useState('');

    // Função para buscar os dados na API, agora com os filtros
    const fetchCategorias = async () => {
        try {
            // Monta os parâmetros da URL dinamicamente
            const params = new URLSearchParams();
            if (busca) {
                params.append('busca', busca);
            }
            
            // Faz a chamada à API com os parâmetros: ex: /api/categorias?busca=Aventura
            const response = await api.get(`/categorias?${params.toString()}`);
            setCategorias(response.data);
        } catch (err) {
            setError('Não foi possível carregar as categorias.');
        }
    };

    // Busca os dados iniciais quando a página carrega
    useEffect(() => {
        fetchCategorias();
    }, []);

    // Função chamada quando o formulário de filtro é enviado
    const handleSearch = (e) => {
        e.preventDefault();
        fetchCategorias(); // Executa a busca com os filtros atuais
    };

    return (
        <div>
            <h2>Gerenciar Categorias</h2>
            
            {/* INÍCIO DO FORMULÁRIO DE FILTRO */}
            <Form onSubmit={handleSearch} className="mb-4 card card-body">
                <Row className="align-items-end">
                    <Col md={8}>
                        <Form.Group>
                            <Form.Label>Buscar por Nome ou Tipo</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Digite para buscar..."
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Button type="submit" className="w-100">Buscar</Button>
                    </Col>
                </Row>
            </Form>
            {/* FIM DO FORMULÁRIO DE FILTRO */}

            {error && <Alert variant="danger">{error}</Alert>}
            
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map(cat => (
                        <tr key={cat.id_categoria}>
                            <td>{cat.id_categoria}</td>
                            <td>{cat.nome}</td>
                            <td>{cat.tipo}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default CategoriaList;