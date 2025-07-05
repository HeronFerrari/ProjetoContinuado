import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import api from '../api'; // Nossa instância axios autenticada

function EmprestimoList() {
    // Estado para a lista principal
    const [emprestimos, setEmprestimos] = useState([]);
    
    // Estados para cada campo do formulário de filtro
    const [busca, setBusca] = useState('');
    const [status, setStatus] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    
    const [error, setError] = useState('');

    const fetchEmprestimos = async () => {
        try {
            // Monta os parâmetros da URL dinamicamente a partir dos estados
            const params = new URLSearchParams();
            if (busca) params.append('busca', busca);
            if (status) params.append('status', status);
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            
            // Faz a chamada à API com os parâmetros: ex: /api/emprestimos?busca=Ana&status=PENDENTE
            const response = await api.get(`/emprestimos?${params.toString()}`);
            setEmprestimos(response.data);
        } catch (err) {
            setError('Não foi possível carregar os empréstimos.');
        }
    };

    // Busca os dados iniciais (sem filtro) quando a página carrega
    useEffect(() => {
        fetchEmprestimos();
    }, []);

    // Função chamada quando o formulário de filtro é enviado
    const handleSearch = (e) => {
        e.preventDefault();
        fetchEmprestimos(); // Executa a busca com os filtros atuais do estado
    };

    const formatarData = (data) => {
        if (!data) return 'N/A';
        return new Date(data).toLocaleDateString('pt-BR');
    }

    return (
        <div>
            <h2>Gerenciar Empréstimos</h2>
            
            <Form onSubmit={handleSearch} className="mb-4 card card-body">
                <Row className="align-items-end g-3">
                    <Col md={4}><Form.Group>
                        <Form.Label>Buscar por Livro/Usuário</Form.Label>
                        <Form.Control type="text" value={busca} onChange={e => setBusca(e.target.value)} />
                    </Form.Group></Col>
                    <Col md={2}><Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="PENDENTE">Pendente</option>
                            <option value="DEVOLVIDO">Devolvido</option>
                        </Form.Select>
                    </Form.Group></Col>
                    <Col md={2}><Form.Group>
                        <Form.Label>Data Início</Form.Label>
                        <Form.Control type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                    </Form.Group></Col>
                    <Col md={2}><Form.Group>
                        <Form.Label>Data Fim</Form.Label>
                        <Form.Control type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                    </Form.Group></Col>
                    <Col md={2}><Button type="submit" className="w-100">Buscar</Button></Col>
                </Row>
            </Form>

            {error && <Alert variant="danger">{error}</Alert>}
            
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Livro</th>
                        <th>Usuário</th>
                        <th>Data Empréstimo</th>
                        <th>Devolução Prevista</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {emprestimos.map(emp => (
                        <tr key={emp.id_emprestimo}>
                            <td>{emp.Livro?.titulo || 'N/A'}</td>
                            <td>{emp.usuario?.nome || 'N/A'}</td>
                            <td>{formatarData(emp.data_emprestimo)}</td>
                            <td>{formatarData(emp.data_devolucao_prevista)}</td>
                            <td><Badge bg={emp.status === 'PENDENTE' ? 'warning' : 'info'}>{emp.status}</Badge></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default EmprestimoList;