import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import api from '../api';

function ReservaList({ userType, userId }) {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Estados para filtros de reserva
    const [busca, setBusca] = useState('');
    const [statusFiltro, setStatusFiltro] = useState(''); // Ex: ATIVA, CONCLUIDA, CANCELADA
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const fetchReservas = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            let url = '/reservas';
            const params = new URLSearchParams();

            // Lógica de Filtro por Usuário Logado (para LEITORES)
            if (userType === 'LEITOR' && userId) { 
                params.append('id_usuario', userId); 
            }

            // Adiciona outros filtros para reservas
            if (busca) {
                params.append('busca', busca); // Backend precisará filtrar por livro/usuário
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
            setReservas(response.data);
        } catch (err) {
            console.error("Erro ao carregar reservas:", err);
            setError('Não foi possível carregar as reservas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservas();
    }, [userType, userId, busca, statusFiltro, dataInicio, dataFim]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReservas();
    };

    const handleCancelarReserva = async (idReserva) => {
        if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
            try {
                // Endpoint para cancelar reserva (você precisará criar/ajustar isso no backend)
                await api.put(`/reservas/${idReserva}/cancelar`); 
                setSuccessMessage('Reserva cancelada com sucesso!');
                setReservas(reservas.map(res => 
                    res.id_reserva === idReserva ? { ...res, status: 'CANCELADA' } : res
                ));
            } catch (err) {
                console.error("Erro ao cancelar reserva:", err);
                setError(err.response?.data?.error || 'Não foi possível cancelar a reserva.');
            }
        }
    };

    const formatarData = (data) => {
        if (!data) return 'N/A';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    if (loading) return <p>Carregando reservas...</p>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div>
            <h2>Gerenciar Reservas</h2>
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
                            <option value="ATIVA">Ativa</option>
                            <option value="AGUARDANDO_RETIRADA">Aguardando Retirada</option>
                            <option value="ATENDIDA">Atendida</option>
                            <option value="CANCELADA">Cancelada</option>
                            <option value="EXPIRADA">Expirada</option>
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
                        <th>Data Reserva</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {reservas.map(res => (
                        <tr key={res.id_reserva}>
                            <td>{res.Livro?.titulo || 'N/A'}</td>
                            <td>{res.Usuario?.nome || 'N/A'}</td>
                            <td>{formatarData(res.data_reserva)}</td>
                            <td>
                                {res.status === 'ATIVA' && <Badge bg="primary">Ativa</Badge>}
                                {res.status === 'AGUARDANDO_RETIRADA' && <Badge bg="info">Aguardando Retirada</Badge>}
                                {res.status === 'ATENDIDA' && <Badge bg="success">Atendida</Badge>}
                                {res.status === 'CANCELADA' && <Badge bg="danger">Cancelada</Badge>}
                                {res.status === 'EXPIRADA' && <Badge bg="secondary">Expirada</Badge>}
                                {res.status && !['ATIVA', 'AGUARDANDO_RETIRADA', 'ATENDIDA', 'CANCELADA', 'EXPIRADA'].includes(res.status) && <Badge bg="dark">{res.status}</Badge>}
                            </td>
                            <td>
                                {(userType === 'ADMIN' || userType === 'BIBLIOTECARIO') && (res.status === 'ATIVA' || res.status === 'AGUARDANDO_RETIRADA') && (
                                    <>
                                    <Button 
                                            variant="success" 
                                            size="sm" 
                                            onClick={() => handleConcluirReserva(res.id_reserva)} 
                                            className="me-2"
                                        >
                                            Emprestar (Concluir)
                                        </Button>
                                    </>
                                )}
                                {(res.status === 'ATIVA' || res.status === 'AGUARDANDO_RETIRADA') && (userType === 'LEITOR' && res.id_usuario === userId || userType === 'ADMIN' || userType === 'BIBLIOTECARIO') && (
                                     <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => handleCancelarReserva(res.id_reserva)}
                                    >
                                        Cancelar
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

export default ReservaList;