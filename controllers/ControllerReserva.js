const db = require('../config/db_sequelize');

module.exports = {

  // --- CRIAR UMA NOVA RESERVA (usando Sequelize) ---
  async criarReserva(req, res) {
    try {
      // 1. Garante que o usuário está logado
      if (!req.session.usuario) {
        return res.status(401).send("Você precisa estar logado para reservar um livro.");
      }
      
      const id_usuario = req.session.usuario.id;
      const { id_livro } = req.body;
      
      // 2. Verifica se o livro existe e se está realmente emprestado
      const livro = await db.Livro.findByPk(id_livro);
      if (!livro) {
        return res.status(404).send("Livro não encontrado.");
      }
      if (livro.status === 'DISPONIVEL') {
        return res.status(400).send("Este livro está disponível para empréstimo, não precisa ser reservado.");
      }

      // Adicional: verificar se o usuário já não tem uma reserva para este livro
      const reservaExistente = await db.Reserva.findOne({ where: { id_usuario, id_livro, status: 'ATIVA' } });
      if (reservaExistente) {
        return res.status(400).send("Você já possui uma reserva ativa para este livro.");
      }

      // 3. Cria a reserva no banco de dados PostgreSQL
      await db.Reserva.create({
        id_usuario: id_usuario,
        id_livro: id_livro,
        status: 'ATIVA' // Assumindo que seu modelo Reserva tem este campo
      });

      // 4. Redireciona para a página de reservas do usuário
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