// server/controllers/apiControllerEmprestimo.js
const db = require('../config/db_sequelize');
const { Op, fn, col, where } = require('sequelize');

module.exports = {
    async getAll(req, res) {
        try {
            const { busca, dataInicio, dataFim, status } = req.query;
            const whereClause = { [Op.and]: [] };

            if (status) {
                whereClause[Op.and].push({ status: status });
            }
            if (dataInicio) {
                whereClause[Op.and].push({ data_emprestimo: { [Op.gte]: new Date(dataInicio) } });
            }
            if (dataFim) {
                whereClause[Op.and].push({ data_emprestimo: { [Op.lte]: new Date(new Date(dataFim).setHours(23, 59, 59)) } });
            }
            if (busca) {
                whereClause[Op.and].push({
                    [Op.or]: [
                        { '$Livro.titulo$': { [Op.iLike]: `%${busca}%` } },
                        { '$usuario.login$': { [Op.iLike]: `%${busca}%` } },
                        where(fn('CONCAT', col('usuario.nome'), ' ', col('usuario.sobrenome')), { [Op.iLike]: `%${busca}%` })
                    ]
                });
            }

            const emprestimos = await db.Emprestimo.findAll({
                where: whereClause,
                include: [
                    { model: db.Usuario, as: 'usuario' },
                    { model: db.Livro, as: 'Livro' }
                ],
                order: [['data_emprestimo', 'DESC']]
            });
            res.status(200).json(emprestimos);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Erro ao buscar empréstimos." });
        }
    }
    // Adicione aqui outras funções da API para Empréstimos (getById, delete, etc.) se necessário
};