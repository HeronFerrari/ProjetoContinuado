// server/controllers/apiControllerReserva.js

const db = require('../config/db_sequelize');
const { Op } = require('sequelize');

module.exports = {
    async getAll(req, res) {
        try {
            const { id_usuario, busca, status, dataInicio, dataFim } = req.query;
            const whereCondition = {};
            const includeOptions = [];
            // 1. Filtro por usuário logado (se for LEITOR)
            if (id_usuario) {
                whereCondition.id_usuario = id_usuario;
            }

            // 2. Filtro por Status
            if (status) {
                whereCondition.status = status;
            }

            // 3. Filtro por Período de Data
            if (dataInicio || dataFim) {
                whereCondition.data_reserva = {};
                if (dataInicio) {
                    whereCondition.data_reserva[Op.gte] = new Date(dataInicio);
                }
                if (dataFim) {
                    const dataFimObj = new Date(dataFim);
                    dataFimObj.setHours(23, 59, 59, 999); 
                    whereCondition.data_reserva[Op.lte] = dataFimObj;
                }
            }

            includeOptions.push({
                model: db.Livro, 
                as: 'Livro',
                attributes: ['id_livro', 'titulo', 'status'], // Incluir status do livro para lógica de reserva
                required: false 
            });
            includeOptions.push({
                model: db.Usuario, 
                as: 'usuario', 
                attributes: ['id', 'nome', 'sobrenome'],
                required: false 
            });


            // 4. Filtro por Busca (Livro ou Usuário)
            if (busca) {
                whereCondition[Op.or] = [
                    { '$Livro.titulo$': { [Op.iLike]: `%${busca}%` } },
                    { '$usuario.nome$': { [Op.iLike]: `%${busca}%` } },
                    { '$usuario.sobrenome$': { [Op.iLike]: `%${busca}%` } }
                ];
                includeOptions[0].required = true; 
                includeOptions[1].required = true; 
            }

            const reservas = await db.Reserva.findAll({
                where: whereCondition,
                include: includeOptions,
                order: [['data_reserva', 'DESC']]
            });
            res.json(reservas);
        } catch (error) {
            console.error("Erro ao buscar reservas na API:", error);
            res.status(500).json({ error: 'Erro interno ao carregar reservas.' });
        }
    },

    // NOVO: Método para cancelar reserva
    async cancelarReserva(req, res) {
        try {
            const { id } = req.params;
            const reserva = await db.Reserva.findByPk(id);

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva não encontrada.' });
            }

            if (req.usuarioToken.tipo !== 'ADMIN' && req.usuarioToken.tipo !== 'BIBLIOTECARIO' && req.usuarioToken.id !== reserva.id_usuario) {
                 return res.status(403).json({ error: 'Acesso negado. Você só pode cancelar suas próprias reservas.' });
            }

            const [updated] = await db.Reserva.update(
                { status: 'CANCELADA' },
                { where: { id_reserva: id, status: { [Op.in]: ['ATIVA', 'AGUARDANDO_RETIRADA'] } } }
            );

            if (updated) {
                // Opcional: Se o livro estava REVERVADO (status do livro), pode voltar para DISPONIVEL
                // se não houver outras reservas ativas para ele. Lógica mais complexa aqui.
                return res.status(200).json({ message: 'Reserva cancelada com sucesso.' });
            }
            return res.status(400).json({ error: 'Não foi possível cancelar a reserva. Verifique o status.' });
        } catch (error) {
            console.error("Erro no backend ao cancelar reserva:", error);
            res.status(500).json({ error: 'Erro interno ao cancelar reserva.' });
        }
    },
      async concluirReserva(req, res) {
        try {
            const { id } = req.params;
            // Apenas ADMIN/BIBLIOTECARIO podem concluir reserva (emprestar o livro)
            if (req.usuarioToken.tipo !== 'ADMIN' && req.usuarioToken.tipo !== 'BIBLIOTECARIO') {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores e bibliotecários podem concluir reservas.' });
            }

            const reserva = await db.Reserva.findByPk(id, {
                include: [{ model: db.Livro, as: 'Livro' }] // Inclui o Livro para obter o id_livro
            });

            if (!reserva) {
                return res.status(404).json({ error: 'Reserva não encontrada.' });
            }
            if (reserva.status !== 'AGUARDANDO_RETIRADA' && reserva.status !== 'ATIVA') {
                 return res.status(400).json({ error: 'Reserva não está no status ATIVA ou AGUARDANDO_RETIRADA para ser concluída.' });
            }

            // 1. Cria um novo empréstimo
            const novoEmprestimo = await db.Emprestimo.create({
                id_livro: reserva.id_livro,
                id_usuario: reserva.id_usuario,
                data_emprestimo: new Date(),
                data_devolucao_prevista: new Date(new Date().setDate(new Date().getDate() + 15)), // Ex: 15 dias de empréstimo
                status: 'PENDENTE' // Status inicial de um novo empréstimo
            });

            // 2. Atualiza o status da reserva para CONCLUIDA
            await reserva.update({ status: 'ATENDIDA' });

            // 3. Atualiza o status do livro para EMPRESTADO
            if (reserva.Livro) { // Verifica se o livro foi incluído
                await db.Livro.update({ status: 'EMPRESTADO' }, { where: { id_livro: reserva.id_livro } });
            }
            
            res.status(200).json({ message: 'Reserva concluída e empréstimo criado com sucesso!', emprestimo: novoEmprestimo });
        } catch (error) {
            console.error("Erro no backend ao concluir reserva:", error);
            res.status(500).json({ error: 'Erro interno ao concluir reserva.' });
        }
    }
};