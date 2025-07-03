import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Alert } from 'react-bootstrap';
import api from '../api'; // Importa nossa instância pré-configurada do axios

function AutorList() {
    // STATE: Usamos useState para guardar a lista de autores que virá da API
    const [autores, setAutores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // EFEITO: useEffect para buscar os dados na API quando a tela carregar
    useEffect(() => {
        const fetchAutores = async () => {
            try {
                const response = await api.get('/autores'); // Usa nossa instância 'api'
                setAutores(response.data); // Guarda os dados no nosso state
            } catch (err) {
                setError('Não foi possível carregar os autores. Sua sessão pode ter expirado. Tente fazer o login novamente.');
            } finally {
                setLoading(false);
            }
        };

        fetchAutores();
    }, []);

    // EVENTO: Função para lidar com o clique no botão de deletar
    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este autor?')) {
            try {
                await api.delete(`/autores/${id}`);
                setAutores(autores.filter(autor => autor.id_autor !== id));
            } catch (err) {
                setError('Erro ao deletar autor.');
            }
        }
    };
    
    // RENDERIZAÇÃO CONDICIONAL: Mostra "Carregando..." enquanto busca os dados
    if (loading) return <p>Carregando autores...</p>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    // RENDERIZAÇÃO DE LISTA: Usa .map para transformar o array de dados em linhas da tabela
    return (
        <div>
            <h2>Gerenciar Autores</h2>
            <Link to="/autores/novo" className="btn btn-success mb-3">Novo Autor</Link>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {autores.map(autor => (
                        <tr key={autor.id_autor}>
                            <td>{autor.id_autor}</td>
                            <td>{autor.nome}</td>
                            <td>
                                <Link to={`/autores/editar/${autor.id_autor}`} className="btn btn-primary btn-sm">Editar</Link>
                                <Button variant="danger" size="sm" className="ms-2" onClick={() => handleDelete(autor.id_autor)}>
                                    Deletar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default AutorList;