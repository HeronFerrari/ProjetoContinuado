const db = require('../config/db_sequelize');

module.exports = {

 // controllers/controllerReserva.js

  async criarReserva(req, res) {
  // 1. Inicia UMA ÚNICA transação
  const t = await db.sequelize.transaction();

  try {
    // Verificações de segurança (usando a transação 't')
    if (!req.session.usuario) {
      await t.rollback();
      return res.status(401).send("Você precisa estar logado para reservar um livro.");
    }
    const id_usuario = req.session.usuario.id;
    const { id_livro } = req.body;
    const livro = await db.Livro.findByPk(id_livro, { transaction: t });

    if (!livro) {
      await t.rollback();
      return res.status(404).send("Livro não encontrado.");
    }
    if (livro.status === 'DISPONIVEL') {
      await t.rollback();
      return res.status(400).send("Este livro está disponível para empréstimo, não para reserva.");
    }
    const emprestimoAtual = await db.Emprestimo.findOne({ where: { id_livro, id_usuario, status: 'PENDENTE' }, transaction: t });
    if (emprestimoAtual) {
      await t.rollback();
      return res.status(400).send("Você não pode reservar um livro que já está emprestado para você.");
    }
    const reservaExistente = await db.Reserva.findOne({
  where: {
    id_livro: id_livro,
    id_usuario: id_usuario,
    status: ['ATIVA', 'AGUARDANDO_RETIRADA'] // Verifica ambos os status
  },
  transaction: t
});

if (reservaExistente) {
  await t.rollback();
  // Mensagem de erro amigável que explica a situação
  if (reservaExistente.status === 'AGUARDANDO_RETIRADA') {
    return res.status(400).send("Ação negada. Este livro já está aguardando sua retirada no balcão.");
  }
  return res.status(400).send("Ação negada. Você já está na fila de espera para este livro.");
}

    // 2. Cria a reserva usando a MESMA transação 't'
    await db.Reserva.create({
      id_usuario: id_usuario,
      id_livro: id_livro,
      data_reserva: new Date(),
      status: 'ATIVA'
    }, { transaction: t });

    // 3. Atualiza o status do livro para 'RESERVADO' usando a MESMA transação 't'
    await db.Livro.update({ status: 'RESERVADO' }, { where: { id_livro: id_livro }, transaction: t });

    // 4. Salva permanentemente todas as operações da transação no banco
    await t.commit();

    // 5. Agora, redireciona o usuário com uma mensagem de sucesso
    res.redirect('/minhas-reservas?sucesso=Reserva realizada com sucesso!');

  } catch (err) {
    // Se qualquer passo falhar, desfaz TODAS as operações da transação 't'
    await t.rollback();
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
        { 
          model: db.Usuario, 
          attributes: ['login', 'nome', 'sobrenome'] 
        },
        { 
          model: db.Livro, as: 'Livro',
          attributes: ['titulo'] 
        }
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
        include: [{ model: db.Livro, as: 'Livro', attributes: ['titulo'] }],
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

  async postExpireReserva(req, res) {
  // Inicia uma transação segura
  const t = await db.sequelize.transaction();

  try {
    // Garante que apenas Admin ou Bibliotecário possam fazer isso
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      await t.rollback();
      return res.status(403).send("Acesso negado.");
    }

    const { id_reserva } = req.body;
    const reservaParaExpirar = await db.Reserva.findByPk(id_reserva, { transaction: t });

    if (!reservaParaExpirar || reservaParaExpirar.status !== 'AGUARDANDO_RETIRADA') {
      await t.rollback();
      return res.status(404).send('Reserva não encontrada ou não está no estado correto para ser expirada.');
    }
    
    // Etapa 1: Marca a reserva atual como 'EXPIRADA'
    await reservaParaExpirar.update({ status: 'EXPIRADA' }, { transaction: t });
    
    const id_livro = reservaParaExpirar.id_livro;

    // Etapa 2: Procura o PRÓXIMO da fila de espera para este mesmo livro
    const proximaReserva = await db.Reserva.findOne({
      where: { id_livro: id_livro, status: 'ATIVA' },
      order: [['data_reserva', 'ASC']],
      transaction: t
    });

    // Etapa 3: Decide o que fazer com o livro e a próxima reserva
    if (proximaReserva) {
      // Se há um próximo na fila, o livro continua 'RESERVADO', mas agora para outra pessoa.
      // E a reserva dessa pessoa é atualizada para 'AGUARDANDO_RETIRADA'.
      await proximaReserva.update({ status: 'AGUARDANDO_RETIRADA' }, { transaction: t });
      console.log(`Reserva ${id_reserva} expirou. Notificando próximo da fila: reserva ${proximaReserva.id_reserva}.`);
    } else {
      // Se não há mais ninguém na fila, o livro volta para a prateleira.
      await db.Livro.update({ status: 'DISPONIVEL' }, { where: { id_livro: id_livro }, transaction: t });
    }

    // Se tudo deu certo, salva todas as operações
    await t.commit();
    res.redirect('/reservaList?sucesso=Reserva marcada como expirada com sucesso!');

  } catch (err) {
    // Se algo deu errado, desfaz tudo
    await t.rollback();
    console.log(err);
    res.status(500).send("Erro ao processar a expiração da reserva.");
  }
},

async postDelete(req, res) {
  const t = await db.sequelize.transaction(); // Usando transação para segurança
  try {
    const usuarioLogado = req.session.usuario;
    const idReserva = req.body.id_reserva;

    if (!usuarioLogado) {
      await t.rollback();
      return res.status(401).send("Acesso negado.");
    }

    const reserva = await db.Reserva.findByPk(idReserva, { transaction: t });
    if (!reserva) {
      await t.rollback();
      return res.status(404).send("Reserva não encontrada.");
    }
    
    // REGRA de permissão (já estava correta)
    if (reserva.id_usuario !== usuarioLogado.id && usuarioLogado.tipo !== 'ADMIN') {
      await t.rollback();
      return res.status(403).send("Você não tem permissão para cancelar esta reserva.");
    }
    
    const id_livro_reservado = reserva.id_livro;

    // 1. Deleta a reserva
    await reserva.destroy({ transaction: t });

    // 2. CORREÇÃO: Verifica se existe algum outro empréstimo PENDENTE para este livro.
    const emprestimoAindaAtivo = await db.Emprestimo.findOne({
      where: { id_livro: id_livro_reservado, status: 'PENDENTE' },
      transaction: t
    });

    // 3. Se NÃO houver empréstimo ativo, significa que o livro estava guardado no balcão e agora deve ficar disponível.
    if (!emprestimoAindaAtivo) {
      await db.Livro.update({ status: 'DISPONIVEL' }, { where: { id_livro: id_livro_reservado }, transaction: t });
    }
    // Se houver um empréstimo ativo, não fazemos nada, pois o status do livro já é 'EMPRESTADO'.

    await t.commit(); // Salva todas as alterações
    res.redirect('/minhas-reservas?sucesso=Reserva cancelada com sucesso!');

  } catch (err) {
    await t.rollback(); // Desfaz tudo em caso de erro
    console.log(err);
    res.status(500).send('Erro ao cancelar reserva.');
  }
}

}