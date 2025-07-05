// server/controllers/apiControllerEmprestimo.js
const db = require('../config/db_sequelize');
const { Op, fn, col, where } = require('sequelize');

module.exports = {
    async getAll(req, res) {
        try {
            const { id_usuario, busca, dataInicio, dataFim, status } = req.query;
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
                whereCondition.data_emprestimo = {};
                if (dataInicio) {
                    whereCondition.data_emprestimo[Op.gte] = new Date(dataInicio);
                }
                if (dataFim) {
                    // Adiciona 23:59:59 para incluir todo o dia final
                    const dataFimObj = new Date(dataFim);
                    dataFimObj.setHours(23, 59, 59, 999); 
                    whereCondition.data_emprestimo[Op.lte] = dataFimObj;
                }
            }
            
            includeOptions.push({
                model: db.Livro, 
                as: 'Livro', // <--- Verifique se é 'Livro' ou 'livro' em suas associações!
                             // Pelo seu código de front, você usa emp.Livro?.titulo, então 'Livro' (maiúsculo) parece correto.
                attributes: ['id_livro', 'titulo'], // Inclua apenas o necessário
                required: false // LEFT OUTER JOIN por padrão, a menos que haja filtro na busca
            });
            includeOptions.push({
                model: db.Usuario, 
                as: 'usuario', // <--- CORREÇÃO: Alias agora é 'usuario' (minúsculo)!
                attributes: ['id', 'nome', 'sobrenome'], // Inclua apenas o necessário
                required: false // LEFT OUTER JOIN por padrão
            });


            // 4. Filtro por Busca (Livro ou Usuário) - Isso exigirá JOINs
            if (busca) {
                // Para buscar em campos de relações usando OR, precisamos de uma sintaxe específica.
                // Isso força um INNER JOIN nos modelos incluídos para que eles possam ser filtrados.
                whereCondition[Op.or] = [
                    { '$Livro.titulo$': { [Op.iLike]: `%${busca}%` } },
                    { '$usuario.nome$': { [Op.iLike]: `%${busca}%` } }, // Use 'usuario.nome' para o alias minúsculo
                    { '$usuario.sobrenome$': { [Op.iLike]: `%${busca}%` } }
                ];
                includeOptions[0].required = true; // Livro
                includeOptions[1].required = true; // Usuario
            }

            const emprestimos = await db.Emprestimo.findAll({
                where: whereCondition,
                include: includeOptions,
                order: [['data_emprestimo', 'DESC']]
            });
            res.json(emprestimos);
        } catch (error) {
            console.error("Erro ao buscar empréstimos na API:", error);
            res.status(500).json({ error: 'Erro interno ao carregar empréstimos.' });
        }
    },
      async registrarDevolucao(req, res) {
    try {
        const { id } = req.params;
        if (req.usuarioToken.tipo !== 'ADMIN' && req.usuarioToken.tipo !== 'BIBLIOTECARIO') {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores e bibliotecários podem registrar devoluções.' });
        }

        const emprestimoExistente = await db.Emprestimo.findByPk(id); // Busca o empréstimo para pegar o id_livro

        if (!emprestimoExistente) {
            return res.status(404).json({ error: 'Empréstimo não encontrado.' });
        }
        if (emprestimoExistente.status !== 'PENDENTE') {
            return res.status(400).json({ error: 'Empréstimo não está no status ATIVO para devolução.' });
        }

        // 1. Atualiza o status do empréstimo
        await emprestimoExistente.update({ status: 'DEVOLVIDO', data_devolucao_real: new Date() });

        // 2. Atualiza status do livro para DISPONIVEL, usando o id_livro diretamente do empréstimo
        await db.Livro.update(
            { status: 'DISPONIVEL' }, 
            { where: { id_livro: emprestimoExistente.id_livro } } // Usa id_livro diretamente
        );
        
        return res.status(200).json({ message: 'Devolução registrada com sucesso.' });
    } catch (error) {
        console.error("Erro no backend ao registrar devolução:", error);
        res.status(500).json({ error: 'Erro interno ao registrar devolução.' });
        }
    }
}
