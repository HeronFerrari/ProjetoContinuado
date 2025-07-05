import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import api from '../api'; // Nossa instância axios autenticada

function AutorForm() {
    // Hooks
    const { id } = useParams(); // Pega o 'id' da URL, se existir
    const navigate = useNavigate(); // Hook para redirecionamento

    // State
    const [nome, setNome] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // useEffect para buscar os dados do autor caso seja uma edição
    useEffect(() => {
        // Se existe um 'id' na URL, estamos no modo de edição
        if (id) {
            const fetchAutor = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/autores/${id}`);
                    setNome(response.data.nome); // Preenche o campo com o nome do autor
                } catch (err) {
                    setError('Não foi possível carregar os dados do autor.');
                } finally {
                    setLoading(false);
                }
            };
            fetchAutor();
        }
    }, [id]); // Este efeito roda sempre que o 'id' mudar

    // Função para lidar com o envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const autorData = { nome };

        try {
            if (id) {
                // Se temos um ID, é uma atualização (PUT)
                await api.put(`/autores/${id}`, autorData);
            } else {
                // Se não temos ID, é uma criação (POST)
                await api.post('/autores', autorData);
            }
            // Após o sucesso, volta para a lista de autores
            navigate('/autores');
        } catch (err) {
            setError('Erro ao salvar o autor. Verifique os dados e tente novamente.');
            console.error(err);
        }
    };

    if (loading) {
        return <p>Carregando formulário...</p>;
    }

    return (
        <Container className="mt-5">
            <Card>
                <Card.Body>
                    {/* O título da página muda se for edição ou criação */}
                    <Card.Title>{id ? 'Editar Autor' : 'Cadastrar Novo Autor'}</Card.Title>
                    
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nome do Autor</Form.Label>
                            <Form.Control 
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Digite o nome do autor"
                                required 
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {id ? 'Salvar Alterações' : 'Cadastrar Autor'}
                        </Button>
                        <Button variant="secondary" className="ms-2" onClick={() => navigate('/autores')}>
                            Cancelar
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default AutorForm;