const db = require('../config/db_sequelize'); // Seus modelos do Sequelize
const jwt = require('jsonwebtoken'); // Se precisar gerar tokens aqui
const { Op } = require('sequelize');

module.exports = {
    async getAll(req, res) {
        try {
           const { titulo, status, id_categoria, id_autor } = req.query;
            console.log('Usuário autenticado via JWT:', req.usuarioToken); 
             const whereCondition = {};
            if (titulo) {
                // Use Op.iLike para busca case-insensitive (PostgreSQL)
                // Se for MySQL/SQLite, use Op.like
                whereCondition.titulo = { [Op.iLike]: `%${titulo}%` }; 
            }
            if (status) {
                whereCondition.status = status;
            }
            if (id_categoria) {
                whereCondition.id_categoria = id_categoria; // Filtra pelo ID da categoria
            }

            const includeOptions = [
                { model: db.Categoria, as: 'Categoria' },
                { model: db.Autor, as: 'Autores', through: { attributes: [] } } // CORRIGIDO: Alias deve ser 'Autores'
                                                                                // through: { attributes: [] } evita carregar a tabela intermediária
            ];
            if (id_autor) {
                // Para filtrar livros que possuem um autor específico em uma relação N:N
                includeOptions[1].where = { id_autor: id_autor };
                includeOptions[1].required = true; // Use required: true para um INNER JOIN (apenas livros com esse autor)
            }

            const livros = await db.Livro.findAll({
                where: Object.keys(whereCondition).length > 0 ? whereCondition : {}, 
                include: includeOptions, // Usa as opções de include construídas
                order: [['titulo', 'ASC']]
            });
            res.json(livros); 
        } catch (error) {
            console.error("Erro ao buscar livros na API com filtros:", error);
            res.status(500).json({ error: 'Erro interno ao carregar livros com filtros.' });
        }
    },

    async getById(req, res) {
        try {
            const { id } = req.params;
            const livro = await db.Livro.findByPk(id, {
                include: [{ model: db.Categoria, as: 'Categoria' }]
            });
            if (!livro) {
                return res.status(404).json({ error: 'Livro não encontrado.' });
            }
            res.json(livro);
        } catch (error) {
            console.error("Erro ao buscar livro por ID na API:", error);
            res.status(500).json({ error: 'Erro interno ao buscar livro.' });
        }
    },

    async create(req, res) {
        try {
            const novoLivro = await db.Livro.create(req.body);
            res.status(201).json(novoLivro);
        } catch (error) {
            console.error("Erro ao criar livro na API:", error);
            res.status(400).json({ error: 'Erro ao criar livro.', details: error.message });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const [updated] = await db.Livro.update(req.body, {
                where: { id_livro: id } // Use id_livro se for sua PK
            });
            if (updated) {
                const updatedLivro = await db.Livro.findByPk(id);
                return res.json(updatedLivro);
            }
            throw new Error('Livro não encontrado para atualização.');
        } catch (error) {
            console.error("Erro ao atualizar livro na API:", error);
            res.status(404).json({ error: error.message || 'Livro não encontrado para atualização.' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await db.Livro.destroy({
                where: { id_livro: id } // Use id_livro se for sua PK
            });
            if (deleted) {
                return res.status(204).send(); // 204 No Content para deleção bem-sucedida
            }
            throw new Error('Livro não encontrado para exclusão.');
        } catch (error) {
            console.error("Erro ao deletar livro na API:", error);
            res.status(404).json({ error: error.message || 'Livro não encontrado para exclusão.' });
        }
    }
};