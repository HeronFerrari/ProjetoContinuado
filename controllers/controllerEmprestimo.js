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
    const t = await db.sequelize.transaction(); 
    if (!req.session.usuario || (req.session.usuario.tipo !== 'LEITOR' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.status(403).send("Acesso negado.");
    }

    try {
      if (!req.session.usuario) {
        await t.rollback(); // Cancela a transação
        return res.status(401).send("Você precisa estar logado.");
      }

      const id_usuario = req.session.usuario.id;
      const { id_livro } = req.body;
      const livro = await db.Livro.findByPk(id_livro, { transaction: t });
      
      if (!livro) {
        await t.rollback(); // Cancela a transação
        return res.status(404).send("Livro não encontrado.");
      }

      const emprestimoExistente = await db.Emprestimo.findOne({
      where: {
        id_livro: id_livro,
        id_usuario: id_usuario,
        status: 'PENDENTE'
      },
      transaction: t
    });

      if (emprestimoExistente) {
      await t.rollback();
      return res.status(400).send("Operação negada. Você já possui um empréstimo ativo para este livro.");
    }

      if (livro.status === 'RESERVADO') {
      // Se o livro está reservado, primeiro encontramos para quem.
      const reservaAtiva = await db.Reserva.findOne({
        where: { id_livro: id_livro, status: 'AGUARDANDO_RETIRADA' },
        transaction: t
      });

      // Se não houver uma reserva aguardando ou se a reserva não for do usuário logado, negue.
      if (!reservaAtiva || reservaAtiva.id_usuario !== id_usuario) {
        await t.rollback();
        return res.status(403).send("Este livro está reservado e aguardando a retirada de outro usuário.");
      }

      await reservaAtiva.update({ status: 'ATENDIDA' }, { transaction: t });

      } else if (livro.status !== 'DISPONIVEL') {
      // Se não está DISPONÍVEL nem RESERVADO (ex: já está EMPRESTADO), nega.
      await t.rollback();
      return res.status(400).send("Este livro não está disponível para empréstimo no momento.");
      }

      // Se passou nas regras, o empréstimo é criado.
      await db.Emprestimo.create({
        id_livro: id_livro,
        id_usuario: id_usuario,
        data_devolucao_prevista: calcularDataDevolucao(),
        status: 'PENDENTE'
      }, { transaction: t });

      // O status do livro muda para 'EMPRESTADO'.
      await livro.update({ status: 'EMPRESTADO' }, { transaction: t });

      await t.commit(); 
      res.redirect('/meus-emprestimos');

    } catch (err) {
      await t.rollback(); // Cancela a transação em caso de erro
      console.log(err);
      res.status(500).send("Erro ao registrar o empréstimo.");
    }
  },


  // --- LISTAR TODOS OS EMPRÉSTIMOS (VISÃO DO ADMIN/BIBLIOTECÁRIO) ---
  async getList(req, res) {
  // A verificação de permissão continua a mesma
  if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
    return res.redirect('/home');
  }
  try {
    const emprestimos = await db.Emprestimo.findAll({

      include: [
        { 
          model: db.Usuario, 
          attributes: ['id', 'login', 'nome', 'sobrenome'] // <-- INCLUI O USUÁRIO
        }, 
        { 
          model: db.Livro, 
          attributes: ['titulo'] 
        }
      ],
      order: [['data_emprestimo', 'DESC']]
    });
    
    console.log('DADOS QUE SERÃO ENVIADOS PARA A VIEW:');
    console.log(JSON.stringify(emprestimos, null, 2)); 
    console.log('-----------------------------------------');

    res.render('emprestimo/emprestimoList', {
      emprestimos: emprestimos.map(e => e.toJSON()),
      usuario: req.session.usuario,
      sucesso: req.query.sucesso, 
      error: req.query.error
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro ao listar os empréstimos.");
  }
},
  // --- LISTAR EMPRÉSTIMOS DO USUÁRIO LOGADO (VISÃO DO LEITOR) ---
  async getMeusEmprestimos(req, res) {
    if (!req.session.usuario) {
      return res.redirect('/login');
    }
    try {
      const emprestimos = await db.Emprestimo.findAll({
        where: { id_usuario: req.session.usuario.id, status: 'PENDENTE' },
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
   // controllers/controllerEmprestimo.js

async devolverLivro(req, res) {
  console.log('--- INICIANDO PROCESSO DE DEVOLUÇÃO ---');
  const t = await db.sequelize.transaction();
  try {
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      await t.rollback();
      return res.status(403).send("Acesso negado.");
    }

    const { id_emprestimo } = req.body;
    const emprestimo = await db.Emprestimo.findByPk(id_emprestimo, { transaction: t });

    if (!emprestimo || emprestimo.status !== 'PENDENTE') {
      await t.rollback();
      return res.status(404).send('Empréstimo não encontrado ou já devolvido.');
    }
    
    await emprestimo.update({
      data_devolucao_efetiva: new Date(),
      status: 'DEVOLVIDO'
    }, { transaction: t });
    console.log(`PASSO A: Empréstimo ID ${id_emprestimo} atualizado para DEVOLVIDO.`);
    
    const id_livro_devolvido = emprestimo.id_livro;
    console.log(`PASSO B: Verificando reservas para o Livro ID ${id_livro_devolvido}...`);

    const proximaReserva = await db.Reserva.findOne({
        where: { id_livro: id_livro_devolvido, status: 'ATIVA' },
        order: [['data_reserva', 'ASC']],
        transaction: t
    });

    console.log(`PASSO C: Busca por reserva concluída. Reserva encontrada? ${!!proximaReserva}`); // !! transforma o resultado em true/false

    if (proximaReserva) {
      console.log(`PASSO D.1: Reserva encontrada (ID ${proximaReserva.id_reserva}). Atualizando Livro para RESERVADO.`);
      await db.Livro.update({ status: 'RESERVADO' }, { where: { id_livro: id_livro_devolvido }, transaction: t });
      
      console.log('PASSO D.2: Atualizando Reserva para AGUARDANDO_RETIRADA.');
      await proximaReserva.update({ status: 'AGUARDANDO_RETIRADA' }, { transaction: t });
    } else {
      console.log('PASSO E.1: Nenhuma reserva encontrada. Atualizando Livro para DISPONIVEL.');
      await db.Livro.update({ status: 'DISPONIVEL' }, { where: { id_livro: id_livro_devolvido }, transaction: t });
    }

    console.log('PASSO F: Commit da transação.');
    await t.commit();
    res.redirect('/emprestimoList?sucesso=Devolução registrada com sucesso!');

  } catch (err) {
    console.log('--- ERRO NO PROCESSO DE DEVOLUÇÃO ---');
    console.error(err);
    await t.rollback();
    res.status(500).send("Ocorreu um erro crítico ao processar a devolução.");
  }
},

async postDelete(req, res) {
  // REGRA DE SEGURANÇA: Apenas ADMIN pode realizar esta ação destrutiva.
  if (!req.session.usuario || req.session.usuario.tipo !== 'ADMIN') {
    return res.status(403).send("Acesso negado. Apenas administradores podem forçar a exclusão.");
  }
  
  console.log('Tentando deletar empréstimo com o corpo da requisição:', req.body);
  const t = await db.sequelize.transaction();
  try {
    const { id_emprestimo } = req.body;
    
    // Antes de deletar, precisamos pegar os dados do empréstimo para saber qual livro liberar
    const emprestimo = await db.Emprestimo.findByPk(id_emprestimo, { transaction: t });
    if (!emprestimo) {
      await t.rollback();
      return res.status(404).send('Registro de empréstimo não encontrado para exclusão.');
    }
    const id_livro_a_liberar = emprestimo.id_livro;

    // 1. Deleta o registro do empréstimo
    await emprestimo.destroy({ transaction: t });

    // 2. IMPORTANTE: Atualiza o status do livro para 'DISPONIVEL'
    // Isso garante que o livro não fique "preso" no estado de emprestado.
    await db.Livro.update(
      { status: 'DISPONIVEL' },
      { where: { id_livro: id_livro_a_liberar }, transaction: t }
    );
    
    // (Opcional) Poderíamos também cancelar qualquer reserva ativa para este livro
    await db.Reserva.destroy({ 
        where: { id_livro: id_livro_a_liberar, status: 'ATIVA' },
        transaction: t
    });

    await t.commit();
    res.redirect('/emprestimoList?sucesso=Registro de empréstimo excluído com sucesso!');

  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).send("Erro ao tentar excluir o registro de empréstimo.");
  }
},



}