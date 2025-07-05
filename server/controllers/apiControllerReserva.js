// server/controllers/apiControllerReserva.js
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

            // CORREÇÃO APLICADA AQUI 👇
            if (dataInicio) {
                whereClause[Op.and].push({ data_reserva: { [Op.gte]: new Date(dataInicio) } });
            }
            if (dataFim) {
                whereClause[Op.and].push({ data_reserva: { [Op.lte]: new Date(new Date(dataFim).setHours(23, 59, 59)) } });
            }
            // FIM DA CORREÇÃO

            if (busca) {
                whereClause[Op.and].push({
                    [Op.or]: [
                        { '$Livro.titulo$': { [Op.iLike]: `%${busca}%` } },
                        { '$usuario.login$': { [Op.iLike]: `%${busca}%` } },
                        where(fn('CONCAT', col('usuario.nome'), ' ', col('usuario.sobrenome')), { [Op.iLike]: `%${busca}%` })
                    ]
                });
            }

            // Agora a busca é feita no modelo correto com a cláusula correta
            const reservas = await db.Reserva.findAll({
                where: whereClause,
                include: [
                    { model: db.Usuario, as: 'usuario' },
                    { model: db.Livro, as: 'Livro' }
                ],
                order: [['data_reserva', 'DESC']] // Ordenando pelo campo correto
            });

            res.status(200).json(reservas);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: "Erro ao buscar reservas." });
        }
    }
    // ... outras funções da API para Reservas
};