// server/controllers/apiControllerCategoria.js
const db = require('../config/db_sequelize');
const { Op } = require('sequelize');

module.exports = {
    // GET /api/categorias - Listar com filtros
    async getAll(req, res) {
        try {
            const { busca, status } = req.query; // Adicione outros filtros se precisar
            const whereClause = { [Op.and]: [] };

            if (busca) {
                whereClause[Op.and].push({
                    [Op.or]: [
                        { nome: { [Op.iLike]: `%${busca}%` } },
                        { tipo: { [Op.iLike]: `%${busca}%` } }
                    ]
                });
            }

            const categorias = await db.Categoria.findAll({ where: whereClause });
            res.status(200).json(categorias);
        } catch (err) {
            res.status(500).json({ error: 'Erro ao buscar categorias.' });
        }
    },

    // POST /api/categorias - Criar
    async create(req, res) {
        try {
            const novaCategoria = await db.Categoria.create(req.body);
            res.status(201).json(novaCategoria);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    // Implemente getById, update, e delete seguindo o padrão do apiControllerAutor
};