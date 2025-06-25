const db = require('../config/db_sequelize');

// Função para calcular a data de devolução (ex: 14 dias a partir de hoje)
const calcularDataDevolucao = () => {
  const data = new Date();
  data.setDate(data.getDate() + 14);
  return data;
};

module.exports = {

  // --- CRIAR UM NOVO EMPRÉSTIMO ---
  async criarEmprestimo(req, res) {
    try {
      if (!req.session.usuario) {
        return res.status(401).send("Você precisa estar logado.");
      }

      const id_usuario = req.session.usuario.id;
      const { id_livro } = req.body;
      const livro = await db.Livro.findByPk(id_livro);
      
      // Verifica se o livro está reservado para alguém
      const reservaPendente = await db.Reserva.findOne({ 
          where: { id_livro, status: 'AGUARDANDO_RETIRADA' } 
      });

      // REGRA 1: Se o livro está reservado para alguém, SÓ essa pessoa pode pegá-lo.
      if (livro.status === 'RESERVADO' && reservaPendente) {
        if (reservaPendente.id_usuario !== id_usuario) {
          return res.status(403).send("Este livro está reservado e aguardando a retirada de outro usuário.");
        }
        // Se for a pessoa certa, a reserva dela é marcada como 'ATENDIDA'.
        await reservaPendente.update({ status: 'ATENDIDA' });

      } else if (livro.status !== 'DISPONIVEL') {
        // REGRA 2: Se não está disponível e não é a sua reserva, você não pode pegar.
        return res.status(400).send("Este livro não está disponível para empréstimo.");
      }

      // Se passou nas regras, o empréstimo é criado.
      await db.Emprestimo.create({
        id_livro,
        id_usuario,
        data_devolucao_prevista: calcularDataDevolucao(),
        status: 'PENDENTE'
      });

      // O status do livro muda para 'EMPRESTADO'.
      await livro.update({ status: 'EMPRESTADO' });

      res.redirect('/meus-emprestimos');

    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao registrar o empréstimo.");
    }
  },


  // --- LISTAR TODOS OS EMPRÉSTIMOS (VISÃO DO ADMIN/BIBLIOTECÁRIO) ---
  async getList(req, res) {
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.redirect('/home');
    }
    try {
      const emprestimos = await db.Emprestimo.findAll({
        include: [
          { model: db.Usuario, attributes: ['login'] }, 
          { 
            model: db.Livro, 
            attributes: ['titulo'],
            include: [{ model: db.Reserva, where: { status : 'ATIVA' }, required: false }] // Inclui reservas ativas, se houver
           }
        ],
        order: [['data_emprestimo', 'DESC']]
      });
      res.render('emprestimo/emprestimoList', {
        emprestimos: emprestimos.map(e => e.toJSON()),
        usuario: req.session.usuario
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao carregar a lista de empréstimos.");
    }
  },

  // --- LISTAR EMPRÉSTIMOS DO USUÁRIO LOGADO (VISÃO DO LEITOR) ---
  async getMeusEmprestimos(req, res) {
    if (!req.session.usuario) {
      return res.redirect('/login');
    }
    try {
      const emprestimos = await db.Emprestimo.findAll({
        where: { 
          id_usuario: req.session.usuario.id, 
          status: 'PENDENTE' 
        }, // <-- Filtro para pegar apenas os empréstimos pendentes
        include: [{ model: db.Livro, attributes: ['titulo'] }],
        order: [['data_emprestimo', 'DESC']]
      });

    //debugging
    console.log('--- DEBUG DA PÁGINA MEUS EMPRÉSTIMOS ---');
    console.log(`Buscando empréstimos PENDENTES para o usuário ID: ${req.session.usuario.id}`);
    // Vamos ver o que a busca realmente retornou
    console.log('EMPRÉSTIMOS ENCONTRADOS:', emprestimos.map(e => e.toJSON()));
    console.log('------------------------------------');
    //fim de debugging

      res.render('emprestimo/meusEmprestimos', {
        emprestimos: emprestimos.map(e => e.toJSON()),
        usuario: req.session.usuario
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao buscar seus empréstimos.");
    }
  },

  // --- REGISTRAR UMA DEVOLUÇÃO ---
   async devolverLivro(req, res) {
    try {
        // ... (verificação de permissão de admin/biblio) ...
        const { id_emprestimo } = req.body;
        const emprestimo = await db.Emprestimo.findByPk(id_emprestimo);

        if (!emprestimo || emprestimo.status !== 'PENDENTE') {
            return res.status(404).send('Empréstimo não encontrado ou já devolvido.');
        }

        // Marca o empréstimo como 'DEVOLVIDO'
        await emprestimo.update({
            data_devolucao_efetiva: new Date(),
            status: 'DEVOLVIDO'
        });

        // --- A MÁGICA DA FILA ACONTECE AQUI ---
        // 1. Procura o PRÓXIMO da fila de espera (o mais antigo com status 'ATIVA').
        const proximaReserva = await db.Reserva.findOne({
            where: { id_livro: emprestimo.id_livro, status: 'ATIVA' },
            order: [['data_reserva', 'ASC']]
        });

        // 2. Se EXISTE alguém na fila...
        if (proximaReserva) {
            // O livro fica com status 'RESERVADO' (guardado para a próxima pessoa).
            await db.Livro.update({ status: 'RESERVADO' }, { where: { id_livro: emprestimo.id_livro } });
            
            // A reserva dessa pessoa muda para 'AGUARDANDO_RETIRADA'.
            await proximaReserva.update({ status: 'AGUARDANDO_RETIRADA' });

            console.log(`Livro ID ${emprestimo.id_livro} devolvido. Notificando usuário da reserva ID ${proximaReserva.id_reserva}.`);

        } else {
            // 3. Se NÃO existe ninguém na fila, o livro fica DISPONÍVEL para todos.
            await db.Livro.update({ status: 'DISPONIVEL' }, { where: { id_livro: emprestimo.id_livro } });
        }

        res.redirect('/emprestimoList');
    } catch (err) {
        console.log(err);
        res.status(500).send('Erro ao registrar devolução.');
    }
  }


}