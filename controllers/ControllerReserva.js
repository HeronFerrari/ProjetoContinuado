const db = require('../config/db_sequelize');

module.exports = {

  // --- CRIAR UMA NOVA RESERVA (usando Sequelize) ---
 // controllers/controllerReserva.js

  async criarReserva(req, res) {
    try {
        // 1. Verificações de segurança e de sessão
        if (!req.session.usuario) {
            return res.status(401).send("Você precisa estar logado para reservar um livro.");
        }

        const id_usuario = req.session.usuario.id;
        const { id_livro } = req.body;

        const livro = await db.Livro.findByPk(id_livro);
        if (!livro) {
            return res.status(404).send("Livro não encontrado.");
        }

        if (livro.status === 'DISPONIVEL') {
            return res.status(400).send("Este livro está disponível para empréstimo, não para reserva.");
        }

        const emprestimoAtual = await db.Emprestimo.findOne({ where: { id_livro, id_usuario, status: 'PENDENTE' } });
        if (emprestimoAtual) {
            return res.status(400).send("Você não pode reservar um livro que já está emprestado para você.");
        }

        const reservaExistente = await db.Reserva.findOne({ where: { id_livro, id_usuario, status: 'ATIVA' } });
        if (reservaExistente) {
            return res.status(400).send("Você já está na fila de espera para este livro.");
        }

        // 4. Criação da Reserva
        // Se todas as regras passaram, criamos a reserva.
        const transacao = await db.sequelize.transaction();
        await db.Reserva.create({
            id_usuario: id_usuario,
            id_livro: id_livro,
            data_reserva: new Date(),
            status: 'ATIVA'
        }, { transaction: transacao });

        // 6. Redirecionamento
        res.redirect('/minhas-reservas');

    } catch (err) {
        console.log(err);
        res.status(500).send('Erro ao registrar reserva.');
    }
  },
  // --- LISTAR TODAS AS RESERVAS (ADMIN/BIBLIO) ---
  async getList(req, res) {
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.redirect('/home');
    }
    try {
      const reservas = await db.Reserva.findAll({
        include: [
          { model: db.Usuario, attributes: ['login'] },
          { model: db.Livro, attributes: ['titulo'] }
        ],
        order: [['data_reserva', 'ASC']]
      });
      res.render('reserva/reservaList', { 
        reservas: reservas.map(r => r.toJSON()),
        usuario: req.session.usuario 
      });
    } catch (err) {
      console.log(err);
      res.status(500).send('Erro ao listar reservas.');
    }
  },

  // --- LISTAR RESERVAS DO USUÁRIO LOGADO (LEITOR) ---
  async getMinhasReservas(req, res) {
    if (!req.session.usuario) {
      return res.redirect('/login');
    }
    try {
      const reservas = await db.Reserva.findAll({
        where: { id_usuario: req.session.usuario.id },
        include: [{ model: db.Livro, attributes: ['titulo'] }],
        order: [['data_reserva', 'ASC']]
      });
      res.render('reserva/minhasReservas', { 
        reservas: reservas.map(r => r.toJSON()),
        usuario: req.session.usuario
      });
    } catch (err) {
        console.log(err);
        res.status(500).send('Erro ao buscar suas reservas.');
    }
  },

  // --- DELETAR UMA RESERVA (COM POST E Sequelize) ---
  async postDelete(req, res) {
    try {
      const usuarioLogado = req.session.usuario;
      const idReserva = req.body.id_reserva;

      if (!usuarioLogado) {
        return res.status(401).send("Acesso negado.");
      }

      const reserva = await db.Reserva.findByPk(idReserva);
      if (!reserva) {
        return res.status(404).send("Reserva não encontrada.");
      }

      // REGRA: Apenas o dono da reserva ou um admin podem deletar.
      if (reserva.id_usuario !== usuarioLogado.id && usuarioLogado.tipo !== 'ADMIN') {
        return res.status(403).send("Você não tem permissão para cancelar esta reserva.");
      }
      
      // Usa o método .destroy() do Sequelize
      await reserva.destroy();

      res.redirect('/minhas-reservas');
    } catch (err) {
      console.log(err);
      res.status(500).send('Erro ao cancelar reserva.');
    }
  }
};