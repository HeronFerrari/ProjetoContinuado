// controllers/emprestimoController.js
const db = require('../config/db_sequelize');

module.exports= {

  async getCreate(req, res) {
    try {
      // Verifica se o usuário está logado
      if (!req.session.usuario) {
        return res.redirect('/login');
      }

      // Renderiza a página de criação de empréstimo
      res.render('emprestimo/emprestimoCreate', {
        usuario: req.session.usuario
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Erro ao carregar a página de criação de empréstimo.');
    }
  },

   async postCreate(req, res) {
    try {
      if (!req.session.usuario) {
        return res.redirect('/login');
      }
      const id_usuario = req.session.usuario.id_usuario;
      const { id_livro } = req.body;

       // Antes de criar o empréstimo
      const reserva = await db.Reserva.findOne({
      where: { id_livro, atendida: false },
      order: [['createdAt', 'ASC']]
      });

      if (reserva && reserva.id_usuario !== req.session.usuario.id_usuario) {
        return res.status(400).send('Livro reservado para outro usuário.');
      }

      // 1. Limite de empréstimos ativos
      const emprestimosAtivos = await db.Emprestimo.count({
        where: { id_usuario, data_devolucao: null }
      });
      if (emprestimosAtivos >= 3) {
        return res.status(400).send('Limite de empréstimos atingido.');
      }

      // 2. Livro já emprestado?
      const emprestimoLivro = await db.Emprestimo.findOne({
        where: { id_livro, data_devolucao: null }
      });
      if (emprestimoLivro) {
        return res.status(400).send('Livro já está emprestado.');
      }

      if (reserva && reserva.id_usuario === req.session.usuario.id_usuario) {
        await db.Reserva.update(
          { atendida: true },
          { where: { id_reserva: reserva.id_reserva } }
        );
      }

      // 3. Registrar empréstimo
      await db.Emprestimo.create({
        id_usuario,
        id_livro,
        data_emprestimo: new Date()
      });
      res.send('Empréstimo registrado!');
    } catch (err) {
      res.status(500).send('Erro ao registrar empréstimo.');
    } 
  },

  async devolverLivro(req, res) {
    // Verifica se o usuário está logado
    if (!req.session.usuario) {
      return res.redirect('/login');
    }
    try {
      const { id_emprestimo } = req.body;
      const emprestimo = await db.Emprestimo.findByPk(id_emprestimo);
      if (!emprestimo) {
        return res.status(404).send('Empréstimo não encontrado.');
      }
      const id_livro = emprestimo.id_livro;

      await db.Emprestimo.update(
        { data_devolucao: new Date() },
        { where: { id: id_emprestimo } }
      );
      
      // Notifica o próximo da fila de reservas
      const proximaReserva = await db.Reserva.findOne({
        where: { id_livro, atendida: false },
        order: [['createdAt', 'ASC']]
      });
      if (proximaReserva) {
        await db.Notificacao.create({
          id_usuario: proximaReserva.id_usuario,
          mensagem: `O livro que você reservou está disponível para retirada!`
        });
        return res.send('Livro devolvido e notificação enviada ao próximo usuário na fila.');
      }

      res.send('Livro devolvido!');
    } catch (err) {
      res.status(500).send('Erro ao registrar devolução.');
    }
  }

};