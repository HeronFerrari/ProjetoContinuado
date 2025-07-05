import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import api from '../api'; // Nossa instância axios autenticada

function ReservaList() {
    // Estado para a lista de RESERVAS
    const [reservas, setReservas] = useState([]);
    
    // Estados para os filtros
    const [busca, setBusca] = useState('');
    const [status, setStatus] = useState('');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    
    const [error, setError] = useState('');

    const fetchReservas = async () => {
        try {
            const params = new URLSearchParams();
            if (busca) params.append('busca', busca);
            if (status) params.append('status', status);
            if (dataInicio) params.append('dataInicio', dataInicio);
            if (dataFim) params.append('dataFim', dataFim);
            
            // CORREÇÃO: Chama a API de /reservas
            const response = await api.get(`/reservas?${params.toString()}`);
            setReservas(response.data);
        } catch (err) {
            setError('Não foi possível carregar as reservas.');
        }
    };

    useEffect(() => {
        fetchReservas();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchReservas();
    };

    const formatarData = (data) => {
        if (!data) return 'N/A';
        return new Date(data).toLocaleDateString('pt-BR');
    }

    // Função para dar uma cor para cada status de reserva
    const getStatusVariant = (status) => {
        switch (status) {
            case 'ATIVA': return 'primary';
            case 'AGUARDANDO_RETIRADA': return 'success';
            case 'ATENDIDA': return 'info';
            case 'CANCELADA': return 'secondary';
            case 'EXPIRADA': return 'danger';
            default: return 'dark';
        }
    }

    return (
        <div>
            <h2>Gerenciar Reservas</h2>
            
            <Form onSubmit={handleSearch} className="mb-4 card card-body">
                <Row className="align-items-end g-3">
                    <Col md={4}><Form.Group>
                        <Form.Label>Buscar por Livro/Usuário</Form.Label>
                        <Form.Control type="text" value={busca} onChange={e => setBusca(e.target.value)} />
                    </Form.Group></Col>
                    <Col md={3}><Form.Group>
                        <Form.Label>Status</Form.Label>
                        {/* CORREÇÃO: Opções de status para RESERVAS */}
                        <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="ATIVA">Na Fila</option>
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
                    <Col md={1}><Button type="submit" className="w-100">Buscar</Button></Col>
                </Row>
            </Form>

            {error && <Alert variant="danger">{error}</Alert>}
            
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Livro</th>
                        <th>Usuário</th>
                        <th>Data da Reserva</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {/* CORREÇÃO: Loop sobre 'reservas' e usa 'id_reserva' como key */}
                    {reservas.map(reserva => (
                        <tr key={reserva.id_reserva}>
                            <td>{reserva.Livro?.titulo || 'N/A'}</td>
                            <td>{reserva.usuario?.nome || 'N/A'}</td>
                            <td>{formatarData(reserva.data_reserva)}</td>
                            <td>
                                <Badge bg={getStatusVariant(reserva.status)}>
                                    {reserva.status.replace('_', ' ')}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default ReservaList;