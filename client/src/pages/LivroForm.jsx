import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import api from '../api';

function LivroForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    // State para os campos do formulário do livro
    const [titulo, setTitulo] = useState('');
    const [ano, setAno] = useState('');
    const [status, setStatus] = useState('DISPONIVEL');
    const [idCategoria, setIdCategoria] = useState('');
    const [idAutores, setIdAutores] = useState([]); // Array para múltiplos autores

    // State para guardar as listas que vêm da API
    const [categorias, setCategorias] = useState([]);
    const [autores, setAutores] = useState([]);

    const [error, setError] = useState('');

    // Efeito para buscar as listas de categorias e autores
    useEffect(() => {
        // Busca as categorias
        api.get('/categorias')
            .then(response => setCategorias(response.data))
            .catch(err => setError('Erro ao carregar categorias.'));

        // Busca os autores
        api.get('/autores')
            .then(response => setAutores(response.data))
            .catch(err => setError('Erro ao carregar autores.'));
    }, []);

    // Efeito para buscar os dados do livro, se for uma edição
    useEffect(() => {
        if (id) {
            api.get(`/livros/${id}`)
                .then(response => {
                    const livro = response.data;
                    setTitulo(livro.titulo);
                    setAno(livro.ano);
                    setStatus(livro.status);
                    setIdCategoria(livro.id_categoria);
                    // Pega os IDs dos autores associados e coloca no estado
                    setIdAutores(livro.Autores.map(autor => autor.id_autor));
                })
                .catch(err => setError('Erro ao carregar dados do livro.'));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const livroData = { titulo, ano, status, id_categoria: idCategoria, id_autores: idAutores };

        try {
            if (id) {
                await api.put(`/livros/${id}`, livroData);
            } else {
                await api.post('/livros', livroData);
            }
            navigate('/livros');
        } catch (err) {
            setError('Erro ao salvar livro.');
            console.error(err);
        }
    };

    return (
        <Container className="mt-5">
            <Card>
                <Card.Body>
                    <Card.Title>{id ? 'Editar Livro' : 'Cadastrar Novo Livro'}</Card.Title>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Título</Form.Label>
                            <Form.Control type="text" value={titulo} onChange={e => setTitulo(e.target.value)} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Ano de Publicação</Form.Label>
                            <Form.Control type="number" value={ano} onChange={e => setAno(e.target.value)} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Categoria</Form.Label>
                            <Form.Select value={idCategoria} onChange={e => setIdCategoria(e.target.value)} required>
                                <option value="">Selecione uma categoria</option>
                                {categorias.map(cat => (
                                    <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nome}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Autor(es)</Form.Label>
                            <Form.Select multiple value={idAutores} onChange={e => setIdAutores(Array.from(e.target.selectedOptions, option => option.value))} required>
                                {autores.map(autor => (
                                    <option key={autor.id_autor} value={autor.id_autor}>{autor.nome}</option>
                                ))}
                            </Form.Select>
                            <Form.Text>Segure Ctrl (ou Cmd) para selecionar múltiplos autores.</Form.Text>
                        </Form.Group>

                        <Button variant="primary" type="submit">Salvar</Button>
                        <Button variant="secondary" className="ms-2" onClick={() => navigate('/livros')}>Cancelar</Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default LivroForm;