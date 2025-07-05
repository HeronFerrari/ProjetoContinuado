import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Alert, Form, FormControl, InputGroup, Row, Col } from 'react-bootstrap';
import api from '../api'; 

function LivroList({ userType }) {
    const [livros, setLivros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [autores, setAutores] = useState([]);

    //Estados para os filtros
    const [filtroTitulo, setFiltroTitulo] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroAutor, setFiltroAutor] = useState('');
    
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await api.get('/categorias');
                setCategorias(response.data);
            } catch (err) {
                console.error("Erro ao carregar categorias para filtro:", err);
                // Você pode definir um erro específico para o filtro de categorias se quiser
            }
        };
        fetchCategorias();
    }, []);
    
    useEffect(() => {
        const fetchAutores = async () => {
            try {
                const response = await api.get('/autores'); // Assumindo que você tem um endpoint para listar autores
                setAutores(response.data);
            } catch (err) {
                console.error("Erro ao carregar autores para filtro:", err);
            }
        };
        fetchAutores();
    }, []);

    useEffect(() => {
        const fetchLivros = async () => {
            setLoading(true);
            setError(''); 

            try {
                let url = '/livros';
                const params = new URLSearchParams(); // Para construir a query string

                if (filtroTitulo) {
                    params.append('titulo', filtroTitulo);
                }
                if (filtroStatus) {
                    params.append('status', filtroStatus);
                }
                if (filtroCategoria) {
                    params.append('id_categoria', filtroCategoria); // Passe o ID da categoria
                }
                if (filtroAutor) { 
                    params.append('id_autor', filtroAutor); // Passe o ID do autor
                }
                if (params.toString()) {
                    url += `?${params.toString()}`;
                }

                const response = await api.get(url);
                setLivros(response.data);
            } catch (err) {
                console.error("Erro ao carregar livros com filtros:", err);
                setError('Não foi possível carregar os livros com os filtros aplicados.');
            } finally {
                setLoading(false);
            }
        };
        // Re-executa a busca de livros sempre que um filtro muda
        fetchLivros();
    }, [filtroTitulo, filtroStatus, filtroCategoria, filtroAutor]);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este livro?')) {
            try {
                await api.delete(`/livros/${id}`);
                setLivros(livros.filter(livro => livro.id_livro !== id));
            } catch (err) {
                setError('Erro ao deletar livro. Verifique se ele não possui empréstimos ou reservas ativas.');
            }
        }
    };

    if (loading) return <p>Carregando livros...</p>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gerenciar Livros</h2>
                {(userType === 'ADMIN' || userType === 'BIBLIOTECARIO') && (
                    <Link to="/livros/novo" className="btn btn-success mb-3">Novo Livro</Link>
                )}
            </div>
            {/* Filtros */}
                <Form className="mb-4 p-3 border rounded bg-light">
                    <Row className="g-3"> {/* g-3 para espaçamento entre colunas */}
                        <Col md={4}>
                            <InputGroup>    
                                <FormControl
                                placeholder="Filtrar por título..."
                                value={filtroTitulo}
                                onChange={(e) => setFiltroTitulo(e.target.value)}
                            />
                        </InputGroup>
                    </Col>
                    <Col md={3}>
                        <Form.Select 
                            value={filtroStatus} 
                            onChange={(e) => setFiltroStatus(e.target.value)}
                        >
                            <option value="">Todos os Status</option>
                            <option value="DISPONIVEL">Disponível</option>
                            <option value="EMPRESTADO">Emprestado</option>
                            <option value="RESERVADO">Reservado</option>
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Select 
                            value={filtroCategoria} 
                            onChange={(e) => setFiltroCategoria(e.target.value)}
                        >
                            <option value="">Todas as Categorias</option>
                            {categorias.map(cat => (
                                <option key={cat.id_categoria} value={cat.id_categoria}>
                                    {cat.nome}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={2}> {/* NOVO: Coluna para o filtro de autor */}
                        <Form.Select 
                            value={filtroAutor} 
                            onChange={(e) => setFiltroAutor(e.target.value)}
                        >
                            <option value="">Todos os Autores</option>
                            {autores.map(autor => (
                                <option key={autor.id_autor} value={autor.id_autor}>
                                    {autor.nome}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>
            </Form>


            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Autor</th>
                        <th>Ano</th>
                        <th>Categoria</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {livros.map(livro => (
                        <tr key={livro.id_livro}>
                            <td>{livro.titulo}</td>
                            <td>{livro.Autores && livro.Autores.length > 0 
                                    ? livro.Autores.map(autor => autor.nome).join(', ') 
                                    : 'N/A'}</td>
                            <td>{livro.ano}</td>
                            <td>{livro.Categoria ? livro.Categoria.nome : 'N/A'}</td>
                            <td>{livro.status === 'DISPONIVEL' && <span className="badge bg-success">Disponível</span>}
                                {livro.status === 'RESERVADO' && <span className="badge bg-info">Reservado</span>}
                                {livro.status === 'EMPRESTADO' && <span className="badge bg-secondary">Emprestado</span>}
                                </td>
                            <td>
                                {(userType === 'ADMIN' || userType === 'BIBLIOTECARIO') ? (
                                    <>
                                        <Link to={`/livros/editar/${livro.id_livro}`} className="btn btn-primary btn-sm">Editar</Link>
                                        <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(livro.id_livro)}>
                                            Deletar
                                        </Button>
                                    </>
                                ) : ( 
                                    livro.status === 'DISPONIVEL' && (
                                        <Button variant="success" size="sm">Emprestar</Button>
                                    )
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default LivroList;