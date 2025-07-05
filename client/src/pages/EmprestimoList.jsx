import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import api from '../api'; // Nossa instância axios autenticada

// Receba userId e userType como props
function EmprestimoList({ userType, userId }) { 
    const [emprestimos, setEmprestimos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState(''); 

    const [busca, setBusca] = useState('');
    const [statusFiltro, setStatusFiltro] = useState(''); 
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    
    const fetchEmprestimos = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            let url = '/emprestimos';
            const params = new URLSearchParams();

            if (userType === 'LEITOR' && userId) { 
                params.append('id_usuario', userId); 
            }

            if (busca) {
                params.append('busca', busca);
            }
            if (statusFiltro) {
                params.append('status', statusFiltro);
            }
            if (dataInicio) {
                params.append('dataInicio', dataInicio);
            }
            if (dataFim) {
                params.append('dataFim', dataFim);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await api.get(url);
            setEmprestimos(response.data);
        } catch (err) {
            console.error("Erro ao carregar empréstimos:", err);
            setError('Não foi possível carregar os empréstimos. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmprestimos();
    }, [userType, userId, busca, statusFiltro, dataInicio, dataFim]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEmprestimos();
    };

    const handleRegistrarDevolucao = async (idEmprestimo) => {
        if (window.confirm('Tem certeza que deseja registrar a devolução deste empréstimo?')) {
            try {
                await api.put(`/emprestimos/${idEmprestimo}/devolver`); 
                setSuccessMessage('Devolução registrada com sucesso!');
                // Re-fetch para ter certeza que os dados estão atualizados, ou atualizar o estado local
                fetchEmprestimos(); 
            } catch (err) {
                console.error("Erro ao registrar devolução:", err);
                setError(err.response?.data?.error || 'Não foi possível registrar a devolução.');
            }
        }
    };

    const formatarData = (data) => {
        if (!data) return 'N/A';
        return new Date(data).toLocaleDateString('pt-BR');
    }

    if (loading) return <p>Carregando empréstimos...</p>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div>
            <h2>Gerenciar Empréstimos</h2>
            
            {successMessage && <Alert variant="success">{successMessage}</Alert>}

            <Form onSubmit={handleSearch} className="mb-4 card card-body">
                <Row className="align-items-end g-3">
                    <Col md={4}><Form.Group>
                        <Form.Label>Buscar por Livro/Usuário</Form.Label>
                        <Form.Control type="text" value={busca} onChange={e => setBusca(e.target.value)} />
                    </Form.Group></Col>
                    <Col md={2}><Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="ATIVO">Ativo</option>
                            <option value="FINALIZADO">Finalizado</option>
                            <option value="ATRASADO">Atrasado</option>
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
            
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Livro</th>
                        <th>Usuário</th>
                        <th>Data Empréstimo</th>
                        <th>Devolução Prevista</th>
                        <th>Data Devolução Real</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {emprestimos.map(emp => (
                        <tr key={emp.id_emprestimo}>
                            <td>{emp.Livro?.titulo || 'N/A'}</td>
                            <td>{emp.usuario?.nome || 'N/A'}</td> 
                            <td>{formatarData(emp.data_emprestimo)}</td>
                            <td>{formatarData(emp.data_devolucao_prevista)}</td>
                            <td>{emp.data_devolucao_real ? formatarData(emp.data_devolucao_real) : 'PENDENTE'}</td>
                            <td>
                                {emp.status === 'PENDENTE' && <Badge bg="primary">Ativo</Badge>}
                                {emp.status === 'DEVOLVIDO' && <Badge bg="success">Finalizado</Badge>}
                                {emp.status === 'ATRASADO' && <Badge bg="danger">Atrasado</Badge>}
                                {emp.status && !['PENDENTE', 'DEVOLVIDO', 'ATRASADO'].includes(emp.status) && <Badge bg="secondary">{emp.status}</Badge>}
                            </td>
                            <td>
                                {/* Botão Registrar Devolução */}
                                {(userType === 'ADMIN' || userType === 'BIBLIOTECARIO') && emp.status === 'PENDENTE' && (
                                    <Button 
                                        variant="success" 
                                        size="sm" 
                                        onClick={() => handleRegistrarDevolucao(emp.id_emprestimo)}
                                    >
                                        Registrar Devolução
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default EmprestimoList;