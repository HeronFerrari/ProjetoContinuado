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
        return res.status(401).send("Você precisa estar logado para fazer um empréstimo.");
      }

      const id_usuario = req.session.usuario.id; // <-- BUG CORRIGIDO AQUI
      const { id_livro } = req.body;

      // 1. Encontrar o livro e verificar seu status
      const livro = await db.Livro.findByPk(id_livro);
      if (!livro || livro.status !== 'DISPONIVEL') {
        return res.status(400).send("Este livro não está disponível para empréstimo.");
      }
      
      // Lógica de negócio futura: verificar limite de empréstimos, etc.

      // 2. Criar o registro do empréstimo
      await db.Emprestimo.create({
        id_livro: id_livro,
        id_usuario: id_usuario,
        data_devolucao_prevista: calcularDataDevolucao(),
        status: 'PENDENTE' // Usando o status do ENUM do nosso modelo
      });

      // 3. Atualizar o status do livro para 'EMPRESTADO'
      await livro.update({ status: 'EMPRESTADO' });

      // 4. Redirecionar para a página que mostra os empréstimos do usuário
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
    // REGRA: Apenas Admin/Bibliotecário podem registrar uma devolução.
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.status(403).send("Acesso negado.");
    }
    try {
      const { id_emprestimo } = req.body;
    
      // 1. Busca o empréstimo para garantir que ele existe e está pendente
      const emprestimo = await db.Emprestimo.findByPk(id_emprestimo);

      if (!emprestimo || emprestimo.status !== 'PENDENTE') {
        return res.status(404).send('Empréstimo não encontrado ou já consta como devolvido.');
      }
    
      //debugging
      console.log('--- DEBUG DA DEVOLUÇÃO ---');
      console.log('EMPRÉSTIMO ANTES DO UPDATE:', emprestimo.toJSON());

      // 2. ATUALIZA O REGISTRO DO EMPRÉSTIMO
      // Preenche a data de devolução real E muda o status para 'DEVOLVIDO'
      await emprestimo.update({
        data_devolucao_efetiva: new Date(),
        status: 'DEVOLVIDO' // <-- A CORREÇÃO CRUCIAL ESTÁ AQUI
      });
      
      // Vamos buscar o registro de novo para ter certeza do que foi salvo no banco
      const emprestimoDepoisDoUpdate = await db.Emprestimo.findByPk(id_emprestimo);
      console.log('EMPRÉSTIMO DEPOIS DO UPDATE (DO BANCO):', emprestimoDepoisDoUpdate.toJSON());
      console.log('--------------------------');

      // 3. ATUALIZA O LIVRO para que ele fique disponível para outros usuários
      await db.Livro.update(
        { status: 'DISPONIVEL' }, 
        { where: { id_livro: emprestimo.id_livro }}
      );

    // Lógica futura: notificar o próximo da fila de reserva, se houver.

    // Redireciona para a lista geral de empréstimos (visão do admin)
    res.redirect('/emprestimoList');

  } catch (err) {
    console.log(err);
    res.status(500).send('Erro ao registrar devolução.');
  }
}

};