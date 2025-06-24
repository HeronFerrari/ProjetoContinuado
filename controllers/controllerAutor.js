const db = require('../config/db_sequelize');

module.exports = {

  async getList(req, res) {
    if (!req.session.usuario) {
      return res.redirect('/home');
    }
    try {
      const autores = await db.Autor.findAll({ order: [['nome', 'ASC']] });
      // Passando o usuário logado para o header funcionar corretamente.
      res.render('autor/autorList', { 
        autores: autores.map(a => a.toJSON()),
        usuario: req.session.usuario 
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao listar autores.");
    }
  },

  async getCreate(req, res) {
    // Apenas ADMIN e BIBLIOTECARIO podem acessar a página de criação.
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.redirect('/home');
    }
    res.render('autor/autorCreate', { usuario: req.session.usuario });
  },

  async postCreate(req, res) {
    // Apenas ADMIN e BIBLIOTECARIO podem criar.
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.status(403).send('Acesso negado.');
    }
    try {
      await db.Autor.create({
        nome: req.body.nome
      });
      // Mantendo seu redirecionamento para a criação de livro.
      res.redirect('/livroCreate');
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao cadastrar autor.");
    }
  },

  async getUpdate(req, res){
    // Apenas ADMIN e BIBLIOTECARIO podem acessar a página de edição.
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.redirect('/home');
    }
    try {
      const autor = await db.Autor.findByPk(req.params.id_autor);
      if (!autor) {
          return res.status(404).send("Autor não encontrado.");
      }
      res.render('autor/autorUpdate', { 
        autor: autor.toJSON(),
        usuario: req.session.usuario
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao buscar autor para atualização.");
    }
  },
  
  async postUpdate(req, res) {
    // Apenas ADMIN e BIBLIOTECARIO podem atualizar.
    if (!req.session.usuario || (req.session.usuario.tipo !== 'ADMIN' && req.session.usuario.tipo !== 'BIBLIOTECARIO')) {
      return res.status(403).send('Acesso negado.');
    }
    try {
      // Usando req.body.id_autor que vem do formulário (input hidden)
      await db.Autor.update(
        { nome: req.body.nome },
        { where: { id_autor: req.body.id_autor } }
      );
      res.redirect('/autorList');
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao atualizar autor.");
    }
  },
  
  // MUDAMOS DE getDelete para postDelete!
  async postDelete(req, res) {
    // Apenas ADMIN pode deletar um autor, para maior segurança.
    if (!req.session.usuario || req.session.usuario.tipo !== 'ADMIN') {
      return res.status(403).send('Acesso negado.');
    }
    try {
      // Usando o id que vem do corpo do formulário
      await db.Autor.destroy({ where: { id_autor: req.body.id_autor } });
      res.redirect('/autorList');
    } catch (err) {
      console.log(err);
      res.status(500).send("Erro ao excluir autor.");
    }
  }
};